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
import { usePrivy, useEmbeddedEthereumWallet, useIdentityToken } from "@privy-io/expo";
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
  const { wallets } = useEmbeddedEthereumWallet();
  const { getIdentityToken } = useIdentityToken();
  const account = getUserEmbeddedEthereumWallet(user);

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

      // Get both identity token and access token for EIP-7702 authorization
      console.log("📝 Getting user tokens for EIP-7702 authorization...");
      
      // Get identity token for user verification
      const identityToken = await getIdentityToken();
      if (!identityToken) {
        throw new Error("Missing identity token - please ensure you're logged in");
      }
      
      // Get access token for authorization context
      const privy = createPrivyClient({
        appId: 'cmgtb4vg702vqld0da5wktriq', // From app.json
        clientId: 'client-WY6RdMvmLZHLWnPB2aNZAEshGmBTwtGUAx299bCthg7U9' // From wrangler.toml
      });
      
      const accessToken = await privy.getAccessToken();
      if (!accessToken) {
        throw new Error("Missing access token - please ensure you're logged in");
      }
      
      console.log("🔍 Identity token type:", typeof identityToken);
      console.log("🔍 Identity token length:", identityToken?.length);
      console.log("🔍 Identity token preview:", identityToken?.substring(0, 50) + "...");
      console.log("🔍 Access token type:", typeof accessToken);
      console.log("🔍 Access token length:", accessToken?.length);
      console.log("🔍 Access token preview:", accessToken?.substring(0, 50) + "...");
      
      // Validate that we have proper JWT tokens (should start with eyJ)
      if (!identityToken.startsWith('eyJ')) {
        console.warn("⚠️ Identity token doesn't appear to be a valid JWT token");
      }
      if (!accessToken.startsWith('eyJ')) {
        console.warn("⚠️ Access token doesn't appear to be a valid JWT token");
      }
      
      // Try to decode JWT payloads (without verification)
      try {
        const identityParts = identityToken.split('.');
        if (identityParts.length === 3) {
          const identityPayload = JSON.parse(atob(identityParts[1]));
          console.log("🔍 Identity JWT payload:", identityPayload);
          console.log("🔍 Identity JWT subject:", identityPayload.sub);
          console.log("🔍 Identity JWT audience:", identityPayload.aud);
          console.log("🔍 Identity JWT issuer:", identityPayload.iss);
          console.log("🔍 Identity JWT expires:", new Date(identityPayload.exp * 1000));
        }
        
        const accessParts = accessToken.split('.');
        if (accessParts.length === 3) {
          const accessPayload = JSON.parse(atob(accessParts[1]));
          console.log("🔍 Access JWT payload:", accessPayload);
          console.log("🔍 Access JWT subject:", accessPayload.sub);
          console.log("🔍 Access JWT audience:", accessPayload.aud);
          console.log("🔍 Access JWT issuer:", accessPayload.iss);
          console.log("🔍 Access JWT expires:", new Date(accessPayload.exp * 1000));
        }
      } catch (e) {
        console.warn("⚠️ Could not decode JWT payload:", e);
      }
      
      console.log("✅ Got both tokens, proceeding with send...");
      
      // Send both tokens for server-side EIP-7702 signing
      console.log("🔐 Using server-side EIP-7702 signing with both tokens...");
      console.log("🔐 Identity token length:", identityToken?.length);
      console.log("🔐 Access token length:", accessToken?.length);
      
      try {
        const result = await sendPYUSD(
          account.address,
          smartWalletAddress,
          recipientAddress,
          amount,
          identityToken,
          accessToken
        );

        console.log("📥 Send result received:", result);

        if (result.success) {
          console.log("✅ Send successful!");
          Alert.alert(
            "Success!",
            `Sent ${amount} PYUSD to ${recipientAddress.slice(0, 10)}...\n\nTransaction: ${result.transactionHash?.slice(0, 10)}...`,
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
          console.log("❌ Send failed:", result.error);
          Alert.alert("Error", result.error || "Failed to send PYUSD");
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
