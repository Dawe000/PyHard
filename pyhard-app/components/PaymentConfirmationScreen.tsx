import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QRCodeData, formatAmount, parseAmount } from '@/utils/qrCodeUtils';
import { sendPYUSD } from '@/services/sendService';
import { getOrCreateSmartWallet } from '@/services/smartWallet';
import { usePrivy, getUserEmbeddedEthereumWallet } from '@privy-io/expo';
import { useAuthorizationSignature } from '@privy-io/expo';
import { createPrivyClient } from '@privy-io/expo';
import Constants from "expo-constants";
import { EOA_DELEGATION_ADDRESS, ARBITRUM_SEPOLIA_CHAIN_ID } from '@/constants/contracts';
import { YStack, XStack } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';

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
  
  // Add missing hooks
  const { user } = usePrivy();
  const account = getUserEmbeddedEthereumWallet(user);
  const { generateAuthorizationSignature } = useAuthorizationSignature();

  const handleAccept = async () => {
    if (!account?.address || !user?.id) {
      Alert.alert('Error', 'Wallet not connected. Please log in again.');
      return;
    }
    if (qrData.type !== 'payment_request') {
      Alert.alert('Error', 'Invalid QR code type for payment.');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log("🚀 Starting payment process:");
      console.log("  - EOA Address:", account.address);
      console.log("  - Recipient Address:", data.smartWalletAddress);
      console.log("  - Amount:", data.amount);

      // Step 1: Get wallet ID from account object (most reliable)
      console.log("📝 Getting wallet ID for EIP-7702 authorization...");
      console.log("🔍 Account object:", account);

      if (!account?.id) {
        console.log("❌ No wallet ID found in account object");
        console.log("🔍 Account object keys:", Object.keys(account || {}));
        throw new Error("No wallet ID found in account - please ensure you have a connected wallet");
      }

      const walletId = account.id;
      console.log("✅ Found wallet ID from account:", walletId);

      // Step 2: Get EIP-7702 authorization using REST API approach
      console.log("🔐 Getting EIP-7702 authorization using REST API...");

      const CHAIN_ID = 421614; // Arbitrum Sepolia

      // Get current EOA nonce to use in authorization
      console.log("🔍 Getting current EOA nonce...");
      const rpcUrl = "https://sepolia-rollup.arbitrum.io/rpc";
      const nonceResponse = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getTransactionCount',
          params: [account.address, 'latest'],
          id: 1
        })
      });
      const nonceResult = await nonceResponse.json();
      const currentNonce = parseInt(nonceResult.result, 16);
      console.log("✅ Current EOA nonce:", currentNonce);

      // Build the request payload for the Privy API
      const input = {
        version: 1 as const,
        url: `https://api.privy.io/v1/wallets/${walletId}/rpc`,
        method: 'POST' as const,
        headers: {
          'privy-app-id': 'cmgtb4vg702vqld0da5wktriq',
        },
        body: {
          method: 'eth_sign7702Authorization',
          params: {
            contract: "0x58b15c7291c316e0b3c8af875de54f07e0e4b05d", // EOADelegation V4 contract address
            chain_id: CHAIN_ID,
            nonce: currentNonce
          }
        }
      };

      console.log("🔍 Authorization request payload:", JSON.stringify(input, null, 2));

      // Step 3: Generate Privy authorization signature
      console.log("🔐 Generating Privy authorization signature...");
      const authorizationSignatureResult = await generateAuthorizationSignature(input);
      console.log("🔍 Authorization signature result:", authorizationSignatureResult);

      // Extract the signature string from the result object
      let authorizationSignature: string;
      if (typeof authorizationSignatureResult === 'string') {
        authorizationSignature = authorizationSignatureResult;
      } else if (typeof authorizationSignatureResult === 'object' && authorizationSignatureResult.signature) {
        authorizationSignature = authorizationSignatureResult.signature;
      } else {
        throw new Error(`Unexpected authorization signature format: ${JSON.stringify(authorizationSignatureResult)}`);
      }

      console.log("✅ Privy authorization signature extracted:", authorizationSignature);

      // Step 4: Get access token for the API call
      const privy = createPrivyClient({
        appId: 'cmgtb4vg702vqld0da5wktriq',
        clientId: 'client-WY6RdMvmLZHLWnPB2aNZAEshGmBTwtGUAx299bCthg7U9'
      });
      const accessToken = await privy.getAccessToken();

      // Step 5: Call Privy API to get EIP-7702 authorization
      console.log("🌐 Calling Privy API to get EIP-7702 authorization...");
      const response = await fetch(input.url, {
        method: input.method,
        headers: {
          ...input.headers,
          'Authorization': `Bearer ${accessToken}`,
          'privy-authorization-signature': authorizationSignature,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(input.body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Privy API error: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      const eip7702Authorization = result.data.authorization;
      console.log("✅ EIP-7702 authorization received:", JSON.stringify(eip7702Authorization, null, 2));
      
      // Wrap the authorization in the expected structure for sendService
      const authorizationWrapper = {
        data: {
          authorization: eip7702Authorization
        }
      };

      // Step 6: Get SmartWallet address
      const smartWalletInfo = await getOrCreateSmartWallet(account.address, accessToken);
      const smartWalletAddress = smartWalletInfo.address;

      if (!smartWalletAddress) {
        throw new Error("Failed to get SmartWallet address.");
      }

      // Step 7: Send the transaction to CF Worker
      console.log("🚀 Sending transaction to CF Worker...");

      try {
        const txResult = await sendPYUSD(
          account.address,
          smartWalletAddress,
          data.smartWalletAddress, // Recipient from QR
          data.amount, // Amount from QR (same format as regular send)
          authorizationWrapper // EIP-7702 authorization wrapped in expected structure
        );

        console.log("📥 Send result received:", txResult);

        if (txResult.success) {
          console.log("✅ Payment successful!");
          Alert.alert(
            "Payment Successful!",
            `You have sent ${amount} PYUSD successfully.`,
            [
              {
                text: "OK",
                onPress: onPaymentComplete
              },
            ]
          );
        } else {
          console.log("❌ Payment failed:", txResult.error);
          Alert.alert("Payment Failed", txResult.error || "Failed to send PYUSD");
        }
      } catch (authError: any) {
        console.error("❌ Error in sendPYUSD:", authError);
        Alert.alert("Payment Failed", authError.message || "An error occurred while processing the payment.");
      }
    } catch (error: any) {
      console.error('❌ Payment failed:', error);
      Alert.alert(
        'Payment Failed',
        error.message || 'An unexpected error occurred.',
        [
          { text: 'Try Again', onPress: () => setIsProcessing(false) },
          { text: 'Cancel', onPress: onCancel }
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const displayAmount = formatAmount(data.amount);
  const recipientAddress = data.smartWalletAddress;

  return (
    <LinearGradient
      colors={['#0a0e27', '#003087']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.fullScreenContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirm Payment</Text>
        </View>

        <YStack flex={1} justifyContent="center" alignItems="center" paddingHorizontal={20}>
          <LinearGradient
            colors={['rgba(0,121,193,0.3)', 'rgba(0,48,135,0.2)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <YStack style={styles.card}>
              <Ionicons name="wallet-outline" size={60} color="#0079c1" style={styles.icon} />
              <Text style={styles.title}>Payment Request</Text>
              <Text style={styles.amountText}>
                {displayAmount} <Text style={styles.currencyText}>PYUSD</Text>
              </Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>To</Text>
                <Text style={styles.detailValue}>{`${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Request ID</Text>
                <Text style={styles.detailValue}>{data.requestId.slice(0, 8)}...</Text>
              </View>

              <XStack width="100%" justifyContent="space-around" marginTop={30}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onCancel}
                  disabled={isProcessing}
                >
                  <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.acceptButton]}
                  onPress={handleAccept}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Accept</Text>
                  )}
                </TouchableOpacity>
              </XStack>
            </YStack>
          </LinearGradient>
        </YStack>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,121,193,0.2)',
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginLeft: -40, // Adjust to center title despite back button
  },
  cardGradient: {
    borderRadius: 20,
    padding: 2,
    width: '100%',
    maxWidth: 400,
  },
  card: {
    backgroundColor: 'rgba(10,14,39,0.8)',
    borderRadius: 18,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,121,193,0.3)',
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  amountText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 20,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  currencyText: {
    fontSize: 24,
    color: '#34C759',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  detailLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'SpaceMono_400Regular',
  },
  detailValue: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'SpaceMono_400Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 30,
    width: '100%',
    justifyContent: 'space-around',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  acceptButton: {
    backgroundColor: '#34C759',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
});