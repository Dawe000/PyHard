import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { YStack, XStack } from 'tamagui';
import QRCode from 'react-native-qrcode-svg';
import { usePrivy, getUserEmbeddedEthereumWallet } from '@privy-io/expo';
import { createPaymentRequestQR, encodeQRData, parseAmount, formatAmount } from '@/utils/qrCodeUtils';
import { getOrCreateSmartWallet } from '@/services/smartWallet';
import { createPrivyClient } from '@privy-io/expo';
import Constants from "expo-constants";

interface ReceiveScreenProps {
  onClose: () => void;
}

export const ReceiveScreen: React.FC<ReceiveScreenProps> = ({ onClose }) => {
  const [amount, setAmount] = useState('');
  const [qrData, setQrData] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = usePrivy();
  const account = getUserEmbeddedEthereumWallet(user);

  const generateQR = useCallback(async () => {
    if (!amount || !account?.address || !user?.id) {
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
      // Get SmartWallet address (same as in PaymentConfirmationScreen)
      const privyClient = createPrivyClient(Constants.expoConfig?.extra?.privyAppId as string);
      const accessToken = await privyClient.getAccessToken();
      if (!accessToken) {
        throw new Error("Failed to get Privy access token.");
      }

      const smartWalletInfo = await getOrCreateSmartWallet(account.address, accessToken);
      const smartWalletAddress = smartWalletInfo.address;

      if (!smartWalletAddress) {
        throw new Error("Failed to get SmartWallet address.");
      }

      const paymentRequest = createPaymentRequestQR(smartWalletAddress, amount);
      const qrString = encodeQRData(paymentRequest);
      setQrData(qrString);
    } catch (error) {
      console.error('Error generating QR code:', error);
      Alert.alert('Error', 'Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [amount, account?.address, user?.id]);

  const copyAddress = async () => {
    if (account?.address) {
      await navigator.clipboard.writeText(account.address);
      Alert.alert('Copied', 'Wallet address copied to clipboard');
    }
  };

  const resetQR = () => {
    setQrData(null);
    setAmount('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color="#0079c1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Payment</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {!qrData ? (
          <View style={styles.inputContainer}>
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
                  placeholder="0.00"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  keyboardType="numeric"
                  autoFocus
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.generateButton, (!amount || isGenerating) && styles.generateButtonDisabled]}
              onPress={generateQR}
              disabled={!amount || isGenerating}
            >
              <Ionicons name="qr-code" size={20} color="white" />
              <Text style={styles.generateButtonText}>
                {isGenerating ? 'Generating...' : 'Generate QR Code'}
              </Text>
            </TouchableOpacity>

            <View style={styles.walletInfo}>
              <Text style={styles.walletLabel}>Your Wallet Address</Text>
              <TouchableOpacity onPress={copyAddress}>
                <XStack alignItems="center" gap={8} padding={12} backgroundColor="rgba(0,121,193,0.1)" borderRadius={8}>
                  <Text style={styles.walletAddress}>
                    {account?.address ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}` : 'Loading...'}
                  </Text>
                  <Ionicons name="copy-outline" size={16} color="#0079c1" />
                </XStack>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.qrContainer}>
            <Text style={styles.title}>Payment Request</Text>
            <Text style={styles.subtitle}>
              Share this QR code to receive {amount} PYUSD
            </Text>

            <LinearGradient
              colors={['rgba(0,121,193,0.1)', 'rgba(0,48,135,0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.qrWrapper}
            >
              <View style={styles.qrCodeContainer}>
                <QRCode
                  value={qrData}
                  size={200}
                  color="#0079c1"
                  backgroundColor="transparent"
                />
              </View>
            </LinearGradient>

            <View style={styles.paymentDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount</Text>
                <Text style={styles.detailValue}>{amount} PYUSD</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Recipient</Text>
                <Text style={styles.detailValue}>
                  {account?.address ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}` : ''}
                </Text>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.resetButton} onPress={resetQR}>
                <Ionicons name="refresh" size={20} color="#0079c1" />
                <Text style={styles.resetButtonText}>Create New Request</Text>
              </TouchableOpacity>
            </View>
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
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
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
  amountInputContainer: {
    marginBottom: 32,
  },
  amountLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,121,193,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  currencySymbol: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.6)',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    color: 'white',
    fontFamily: 'SpaceMono_400Regular',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0079c1',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 32,
  },
  generateButtonDisabled: {
    backgroundColor: 'rgba(0,121,193,0.3)',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  walletInfo: {
    marginTop: 20,
  },
  walletLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  walletAddress: {
    fontSize: 14,
    color: '#0079c1',
    fontFamily: 'SpaceMono_400Regular',
  },
  qrContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrWrapper: {
    borderRadius: 20,
    padding: 2,
    marginBottom: 24,
  },
  qrCodeContainer: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentDetails: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  detailValue: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'SpaceMono_400Regular',
  },
  buttonContainer: {
    width: '100%',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,121,193,0.1)',
    borderWidth: 1,
    borderColor: '#0079c1',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  resetButtonText: {
    color: '#0079c1',
    fontSize: 16,
    fontWeight: '600',
  },
});
