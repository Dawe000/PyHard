import React, { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
  RefreshControl
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { YStack, XStack, Text } from "tamagui";

import {
  usePrivy,
  useEmbeddedEthereumWallet,
  getUserEmbeddedEthereumWallet,
} from "@privy-io/expo";

import {
  getOrCreateSmartWallet,
  getSmartWalletPYUSDBalance,
} from "@/services/smartWallet";
import {
  getTokenBalance,
  getETHBalance,
  getPYUSDTransfers,
  formatTimestamp,
  formatAddress,
  BlockscoutTokenTransfer,
} from "@/services/blockscoutService";
import { ReceiveScreen } from "./ReceiveScreen";

// Arbitrum Sepolia network details
const ARBITRUM_SEPOLIA_CHAIN_ID = "421614";
const ARBITRUM_SEPOLIA_RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";
const PYUSD_CONTRACT_ADDRESS = "0x637A1259C6afd7E3AdF63993cA7E58BB438aB1B1"; // Real PYUSD on Arbitrum Sepolia
const PYUSD_DECIMALS = 6;

interface BalanceScreenProps {
  navigation?: any;
}

export const BalanceScreen = ({ navigation }: BalanceScreenProps) => {
  const [usdBalance, setUsdBalance] = useState("0.00");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [smartWalletAddress, setSmartWalletAddress] = useState<string | null>(null);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [showReceiveScreen, setShowReceiveScreen] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<BlockscoutTokenTransfer[]>([]);

  const { user } = usePrivy();
  const { wallets } = useEmbeddedEthereumWallet();
  const account = getUserEmbeddedEthereumWallet(user);

  // Initialize SmartWallet on component mount
  const initializeSmartWallet = useCallback(async () => {
    console.log("🔍 Debug account state:");
    console.log("  - user:", user);
    console.log("  - account:", account);
    console.log("  - account?.address:", account?.address);
    console.log("  - wallets:", wallets);
    console.log("  - wallets[0]:", wallets[0]);

    if (!account?.address) {
      console.log("❌ Cannot initialize SmartWallet: missing address");
      Alert.alert(
        "Wallet Not Connected",
        "Please make sure your wallet is connected. Account address is missing."
      );
      return;
    }

    if (smartWalletAddress) {
      console.log("✅ SmartWallet already initialized:", smartWalletAddress);
      return;
    }

    setIsCreatingWallet(true);
    try {
      console.log("🏗️ Initializing SmartWallet for:", account.address);
      // TODO: Replace with actual Privy token when available
      const walletInfo = await getOrCreateSmartWallet(account.address, "placeholder-token");

      setSmartWalletAddress(walletInfo.address);

      if (walletInfo.isNew) {
        Alert.alert(
          "SmartWallet Created!",
          `Your SmartWallet has been created at ${walletInfo.address.slice(0, 10)}...`
        );
      }

      console.log("✅ SmartWallet initialized:", walletInfo.address);
    } catch (error: any) {
      console.error("❌ Error initializing SmartWallet:", error);
      Alert.alert(
        "SmartWallet Error",
        `Failed to initialize SmartWallet: ${error.message}`
      );
    } finally {
      setIsCreatingWallet(false);
    }
  }, [account?.address, smartWalletAddress]);

  const fetchBalances = useCallback(async (isManualRefresh = false) => {
    // Wait for SmartWallet to be initialized
    if (!smartWalletAddress) {
      console.log("⏳ Waiting for SmartWallet initialization...");
      return;
    }

    if (!wallets[0]) {
      console.log("❌ No wallet provider available");
      setUsdBalance("0.00");
      return;
    }

    if (isManualRefresh) {
      setIsRefreshing(true);
    }

    try {
      // Fetch PYUSD balance using Blockscout API
      console.log("📊 Fetching balance via Blockscout API...");
      const balance = await getTokenBalance(smartWalletAddress);

      setUsdBalance(balance);
      console.log("✅ Blockscout: PYUSD balance fetched successfully:", balance);

      // Fetch recent transactions
      const txs = await getPYUSDTransfers(smartWalletAddress, 1, 4); // Get 4 most recent
      setRecentTransactions(txs);
      console.log("✅ Blockscout: Loaded", txs.length, "recent transactions");

    } catch (error: any) {
      console.error("❌ Error fetching balances:", error);
      Alert.alert("Error", `Failed to fetch balances: ${error.message}`);
    } finally {
      setIsRefreshing(false);
    }
  }, [smartWalletAddress, wallets]);

  // Initialize SmartWallet on mount - wait for wallet to be ready
  useEffect(() => {
    if (account?.address) {
      console.log("✅ Wallet is ready, initializing SmartWallet...");
      initializeSmartWallet();
    } else {
      console.log("⏳ Waiting for wallet to be ready...");
    }
  }, [account?.address, initializeSmartWallet]);

  // Fetch balances when SmartWallet is ready
  useEffect(() => {
    if (smartWalletAddress) {
      fetchBalances();
    }
  }, [smartWalletAddress, fetchBalances]);

  const copyAddress = useCallback(async () => {
    const addressToCopy = smartWalletAddress || account?.address;
    if (!addressToCopy) return;

    try {
      await Clipboard.setStringAsync(addressToCopy);
      Alert.alert("Copied", "SmartWallet address copied to clipboard");
    } catch (error) {
      console.error("Error copying address:", error);
    }
  }, [smartWalletAddress, account?.address]);

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const emailAccount = user?.linked_accounts?.find((account: any) => account.type === 'email') as { address?: string } | undefined;
  const userEmail = emailAccount?.address;

  if (showReceiveScreen) {
    return (
      <ReceiveScreen onClose={() => setShowReceiveScreen(false)} />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchBalances(true)}
            tintColor="#0079c1"
          />
        }
      >
        {/* Header */}
        <YStack paddingHorizontal={16} paddingTop={20} paddingBottom={10}>
          <LinearGradient
            colors={['rgba(0,121,193,0.1)', 'rgba(0,48,135,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 16, padding: 1 }}
          >
            <YStack
              backgroundColor="rgba(10,14,39,0.6)"
              borderRadius={15}
              padding={16}
              borderWidth={1}
              borderColor="rgba(0,121,193,0.2)"
            >
              <XStack justifyContent="space-between" alignItems="center" marginBottom={12}>
                <Text fontSize={20} fontWeight="700" color="#FFFFFF" fontFamily="SpaceGrotesk_700Bold">
                  HELLO, {userEmail?.split('@')[0]?.toUpperCase() || 'USER'}
                </Text>
              </XStack>
              <TouchableOpacity onPress={copyAddress}>
                <XStack alignItems="center" gap={8} padding={8} backgroundColor="rgba(0,121,193,0.1)" borderRadius={8}>
                  <Text fontSize={12} color="rgba(255,255,255,0.6)" fontFamily="SpaceMono_400Regular">
                    &gt; WALLET
                  </Text>
                  <Text fontSize={12} color="#0079c1" fontFamily="SpaceMono_400Regular" flex={1}>
                    {formatAddress(smartWalletAddress || account?.address || "")}
                  </Text>
                  <Ionicons name="copy-outline" size={16} color="#0079c1" />
                </XStack>
              </TouchableOpacity>
              {isCreatingWallet && (
                <YStack marginTop={12} padding={12} backgroundColor="rgba(0,121,193,0.15)" borderRadius={8}>
                  <XStack alignItems="center" gap={8}>
                    <Ionicons name="hourglass-outline" size={16} color="#0079c1" />
                    <Text fontSize={12} color="#0079c1" fontFamily="SpaceMono_400Regular">
                      &gt; Creating your SmartWallet...
                    </Text>
                  </XStack>
                </YStack>
              )}
            </YStack>
          </LinearGradient>
        </YStack>

        {/* Balance Card */}
        <YStack marginHorizontal={16} marginVertical={16}>
          <LinearGradient
            colors={['rgba(0,121,193,0.3)', 'rgba(0,48,135,0.2)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 20, padding: 2 }}
          >
            <YStack
              backgroundColor="rgba(10,14,39,0.8)"
              borderRadius={18}
              padding={32}
              alignItems="center"
              borderWidth={1}
              borderColor="rgba(0,121,193,0.3)"
            >
              <Text fontSize={12} fontWeight="700" color="rgba(255,255,255,0.5)" fontFamily="SpaceGrotesk_700Bold" letterSpacing={2} marginBottom={12}>
                YOUR BALANCE
              </Text>
              <Text fontSize={48} fontWeight="700" color="#FFFFFF" fontFamily="SpaceGrotesk_700Bold" marginBottom={8}>
                ${usdBalance}
              </Text>
              <Text fontSize={14} color="rgba(255,255,255,0.6)" fontFamily="SpaceMono_400Regular">
                PYUSD
              </Text>
              <XStack alignItems="center" gap={6} marginTop={12} padding={8} backgroundColor="rgba(0,121,193,0.15)" borderRadius={8}>
                <Ionicons name="shield-checkmark" size={14} color="#0079c1" />
                <Text fontSize={10} color="rgba(255,255,255,0.6)" fontFamily="SpaceMono_400Regular">
                  &gt; Live data via Blockscout
                </Text>
              </XStack>
            </YStack>
          </LinearGradient>
        </YStack>

        {/* Quick Actions */}
        <YStack marginHorizontal={16} marginBottom={16}>
          <Text fontSize={14} fontWeight="700" color="rgba(255,255,255,0.7)" fontFamily="SpaceGrotesk_700Bold" letterSpacing={1} marginBottom={12} marginLeft={4}>
            QUICK ACTIONS
          </Text>
          <XStack gap={12} justifyContent="space-between">
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => {
                console.log("🚀 Send button pressed!");
                console.log("📍 Navigation object:", navigation);
                navigation?.navigate?.('send');
              }}
            >
              <LinearGradient
                colors={['rgba(0,121,193,0.15)', 'rgba(0,121,193,0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{ borderRadius: 16, padding: 1 }}
              >
                <YStack
                  backgroundColor="rgba(10,14,39,0.6)"
                  borderRadius={15}
                  padding={16}
                  alignItems="center"
                  gap={8}
                  borderWidth={1}
                  borderColor="rgba(0,121,193,0.2)"
                >
                  <Ionicons name="send" size={28} color="#0079c1" />
                  <Text fontSize={12} fontWeight="600" color="#FFFFFF" fontFamily="SpaceGrotesk_600SemiBold" letterSpacing={0.5}>
                    SEND
                  </Text>
                </YStack>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => Alert.alert("Coming Soon", "Add funds feature coming soon!")}
            >
              <LinearGradient
                colors={['rgba(0,121,193,0.15)', 'rgba(0,121,193,0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{ borderRadius: 16, padding: 1 }}
              >
                <YStack
                  backgroundColor="rgba(10,14,39,0.6)"
                  borderRadius={15}
                  padding={16}
                  alignItems="center"
                  gap={8}
                  borderWidth={1}
                  borderColor="rgba(0,121,193,0.2)"
                >
                  <Ionicons name="add-circle" size={28} color="#34C759" />
                  <Text fontSize={12} fontWeight="600" color="#FFFFFF" fontFamily="SpaceGrotesk_600SemiBold" letterSpacing={0.5}>
                    ADD FUNDS
                  </Text>
                </YStack>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => setShowReceiveScreen(true)}
            >
              <LinearGradient
                colors={['rgba(0,121,193,0.15)', 'rgba(0,121,193,0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{ borderRadius: 16, padding: 1 }}
              >
                <YStack
                  backgroundColor="rgba(10,14,39,0.6)"
                  borderRadius={15}
                  padding={16}
                  alignItems="center"
                  gap={8}
                  borderWidth={1}
                  borderColor="rgba(0,121,193,0.2)"
                >
                  <Ionicons name="arrow-down" size={28} color="#0079c1" />
                  <Text fontSize={12} fontWeight="600" color="#FFFFFF" fontFamily="SpaceGrotesk_600SemiBold" letterSpacing={0.5}>
                    RECEIVE
                  </Text>
                </YStack>
              </LinearGradient>
            </TouchableOpacity>
          </XStack>
        </YStack>

        {/* Recent Activity */}
        <YStack marginHorizontal={16} marginBottom={32}>
          <XStack justifyContent="space-between" alignItems="center" marginBottom={12} marginLeft={4}>
            <Text fontSize={14} fontWeight="700" color="rgba(255,255,255,0.7)" fontFamily="SpaceGrotesk_700Bold" letterSpacing={1}>
              RECENT ACTIVITY
            </Text>
            {recentTransactions.length > 0 && (
              <TouchableOpacity onPress={() => navigation?.navigate('transactions')}>
                <XStack alignItems="center" gap={4}>
                  <Text fontSize={11} fontWeight="600" color="#0079c1" fontFamily="SpaceGrotesk_600SemiBold" letterSpacing={0.5}>
                    VIEW ALL
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color="#0079c1" />
                </XStack>
              </TouchableOpacity>
            )}
          </XStack>

          {recentTransactions.length > 0 ? (
            <YStack gap={8}>
              {recentTransactions.map((tx) => {
                const isSent = tx.from.toLowerCase() === smartWalletAddress?.toLowerCase();
                const amount = (parseInt(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal))).toFixed(2);

                return (
                  <TouchableOpacity key={tx.hash} onPress={() => navigation?.navigate('transactions', { transaction: tx })}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ borderRadius: 12, padding: 1 }}
                    >
                      <YStack
                        backgroundColor="rgba(10,14,39,0.6)"
                        borderRadius={11}
                        padding={12}
                        borderWidth={1}
                        borderColor="rgba(0,121,193,0.2)"
                      >
                        <XStack justifyContent="space-between" alignItems="center">
                          <XStack alignItems="center" gap={10} flex={1}>
                            <YStack
                              width={32}
                              height={32}
                              borderRadius={16}
                              backgroundColor={isSent ? 'rgba(255,69,58,0.2)' : 'rgba(52,199,89,0.2)'}
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Ionicons
                                name={isSent ? "arrow-up" : "arrow-down"}
                                size={16}
                                color={isSent ? "#FF453A" : "#34C759"}
                              />
                            </YStack>
                            <YStack flex={1}>
                              <Text fontSize={13} fontWeight="600" color="#FFFFFF" fontFamily="SpaceGrotesk_600SemiBold" marginBottom={2}>
                                {isSent ? 'Sent' : 'Received'}
                              </Text>
                              <Text fontSize={10} color="rgba(255,255,255,0.5)" fontFamily="SpaceMono_400Regular">
                                {formatTimestamp(tx.timeStamp)}
                              </Text>
                            </YStack>
                          </XStack>
                          <Text fontSize={14} fontWeight="600" color={isSent ? "#FF453A" : "#34C759"} fontFamily="SpaceMono_700Bold">
                            {isSent ? '-' : '+'}{amount} PYUSD
                          </Text>
                        </XStack>
                      </YStack>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </YStack>
          ) : (
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 16, padding: 1 }}
            >
              <YStack
                backgroundColor="rgba(10,14,39,0.4)"
                borderRadius={15}
                padding={32}
                alignItems="center"
                borderWidth={1}
                borderColor="rgba(0,121,193,0.2)"
              >
                <Ionicons name="time-outline" size={48} color="rgba(255,255,255,0.3)" />
                <Text fontSize={16} fontWeight="600" color="rgba(255,255,255,0.6)" fontFamily="SpaceGrotesk_600SemiBold" marginTop={16} marginBottom={8}>
                  No Recent Transactions
                </Text>
                <Text fontSize={13} color="rgba(255,255,255,0.4)" fontFamily="SpaceMono_400Regular" textAlign="center">
                  &gt; Your transaction history will appear here
                </Text>
              </YStack>
            </LinearGradient>
          )}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  scrollView: {
    flex: 1,
  },
});
