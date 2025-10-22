import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QRCodeData, formatAmount } from '@/utils/qrCodeUtils';
import { sendPYUSD } from '@/services/sendService';

interface PaymentConfirmationScreenProps {
  qrData: QRCodeData;
  onPaymentComplete: () => void;
  onCancel: () => void;
}

export const PaymentConfirmationScreen: React.FC<PaymentConfirmationScreenProps> = ({
  qrData,
  onPaymentComplete,
  onCancel
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { data } = qrData;
  const amount = formatAmount(data.amount);

  const handleAccept = async () => {
    setIsProcessing(true);
    
    try {
      console.log('🚀 Processing payment request...');
      console.log('📋 Payment details:', {
        recipient: data.smartWalletAddress,
        amount: data.amount,
        displayAmount: amount
      });

      // Call the existing sendPYUSD service
      const result = await sendPYUSD(
        data.smartWalletAddress,
        data.amount,
        '0' // value (ETH)
      );

      if (result.success) {
        console.log('✅ Payment successful:', result.transactionHash);
        Alert.alert(
          'Payment Successful!',
          `You have sent ${amount} PYUSD successfully.`,
          [
            {
              text: 'OK',
              onPress: onPaymentComplete
            }
          ]
        );
      } else {
        console.error('❌ Payment failed:', result.error);
        Alert.alert(
          'Payment Failed',
          result.error || 'An error occurred while processing the payment.',
          [
            { text: 'Try Again', onPress: () => setIsProcessing(false) },
            { text: 'Cancel', onPress: onCancel }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      Alert.alert(
        'Payment Error',
        'An unexpected error occurred. Please try again.',
        [
          { text: 'Try Again', onPress: () => setIsProcessing(false) },
          { text: 'Cancel', onPress: onCancel }
        ]
      );
    }
  };

  const handleReject = () => {
    Alert.alert(
      'Cancel Payment',
      'Are you sure you want to cancel this payment?',
      [
        { text: 'Keep Payment', style: 'cancel' },
        { text: 'Cancel Payment', onPress: onCancel }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Request</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="qr-code" size={48} color="#0079c1" />
        </View>

        <Text style={styles.title}>Payment Request Received</Text>
        <Text style={styles.subtitle}>
          You've been asked to make a payment
        </Text>

        <View style={styles.paymentDetails}>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount</Text>
            <Text style={styles.amount}>{amount} PYUSD</Text>
          </View>

          <View style={styles.recipientContainer}>
            <Text style={styles.recipientLabel}>Recipient</Text>
            <Text style={styles.recipientAddress}>
              {data.smartWalletAddress.slice(0, 6)}...{data.smartWalletAddress.slice(-4)}
            </Text>
          </View>

          <View style={styles.requestInfo}>
            <Text style={styles.requestLabel}>Request ID</Text>
            <Text style={styles.requestId}>
              {data.requestId.slice(0, 8)}...{data.requestId.slice(-4)}
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.rejectButton]}
            onPress={handleReject}
            disabled={isProcessing}
          >
            <Ionicons name="close" size={20} color="#FF3B30" />
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={handleAccept}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="checkmark" size={20} color="white" />
            )}
            <Text style={styles.acceptButtonText}>
              {isProcessing ? 'Processing...' : 'Accept & Pay'}
            </Text>
          </TouchableOpacity>
        </View>

        {isProcessing && (
          <View style={styles.processingContainer}>
            <Text style={styles.processingText}>
              Processing your payment...
            </Text>
            <Text style={styles.processingSubtext}>
              This may take a few moments
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,121,193,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 32,
  },
  paymentDetails: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0079c1',
  },
  recipientContainer: {
    marginBottom: 16,
  },
  recipientLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  recipientAddress: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'SpaceMono_400Regular',
  },
  requestInfo: {
    marginBottom: 0,
  },
  requestLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  requestId: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'SpaceMono_400Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  rejectButton: {
    backgroundColor: 'rgba(255,59,48,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.3)',
  },
  rejectButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#0079c1',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  processingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  processingText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  processingSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
});
