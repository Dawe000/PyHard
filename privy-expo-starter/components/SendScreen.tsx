import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
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

const SendScreen = () => {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [smartWalletAddress, setSmartWalletAddress] = useState<string | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);

  const { user } = usePrivy();
  const { wallets, ready } = useEmbeddedEthereumWallet();
  const { generateAuthorizationSignature } = useAuthorizationSignature();
  const account = getUserEmbeddedEthereumWallet(user);
  
  // Debug wallet information
  console.log("🔍 useEmbeddedEthereumWallet debug:");
  console.log("🔍 - ready:", ready);
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

    // Step 2: Sign EIP-7702 authorization
    console.log("🔐 Signing EIP-7702 authorization...");

    const CHAIN_ID = 421614; // Arbitrum Sepolia

    // Sign EIP-7702 authorization using Privy API
    const authorizationResponse = await fetch(`https://api.privy.io/v1/wallets/${walletId}/rpc`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa('cmgtb4vg702vqld0da5wktriq:cmgtb4vg702vqld0da5wktriq')}`,
        'privy-app-id': 'cmgtb4vg702vqld0da5wktriq',
        'privy-authorization-signature': await generateAuthorizationSignature({
          version: 1,
          url: `https://api.privy.io/v1/wallets/${walletId}/rpc`,
          method: 'POST',
          headers: {
            'privy-app-id': 'cmgtb4vg702vqld0da5wktriq',
          },
          body: {
            method: 'eth_sign7702Authorization',
            params: {
              contract: smartWalletAddress,
              chain_id: CHAIN_ID,
              nonce: 0
            }
          }
        }),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        method: 'eth_sign7702Authorization',
        params: {
          contract: smartWalletAddress,
          chain_id: CHAIN_ID,
          nonce: 0
        }
      })
    });

    if (!authorizationResponse.ok) {
      throw new Error(`EIP-7702 signing failed: ${authorizationResponse.status} ${await authorizationResponse.text()}`);
    }

    const authorizationData = await authorizationResponse.json();
    console.log("✅ EIP-7702 authorization signed:", authorizationData);

      // Step 3: Send the signature to CF Worker for transaction submission
      console.log("🚀 Sending transaction to CF Worker...");
      
      try {
        const txResult = await sendPYUSD(
          account.address,
          smartWalletAddress,
          recipientAddress,
          amount,
          authorizationData // EIP-7702 authorization
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
          <View style={styles.header}>
            <Text style={styles.title}>Send PYUSD</Text>
            <Text style={styles.subtitle}>
              Send PYUSD from your SmartWallet with sponsored gas
            </Text>
          </View>

          {/* Loading State */}
          {isLoadingWallet && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading your SmartWallet...</Text>
            </View>
          )}

          {/* Recipient Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Recipient Address</Text>
            <View style={[styles.inputContainer, !isValidRecipient && recipientAddress && styles.inputError]}>
              <TextInput
                style={styles.textInput}
                placeholder="0x..."
                value={recipientAddress}
                onChangeText={setRecipientAddress}
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#999"
                editable={!isLoadingWallet}
              />
              {isValidRecipient && (
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              )}
            </View>
            {!isValidRecipient && recipientAddress && (
              <Text style={styles.errorText}>Invalid Ethereum address</Text>
            )}
          </View>

          {/* Amount Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Amount (PYUSD)</Text>
            <View style={[styles.inputContainer, !isValidAmount && amount && styles.inputError]}>
              <TextInput
                style={styles.textInput}
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
                editable={!isLoadingWallet}
              />
              <Text style={styles.currencyLabel}>PYUSD</Text>
            </View>
            {!isValidAmount && amount && (
              <Text style={styles.errorText}>Please enter a valid amount</Text>
            )}
          </View>

          {/* Transaction Summary */}
          {(isValidRecipient && isValidAmount) && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Transaction Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>From:</Text>
                <Text style={styles.summaryValue}>
                  {smartWalletAddress ? `${smartWalletAddress.slice(0, 10)}...` : "Loading..."}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>To:</Text>
                <Text style={styles.summaryValue}>
                  {recipientAddress.slice(0, 10)}...
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount:</Text>
                <Text style={styles.summaryValue}>{amount} PYUSD</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Gas Fee:</Text>
                <Text style={[styles.summaryValue, styles.sponsoredText]}>Sponsored</Text>
              </View>
            </View>
          )}

          {/* Send Button */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!isValidRecipient || !isValidAmount || isLoading) && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!isValidRecipient || !isValidAmount || isLoading}
          >
            <LinearGradient
              colors={
                isValidRecipient && isValidAmount && !isLoading
                  ? ["#34C759", "#30A46C"]
                  : ["#CCCCCC", "#999999"]
              }
              style={styles.sendButtonGradient}
            >
              {isLoading ? (
                <Text style={styles.sendButtonText}>Sending...</Text>
              ) : (
                <>
                  <Ionicons name="send" size={20} color="#FFFFFF" />
                  <Text style={styles.sendButtonText}>Send PYUSD</Text>
                </>
              )}
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
    backgroundColor: "#F5F5F7",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A1A",
  },
  currencyLabel: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 14,
    color: "#FF3B30",
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666666",
  },
  summaryValue: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  sponsoredText: {
    color: "#34C759",
    fontWeight: "600",
  },
  sendButton: {
    marginBottom: 40,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loadingContainer: {
    backgroundColor: "#FFF3CD",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#856404",
    fontWeight: "500",
  },
});

export default SendScreen;
