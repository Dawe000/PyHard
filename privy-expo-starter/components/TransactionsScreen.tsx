import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Animated
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { YStack, XStack, Text } from "tamagui";
import { LinearGradient } from "expo-linear-gradient";
import { usePrivy, getUserEmbeddedEthereumWallet } from "@privy-io/expo";
import { getOrCreateSmartWallet } from "@/services/smartWallet";
import {
  getPYUSDTransfers,
  formatTimestamp,
  formatAddress as formatAddressBlockscout,
  getTransactionURL,
  BlockscoutTokenTransfer,
} from "@/services/blockscoutService";
import * as Linking from 'expo-linking';
import { TransactionDetailsModal } from "./TransactionDetailsModal";
import { transactionEvents } from "@/utils/transactionEvents";

interface TransactionsScreenProps {
  initialTransaction?: BlockscoutTokenTransfer | null;
}

export const TransactionsScreen = ({ initialTransaction }: TransactionsScreenProps = {}) => {
  const [transactions, setTransactions] = useState<BlockscoutTokenTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [smartWalletAddress, setSmartWalletAddress] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<BlockscoutTokenTransfer | null>(initialTransaction || null);
  const [showTransactionModal, setShowTransactionModal] = useState(!!initialTransaction);
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const lastFetchTime = useRef<number>(0);

  const { user } = usePrivy();
  const account = getUserEmbeddedEthereumWallet(user);

  // Pulsing animation for skeleton loader
  useEffect(() => {
    if (isLoading) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isLoading, pulseAnim]);

  // Initialize SmartWallet address
  useEffect(() => {
    const initializeWallet = async () => {
      if (account?.address) {
        try {
          const wallet = await getOrCreateSmartWallet(account.address, "placeholder-token");
          setSmartWalletAddress(wallet.address);
        } catch (error) {
          console.error('Error getting SmartWallet address:', error);
        }
      }
    };
    initializeWallet();
  }, [account?.address]);

  // Load transaction history from Blockscout
  const loadTransactions = useCallback(async (isRefresh = false) => {
    if (!smartWalletAddress) {
      console.log('❌ No SmartWallet address available for transaction history');
      return;
    }

    // Cache logic: skip if fetched in last 30 seconds (unless manual refresh)
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime.current;
    const CACHE_DURATION = 30000; // 30 seconds

    if (!isRefresh && timeSinceLastFetch < CACHE_DURATION && lastFetchTime.current > 0) {
      console.log('📦 Using cached transactions (fetched', Math.floor(timeSinceLastFetch / 1000), 'seconds ago)');
      return;
    }

    console.log('🔍 Blockscout: Loading transaction history for SmartWallet:', smartWalletAddress);

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      // Fetch PYUSD token transfers
      const pyusdTransfers = await getPYUSDTransfers(smartWalletAddress, 1, 20);

      // Add minimum loading time for smooth UX
      if (!isRefresh) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log('✅ Blockscout: Loaded', pyusdTransfers.length, 'PYUSD transfers');
      setTransactions(pyusdTransfers);

      // Update last fetch time
      lastFetchTime.current = Date.now();
    } catch (error) {
      console.error('❌ Blockscout: Error loading transaction history:', error);
      Alert.alert('Error', 'Failed to load transaction history from Blockscout');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [smartWalletAddress]);

  // Load transactions when SmartWallet address is available
  useEffect(() => {
    if (smartWalletAddress) {
      loadTransactions();
    }
  }, [smartWalletAddress, loadTransactions]);

  // Open modal if initialTransaction is provided
  useEffect(() => {
    if (initialTransaction) {
      setSelectedTransaction(initialTransaction);
      setShowTransactionModal(true);
    }
  }, [initialTransaction]);

  // Listen for transaction completion events
  useEffect(() => {
    const unsubscribe = transactionEvents.subscribe(() => {
      console.log("📡 Transaction completed, waiting 2s then refreshing transactions...");
      // Wait 2 seconds for blockchain to process, then refresh
      setTimeout(() => {
        lastFetchTime.current = 0; // Invalidate cache
        loadTransactions(false); // Fetch fresh data with loading indicator
      }, 2000);
    });

    return unsubscribe;
  }, [loadTransactions]);

  const handleRefresh = () => {
    loadTransactions(true);
  };

  const openTransactionDetails = (transaction: BlockscoutTokenTransfer) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const closeTransactionDetails = () => {
    setShowTransactionModal(false);
    setSelectedTransaction(null);
  };

  const getTransactionIcon = (tx: BlockscoutTokenTransfer) => {
    if (tx.from.toLowerCase() === smartWalletAddress?.toLowerCase()) {
      return 'arrow-up';
    } else {
      return 'arrow-down';
    }
  };

  const getTransactionColor = (tx: BlockscoutTokenTransfer) => {
    if (tx.from.toLowerCase() === smartWalletAddress?.toLowerCase()) {
      return '#FF3B30'; // sent
    } else {
      return '#34C759'; // received
    }
  };

  const getTransactionType = (tx: BlockscoutTokenTransfer) => {
    if (tx.from.toLowerCase() === smartWalletAddress?.toLowerCase()) {
      return 'Sent to';
    } else {
      return 'Received from';
    }
  };

  const renderTransaction = (transaction: BlockscoutTokenTransfer) => {
    const isSent = transaction.from.toLowerCase() === smartWalletAddress?.toLowerCase();
    const amount = (parseInt(transaction.value) / Math.pow(10, parseInt(transaction.tokenDecimal))).toFixed(2);

    return (
      <TouchableOpacity
        key={transaction.hash}
        onPress={() => openTransactionDetails(transaction)}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 12, padding: 1, marginBottom: 12 }}
        >
          <YStack
            backgroundColor="rgba(10,14,39,0.6)"
            borderRadius={11}
            padding={16}
            borderWidth={1}
            borderColor="rgba(0,121,193,0.2)"
          >
            <XStack justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" gap={12} flex={1}>
                <YStack
                  width={40}
                  height={40}
                  borderRadius={20}
                  backgroundColor={getTransactionColor(transaction) + '20'}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Ionicons
                    name={getTransactionIcon(transaction)}
                    size={20}
                    color={getTransactionColor(transaction)}
                  />
                </YStack>
                <YStack flex={1}>
                  <Text fontSize={14} fontWeight="600" color="#FFFFFF" fontFamily="SpaceGrotesk_600SemiBold" marginBottom={4}>
                    {getTransactionType(transaction)} {formatAddressBlockscout(isSent ? transaction.to : transaction.from)}
                  </Text>
                  <Text fontSize={12} color="rgba(255,255,255,0.5)" fontFamily="SpaceMono_400Regular">
                    &gt; {formatTimestamp(transaction.timeStamp)}
                  </Text>
                </YStack>
              </XStack>
              <YStack alignItems="flex-end" gap={4}>
                <Text
                  fontSize={16}
                  fontWeight="700"
                  color={isSent ? '#FF3B30' : '#34C759'}
                  fontFamily="SpaceGrotesk_700Bold"
                >
                  {isSent ? '-' : '+'}${amount}
                </Text>
                <YStack backgroundColor="rgba(52,199,89,0.2)" paddingHorizontal={8} paddingVertical={4} borderRadius={12}>
                  <Text fontSize={10} fontWeight="600" color="#34C759" fontFamily="SpaceGrotesk_600SemiBold" letterSpacing={0.5}>
                    {transaction.tokenSymbol}
                  </Text>
                </YStack>
              </YStack>
            </XStack>
          </YStack>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <YStack paddingHorizontal={16} paddingTop={20} paddingBottom={10}>
        <XStack justifyContent="space-between" alignItems="center" marginBottom={16}>
          <Text fontSize={24} fontWeight="700" color="#FFFFFF" fontFamily="SpaceGrotesk_700Bold">
            ACTIVITY
          </Text>
          <TouchableOpacity onPress={handleRefresh} disabled={isRefreshing}>
            <Ionicons name="refresh-outline" size={24} color={isRefreshing ? "rgba(0,121,193,0.5)" : "#0079c1"} />
          </TouchableOpacity>
        </XStack>

        {/* Blockscout Badge */}
        <XStack alignItems="center" gap={8} marginTop={12} padding={8} backgroundColor="rgba(0,121,193,0.1)" borderRadius={8}>
          <Ionicons name="shield-checkmark" size={16} color="#0079c1" />
          <Text fontSize={11} color="rgba(255,255,255,0.6)" fontFamily="SpaceMono_400Regular">
            &gt; Powered by Blockscout API
          </Text>
        </XStack>
      </YStack>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#0079c1"
          />
        }
      >
        {isLoading ? (
          <YStack paddingHorizontal={16}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Animated.View key={i} style={{ opacity: pulseAnim, marginBottom: 12 }}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 12, padding: 1 }}
                >
                  <YStack
                    backgroundColor="rgba(10,14,39,0.6)"
                    borderRadius={11}
                    padding={16}
                    borderWidth={1}
                    borderColor="rgba(0,121,193,0.2)"
                  >
                    <XStack justifyContent="space-between" alignItems="center">
                      <XStack alignItems="center" gap={12} flex={1}>
                        <YStack width={40} height={40} borderRadius={20} backgroundColor="rgba(255,255,255,0.1)" />
                        <YStack flex={1} gap={6}>
                          <YStack width={120} height={14} backgroundColor="rgba(255,255,255,0.1)" borderRadius={4} />
                          <YStack width={160} height={12} backgroundColor="rgba(255,255,255,0.1)" borderRadius={4} />
                          <YStack width={140} height={11} backgroundColor="rgba(255,255,255,0.1)" borderRadius={4} />
                        </YStack>
                      </XStack>
                      <YStack alignItems="flex-end" gap={6}>
                        <YStack width={100} height={14} backgroundColor="rgba(255,255,255,0.1)" borderRadius={4} />
                        <YStack width={60} height={10} backgroundColor="rgba(255,255,255,0.1)" borderRadius={4} />
                      </YStack>
                    </XStack>
                  </YStack>
                </LinearGradient>
              </Animated.View>
            ))}
          </YStack>
        ) : (
          <YStack>
            {transactions.length > 0 ? (
              transactions.map(renderTransaction)
            ) : (
              <YStack alignItems="center" paddingVertical={48}>
                <Ionicons name="receipt-outline" size={48} color="rgba(255,255,255,0.3)" />
                <Text fontSize={16} fontWeight="600" color="rgba(255,255,255,0.6)" fontFamily="SpaceGrotesk_600SemiBold" marginTop={16} marginBottom={8}>
                  No Transactions Yet
                </Text>
                <Text fontSize={13} color="rgba(255,255,255,0.4)" fontFamily="SpaceMono_400Regular" textAlign="center">
                  &gt; Your PYUSD transfers will appear here
                </Text>
              </YStack>
            )}
          </YStack>
        )}
      </ScrollView>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        visible={showTransactionModal}
        transaction={selectedTransaction}
        onClose={closeTransactionDetails}
        smartWalletAddress={smartWalletAddress}
      />
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
