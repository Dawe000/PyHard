import React, { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { usePrivy, useEmbeddedEthereumWallet, useAuthorizationSignature } from "@privy-io/expo";
import { getUserEmbeddedEthereumWallet } from "@privy-io/expo";
import { createPrivyClient } from "@privy-io/expo";
import { sendPYUSD } from "@/services/sendService";
import { getOrCreateSmartWallet } from "@/services/smartWallet";
import { YStack, XStack, Text } from "tamagui";

interface SendScreenProps {
  onBack?: () => void;
}

const SendScreen = ({ onBack }: SendScreenProps = {}) => {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [smartWalletAddress, setSmartWalletAddress] = useState<string | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);

  const { user } = usePrivy();
  const { wallets } = useEmbeddedEthereumWallet();
  const { generateAuthorizationSignature } = useAuthorizationSignature();
  const account = getUserEmbeddedEthereumWallet(user);

  // Debug wallet information
  console.log("🔍 useEmbeddedEthereumWallet debug:");
  console.log("🔍 - wallets:", wallets);
  console.log("🔍 - user:", user);
  console.log("🔍 - account:", account);

  // Debug useAuthorizationSignature hook
  console.log("🔍 useAuthorizationSignature debug:");
  console.log("🔍 - generateAuthorizationSignature:", generateAuthorizationSignature);
  console.log("🔍 - generateAuthorizationSignature type:", typeof generateAuthorizationSignature);

  // Load SmartWallet address on mount
  useEffect(() => {
    const loadSmartWallet = async () => {
      if (!account?.address) return;

      try {
        setIsLoadingWallet(true);
        const walletInfo = await getOrCreateSmartWallet(account.address, "placeholder-token");
        setSmartWalletAddress(walletInfo.address);
      } catch (error) {
        console.error("Failed to load SmartWallet:", error);
      } finally {
        setIsLoadingWallet(false);
      }
    };

    loadSmartWallet();
  }, [account?.address]);

  const handleSend = useCallback(async () => {
    console.log("🎯 ===== SEND BUTTON CLICKED =====");
    console.log("🎯 Validations:");
    console.log("🎯  - isValidRecipient:", isValidRecipient);
    console.log("🎯  - isValidAmount:", isValidAmount);
    console.log("🎯  - isLoading:", isLoading);
    console.log("🎯  - smartWalletAddress:", smartWalletAddress);
    console.log("🎯  - account?.address:", account?.address);
    console.log("🎯  - recipientAddress:", recipientAddress);
    console.log("🎯  - amount:", amount);
    console.log("🎯  - wallets?.length:", wallets?.length);
    console.log("🎯  - user exists:", !!user);

    console.log("🔍 Send button pressed - starting validation...");
    console.log("🔍 Account address:", account?.address);
    console.log("🔍 SmartWallet address:", smartWalletAddress);
    console.log("🔍 Recipient address:", recipientAddress);
    console.log("🔍 Amount:", amount);

    if (!account?.address) {
      console.log("❌ Validation failed: Wallet not connected");
      Alert.alert("Error", "Wallet not connected");
      return;
    }

    // Note: We don't need to wait for the wallet hook to be ready since we have the wallet ID from the account object

    if (!smartWalletAddress) {
      console.log("❌ Validation failed: SmartWallet not ready");
      Alert.alert("Error", "SmartWallet not ready. Please wait and try again.");
      return;
    }

    if (!recipientAddress.trim()) {
      console.log("❌ Validation failed: No recipient address");
      Alert.alert("Error", "Please enter recipient address");
      return;
    }

    if (!amount.trim() || parseFloat(amount) <= 0) {
      console.log("❌ Validation failed: Invalid amount");
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    console.log("✅ All validations passed, starting send process...");
    setIsLoading(true);

    try {
      console.log("🚀 Starting send process:");
      console.log("  - EOA Address:", account.address);
      console.log("  - SmartWallet Address:", smartWalletAddress);
      console.log("  - Recipient Address:", recipientAddress);
      console.log("  - Amount:", amount);

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

      // Step 3: Send the signature to CF Worker for transaction submission
      console.log("🚀 Sending transaction to CF Worker...");

      try {
        const txResult = await sendPYUSD(
          account.address,
          smartWalletAddress,
          recipientAddress,
          amount,
          authorizationWrapper // EIP-7702 authorization wrapped in expected structure
        );

        console.log("📥 Send result received:", txResult);

        if (txResult.success) {
          console.log("✅ Send successful!");
          Alert.alert(
            "Success!",
            `Sent ${amount} PYUSD to ${recipientAddress.slice(0, 10)}...\n\nTransaction: ${txResult.transactionHash?.slice(0, 10)}...`,
            [
              {
                text: "OK",
                onPress: () => {
                  setRecipientAddress("");
                  setAmount("");
                },
              },
            ]
          );
        } else {
          console.log("❌ Send failed:", txResult.error);
          Alert.alert("Error", txResult.error || "Failed to send PYUSD");
        }
      } catch (authError: any) {
        console.error("❌ EIP-7702 authorization signing failed:", authError);
        Alert.alert("Error", `EIP-7702 signing failed: ${authError.message || "Unknown error"}`);
      }
    } catch (error: any) {
      console.error("❌ Send error caught:", error);
      console.error("❌ Error message:", error.message);
      console.error("❌ Error stack:", error.stack);
      Alert.alert("Error", error.message || "Failed to send PYUSD");
    } finally {
      setIsLoading(false);
      console.log("🏁 Send process completed");
    }
  }, [account?.address, smartWalletAddress, recipientAddress, amount, wallets, user]);

  const validateAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const isValidRecipient = validateAddress(recipientAddress);
  const isValidAmount = amount.trim() !== "" && parseFloat(amount) > 0;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <YStack paddingHorizontal={16} paddingTop={20} paddingBottom={20}>
            {onBack && (
              <TouchableOpacity onPress={onBack} style={{ marginBottom: 20 }}>
                <Ionicons name="arrow-back" size={24} color="#0079c1" />
              </TouchableOpacity>
            )}
            <YStack alignItems="center">
              <Text fontSize={28} fontWeight="700" color="#FFFFFF" fontFamily="SpaceGrotesk_700Bold" marginBottom={8}>
                SEND PYUSD
              </Text>
              <Text fontSize={14} color="rgba(255,255,255,0.6)" fontFamily="SpaceMono_400Regular" textAlign="center" lineHeight={20}>
                &gt; Send PYUSD from your SmartWallet with sponsored gas
              </Text>
            </YStack>
          </YStack>

          {/* Loading State */}
          {isLoadingWallet && (
            <YStack marginHorizontal={16} marginBottom={24} padding={16} backgroundColor="rgba(255,193,7,0.15)" borderRadius={12} alignItems="center">
              <Text fontSize={12} color="#FFB800" fontFamily="SpaceMono_400Regular">
                &gt; Loading your SmartWallet...
              </Text>
            </YStack>
          )}

          {/* Recipient Input */}
          <YStack marginHorizontal={16} marginBottom={24}>
            <Text fontSize={12} fontWeight="700" color="rgba(255,255,255,0.7)" fontFamily="SpaceGrotesk_700Bold" letterSpacing={1} marginBottom={8}>
              RECIPIENT ADDRESS
            </Text>
            <LinearGradient
              colors={!isValidRecipient && recipientAddress ? ['rgba(255,59,48,0.3)', 'rgba(255,59,48,0.15)'] : ['rgba(0,121,193,0.15)', 'rgba(0,121,193,0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 12, padding: 1 }}
            >
              <XStack
                backgroundColor="rgba(10,14,39,0.8)"
                borderRadius={11}
                paddingHorizontal={16}
                paddingVertical={16}
                alignItems="center"
                borderWidth={1}
                borderColor={!isValidRecipient && recipientAddress ? 'rgba(255,59,48,0.5)' : 'rgba(0,121,193,0.2)'}
              >
                <TextInput
                  style={styles.textInput}
                  placeholder="0x..."
                  value={recipientAddress}
                  onChangeText={setRecipientAddress}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  editable={!isLoadingWallet}
                />
                {isValidRecipient && (
                  <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                )}
              </XStack>
            </LinearGradient>
            {!isValidRecipient && recipientAddress && (
              <Text fontSize={12} color="#FF3B30" fontFamily="SpaceMono_400Regular" marginTop={6}>
                &gt; Invalid Ethereum address
              </Text>
            )}
          </YStack>

          {/* Amount Input */}
          <YStack marginHorizontal={16} marginBottom={24}>
            <Text fontSize={12} fontWeight="700" color="rgba(255,255,255,0.7)" fontFamily="SpaceGrotesk_700Bold" letterSpacing={1} marginBottom={8}>
              AMOUNT (PYUSD)
            </Text>
            <LinearGradient
              colors={!isValidAmount && amount ? ['rgba(255,59,48,0.3)', 'rgba(255,59,48,0.15)'] : ['rgba(0,121,193,0.15)', 'rgba(0,121,193,0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 12, padding: 1 }}
            >
              <XStack
                backgroundColor="rgba(10,14,39,0.8)"
                borderRadius={11}
                paddingHorizontal={16}
                paddingVertical={16}
                alignItems="center"
                borderWidth={1}
                borderColor={!isValidAmount && amount ? 'rgba(255,59,48,0.5)' : 'rgba(0,121,193,0.2)'}
              >
                <TextInput
                  style={styles.textInput}
                  placeholder="0.00"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  editable={!isLoadingWallet}
                />
                <Text fontSize={14} color="rgba(255,255,255,0.6)" fontFamily="SpaceGrotesk_600SemiBold">
                  PYUSD
                </Text>
              </XStack>
            </LinearGradient>
            {!isValidAmount && amount && (
              <Text fontSize={12} color="#FF3B30" fontFamily="SpaceMono_400Regular" marginTop={6}>
                &gt; Please enter a valid amount
              </Text>
            )}
          </YStack>

          {/* Transaction Summary */}
          {(isValidRecipient && isValidAmount) && (
            <YStack marginHorizontal={16} marginBottom={24}>
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 16, padding: 1 }}
              >
                <YStack
                  backgroundColor="rgba(10,14,39,0.6)"
                  borderRadius={15}
                  padding={20}
                  borderWidth={1}
                  borderColor="rgba(0,121,193,0.2)"
                >
                  <Text fontSize={14} fontWeight="700" color="rgba(255,255,255,0.7)" fontFamily="SpaceGrotesk_700Bold" letterSpacing={1} marginBottom={16}>
                    TRANSACTION SUMMARY
                  </Text>
                  <XStack justifyContent="space-between" alignItems="center" marginBottom={12}>
                    <Text fontSize={12} color="rgba(255,255,255,0.5)" fontFamily="SpaceMono_400Regular">
                      &gt; From
                    </Text>
                    <Text fontSize={12} color="#0079c1" fontFamily="SpaceMono_400Regular">
                      {smartWalletAddress ? `${smartWalletAddress.slice(0, 10)}...` : "Loading..."}
                    </Text>
                  </XStack>
                  <XStack justifyContent="space-between" alignItems="center" marginBottom={12}>
                    <Text fontSize={12} color="rgba(255,255,255,0.5)" fontFamily="SpaceMono_400Regular">
                      &gt; To
                    </Text>
                    <Text fontSize={12} color="#0079c1" fontFamily="SpaceMono_400Regular">
                      {recipientAddress.slice(0, 10)}...
                    </Text>
                  </XStack>
                  <XStack justifyContent="space-between" alignItems="center" marginBottom={12}>
                    <Text fontSize={12} color="rgba(255,255,255,0.5)" fontFamily="SpaceMono_400Regular">
                      &gt; Amount
                    </Text>
                    <Text fontSize={14} fontWeight="700" color="#FFFFFF" fontFamily="SpaceGrotesk_700Bold">
                      {amount} PYUSD
                    </Text>
                  </XStack>
                  <XStack justifyContent="space-between" alignItems="center">
                    <Text fontSize={12} color="rgba(255,255,255,0.5)" fontFamily="SpaceMono_400Regular">
                      &gt; Gas Fee
                    </Text>
                    <Text fontSize={12} fontWeight="700" color="#34C759" fontFamily="SpaceGrotesk_700Bold">
                      SPONSORED
                    </Text>
                  </XStack>
                </YStack>
              </LinearGradient>
            </YStack>
          )}

          {/* Send Button */}
          <TouchableOpacity
            style={{ marginHorizontal: 16, marginBottom: 40, opacity: (!isValidRecipient || !isValidAmount || isLoading) ? 0.5 : 1 }}
            onPress={handleSend}
            disabled={!isValidRecipient || !isValidAmount || isLoading}
          >
            <LinearGradient
              colors={
                isValidRecipient && isValidAmount && !isLoading
                  ? ["rgba(52,199,89,0.8)", "rgba(48,164,108,0.8)"]
                  : ["rgba(100,100,100,0.5)", "rgba(70,70,70,0.5)"]
              }
              style={{ borderRadius: 12, paddingVertical: 18 }}
            >
              <XStack alignItems="center" justifyContent="center" gap={8}>
                {isLoading ? (
                  <Text fontSize={16} fontWeight="700" color="#FFFFFF" fontFamily="SpaceGrotesk_700Bold">
                    SENDING...
                  </Text>
                ) : (
                  <>
                    <Ionicons name="send" size={20} color="#FFFFFF" />
                    <Text fontSize={16} fontWeight="700" color="#FFFFFF" fontFamily="SpaceGrotesk_700Bold">
                      SEND PYUSD
                    </Text>
                  </>
                )}
              </XStack>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e27",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: 'SpaceMono_400Regular',
  },
});

export default SendScreen;
