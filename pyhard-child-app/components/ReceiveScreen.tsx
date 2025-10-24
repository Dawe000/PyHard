import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  SafeAreaView,
  ScrollView,
  ActivityIndicator 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { createPaymentRequestQR, encodeQRData } from '../utils/qrCodeUtils';
import { ParentWalletInfo } from '../services/subWalletDetection';

interface ReceiveScreenProps {
  onClose: () => void;
  walletInfo: ParentWalletInfo | null;
}

export const ReceiveScreen: React.FC<ReceiveScreenProps> = ({ onClose, walletInfo }) => {
  const [amount, setAmount] = useState('');
  const [qrData, setQrData] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQR = useCallback(async () => {
    if (!amount || !walletInfo?.smartWalletAddress) {
      Alert.alert('Error', 'Please enter an amount and ensure your wallet is ready.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount greater than 0.');
      return;
    }

    setIsGenerating(true);
    
    try {
      const paymentRequest = createPaymentRequestQR(walletInfo.smartWalletAddress, amount);
      const qrString = encodeQRData(paymentRequest);
      setQrData(qrString);
    } catch (error) {
      console.error('Error generating QR code:', error);
      Alert.alert('Error', 'Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [amount, walletInfo?.smartWalletAddress]);

  const resetQR = () => {
    setQrData(null);
    setAmount('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0a0e27', '#1a1f3a', '#0a0e27']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color="#0079c1" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request Payment</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!qrData ? (
            <View style={styles.inputContainer}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={['#0079c1', '#00a8e8']}
                  style={styles.iconGradient}
                >
                  <Ionicons name="qr-code" size={48} color="#fff" />
                </LinearGradient>
              </View>

              <Text style={styles.title}>Create Payment Request</Text>
              <Text style={styles.subtitle}>
                Enter the amount you want to request
              </Text>

              <View style={styles.amountInputContainer}>
                <Text style={styles.amountLabel}>Amount (PYUSD)</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.generateButton, !amount && styles.generateButtonDisabled]}
                onPress={generateQR}
                disabled={!amount || isGenerating}
              >
                <LinearGradient
                  colors={amount ? ['#0079c1', '#00a8e8'] : ['#2a2e45', '#2a2e45']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isGenerating ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="qr-code-outline" size={20} color="#fff" />
                      <Text style={styles.generateButtonText}>Generate QR Code</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.qrContainer}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={['#0079c1', '#00a8e8']}
                  style={styles.iconGradient}
                >
                  <Ionicons name="checkmark-circle" size={48} color="#fff" />
                </LinearGradient>
              </View>

              <Text style={styles.title}>Show this QR Code</Text>
              <Text style={styles.subtitle}>
                Have someone scan this to send you PYUSD
              </Text>

              <View style={styles.qrWrapper}>
                <LinearGradient
                  colors={['rgba(0,121,193,0.1)', 'rgba(0,168,232,0.1)']}
                  style={styles.qrGradientBorder}
                >
                  <View style={styles.qrCodeBox}>
                    <QRCode
                      value={qrData}
                      size={220}
                      backgroundColor="white"
                      color="#0a0e27"
                    />
                  </View>
                </LinearGradient>
              </View>

              <View style={styles.amountDisplay}>
                <Text style={styles.amountDisplayLabel}>Requesting</Text>
                <Text style={styles.amountDisplayValue}>${amount} PYUSD</Text>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonSecondary]}
                  onPress={resetQR}
                >
                  <Ionicons name="refresh" size={20} color="#0079c1" />
                  <Text style={styles.actionButtonTextSecondary}>New Request</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,121,193,0.2)',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 20,
  },
  qrContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 20,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0079c1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  amountInputContainer: {
    width: '100%',
    marginBottom: 32,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,121,193,0.3)',
    paddingHorizontal: 20,
    height: 64,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0079c1',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    padding: 0,
  },
  generateButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0079c1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  generateButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonGradient: {
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  qrWrapper: {
    marginBottom: 24,
  },
  qrGradientBorder: {
    padding: 3,
    borderRadius: 24,
  },
  qrCodeBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  amountDisplay: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: 'rgba(0,121,193,0.1)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,121,193,0.3)',
  },
  amountDisplayLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  amountDisplayValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0079c1',
    letterSpacing: 0.5,
  },
  buttonRow: {
    width: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  actionButtonSecondary: {
    backgroundColor: 'rgba(0,121,193,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,121,193,0.3)',
  },
  actionButtonTextSecondary: {
    color: '#0079c1',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
