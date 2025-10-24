import React, { useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { YStack, XStack, Text } from "tamagui";
import { LinearGradient } from "expo-linear-gradient";
import { usePrivy, getUserEmbeddedEthereumWallet, useAuthorizationSignature, createPrivyClient } from '@privy-io/expo';
import { getOrCreateSmartWallet } from '@/services/smartWallet';
import { createSubscriptionGasless } from '@/services/subscriptionService';
import { SubscriptionRequestData, formatInterval } from "@/utils/qrCodeUtils";

interface SubscriptionConfirmationScreenProps {
  qrData: {
    version: string;
    type: string;
    data: SubscriptionRequestData;
  };
  onClose: () => void;
  onSuccess: (subscriptionId: number) => void;
}

export const SubscriptionConfirmationScreen = ({
  qrData,
  onClose,
  onSuccess
}: SubscriptionConfirmationScreenProps) => {
  const { user } = usePrivy();
  const account = getUserEmbeddedEthereumWallet(user);
  const { generateAuthorizationSignature } = useAuthorizationSignature();
  const [isLoading, setIsLoading] = useState(false);

  const data = qrData.data;
  const intervalSeconds = parseInt(data.interval);

  const handleConfirm = async () => {
    if (!account?.address || !account?.id) {
      Alert.alert("Error", "Wallet not connected");
      return;
    }

    setIsLoading(true);

    try {
      console.log("🚀 Starting subscription creation...");

      // Get or create smart wallet
      const privyClient = createPrivyClient('cmgtb4vg702vqld0da5wktriq');
      const accessToken = await privyClient.getAccessToken();

      if (!accessToken) {
        throw new Error("Failed to get Privy access token");
      }

      const smartWalletInfo = await getOrCreateSmartWallet(account.address, accessToken);
      console.log("📱 Smart Wallet:", smartWalletInfo.address);

      // Create subscription gaslessly
      const result = await createSubscriptionGasless(
        account.address,
        smartWalletInfo.address,
        data.vendorAddress,
        data.amount,
        data.interval,
        generateAuthorizationSignature,
        account.id
      );

      if (!result.success) {
        throw new Error(result.error || 'Subscription creation failed');
      }

      console.log("✅ Subscription created:", result.transactionHash);

      Alert.alert(
        "Success",
        `Subscription created successfully!\n\nTransaction: ${result.transactionHash?.slice(0, 10)}...`,
        [
          {
            text: "OK",
            onPress: () => onSuccess(result.subscriptionId || 0)
          }
        ]
      );

    } catch (error) {
      console.error("❌ Error creating subscription:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to create subscription"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#0a0e27", "#1a1f3a"]}
        style={styles.gradient}
      >
        {/* Header */}
        <XStack
          justifyContent="space-between"
          alignItems="center"
          paddingHorizontal={20}
          paddingVertical={16}
        >
          <Text fontSize={24} fontWeight="700" color="#FFFFFF" fontFamily="SpaceGrotesk_700Bold">
            Confirm Subscription
          </Text>
          <TouchableOpacity onPress={onClose} disabled={isLoading}>
            <Ionicons name="close" size={28} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </XStack>

        <YStack flex={1} paddingHorizontal={20} paddingTop={20}>
          {/* Subscription Details Card */}
          <YStack
            backgroundColor="rgba(255,255,255,0.05)"
            borderRadius={16}
            padding={20}
            marginBottom={20}
            borderWidth={1}
            borderColor="rgba(255,255,255,0.1)"
          >
            <Text
              fontSize={14}
              fontWeight="600"
              color="rgba(255,255,255,0.5)"
              fontFamily="SpaceGrotesk_600SemiBold"
              marginBottom={16}
              letterSpacing={1}
            >
              SUBSCRIPTION DETAILS
            </Text>

            {/* Vendor */}
            <YStack marginBottom={20}>
              <Text
                fontSize={12}
                color="rgba(255,255,255,0.5)"
                fontFamily="SpaceGrotesk_600SemiBold"
                marginBottom={8}
              >
                VENDOR ADDRESS
              </Text>
              <Text
                fontSize={14}
                fontFamily="SpaceMono_400Regular"
                color="#FFFFFF"
              >
                {data.vendorAddress}
              </Text>
            </YStack>

            {/* Amount */}
            <YStack marginBottom={20}>
              <Text
                fontSize={12}
                color="rgba(255,255,255,0.5)"
                fontFamily="SpaceGrotesk_600SemiBold"
                marginBottom={8}
              >
                AMOUNT PER PAYMENT
              </Text>
              <Text
                fontSize={32}
                fontWeight="700"
                color="#FFFFFF"
                fontFamily="SpaceGrotesk_700Bold"
              >
                {data.amount} PYUSD
              </Text>
            </YStack>

            {/* Interval */}
            <YStack marginBottom={8}>
              <Text
                fontSize={12}
                color="rgba(255,255,255,0.5)"
                fontFamily="SpaceGrotesk_600SemiBold"
                marginBottom={8}
              >
                BILLING INTERVAL
              </Text>
              <Text
                fontSize={18}
                fontWeight="600"
                color="#FFFFFF"
                fontFamily="SpaceGrotesk_600SemiBold"
              >
                {formatInterval(intervalSeconds)}
              </Text>
            </YStack>
          </YStack>

          {/* Info Box */}
          <YStack
            backgroundColor="rgba(0,121,193,0.1)"
            borderRadius={12}
            padding={16}
            marginBottom={20}
            borderWidth={1}
            borderColor="rgba(0,121,193,0.3)"
          >
            <XStack alignItems="flex-start" gap={12}>
              <Ionicons name="information-circle" size={24} color="#0079c1" />
              <YStack flex={1}>
                <Text
                  fontSize={14}
                  color="rgba(255,255,255,0.9)"
                  fontFamily="SpaceGrotesk_400Regular"
                >
                  The vendor can charge this amount at the specified interval. You can cancel this subscription anytime from the Transactions screen.
                </Text>
              </YStack>
            </XStack>
          </YStack>

          {/* Confirm Button */}
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={isLoading}
            style={styles.confirmButton}
          >
            <LinearGradient
              colors={isLoading ? ["#666", "#666"] : ["#0079c1", "#005a8c"]}
              style={styles.confirmGradient}
            >
              {isLoading ? (
                <XStack alignItems="center" gap={8}>
                  <ActivityIndicator color="#FFFFFF" />
                  <Text
                    fontSize={18}
                    fontWeight="700"
                    color="#FFFFFF"
                    fontFamily="SpaceGrotesk_700Bold"
                  >
                    Creating...
                  </Text>
                </XStack>
              ) : (
                <Text
                  fontSize={18}
                  fontWeight="700"
                  color="#FFFFFF"
                  fontFamily="SpaceGrotesk_700Bold"
                >
                  Confirm Subscription
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            onPress={onClose}
            disabled={isLoading}
            style={styles.cancelButton}
          >
            <Text
              fontSize={16}
              fontWeight="600"
              color="rgba(255,255,255,0.7)"
              fontFamily="SpaceGrotesk_600SemiBold"
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </YStack>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e27",
  },
  gradient: {
    flex: 1,
  },
  confirmButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  confirmGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
});

