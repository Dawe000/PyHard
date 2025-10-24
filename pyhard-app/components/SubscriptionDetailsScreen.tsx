import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { YStack, XStack, Text } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { usePrivy, getUserEmbeddedEthereumWallet, useAuthorizationSignature } from '@privy-io/expo';
import { cancelSubscriptionGasless } from '@/services/subscriptionService';
import { CF_WORKER_URL } from '@/constants/contracts';

interface SubscriptionDetailsScreenProps {
  subscription: {
    subscriptionId: number;
    vendor: string;
    amountPerInterval: string;
    interval: string;
    lastPayment: string;
    active: boolean;
  };
  smartWalletAddress: string;
  onClose: () => void;
  onSubscriptionCancelled: () => void;
}

interface PaymentHistoryItem {
  transactionHash: string;
  amount: string;
  timestamp: string;
  blockNumber: string;
}

export const SubscriptionDetailsScreen: React.FC<SubscriptionDetailsScreenProps> = ({
  subscription,
  smartWalletAddress,
  onClose,
  onSubscriptionCancelled
}) => {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const { user } = usePrivy();
  const account = getUserEmbeddedEthereumWallet(user);
  const { generateAuthorizationSignature } = useAuthorizationSignature();

  useEffect(() => {
    loadPaymentHistory();
  }, [subscription.subscriptionId, smartWalletAddress]);

  const loadPaymentHistory = async (isRefresh: boolean = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      console.log(`📝 Loading payment history for subscription ${subscription.subscriptionId}`);
      
      const response = await fetch(`${CF_WORKER_URL}/payment-history/${smartWalletAddress}/${subscription.subscriptionId}`);
      const data = await response.json();
      
      if (data.payments) {
        setPaymentHistory(data.payments);
        console.log(`📊 Loaded ${data.payments.length} payment history entries`);
      } else {
        setPaymentHistory([]);
        console.log('📊 No payment history found');
      }
    } catch (error) {
      console.error('❌ Error loading payment history:', error);
      setPaymentHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!account?.address) {
      Alert.alert("Error", "Wallet not connected.");
      return;
    }

    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to cancel this subscription? This action cannot be undone.",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: async () => {
            setCancelling(true);
            try {
              console.log(`🚫 Cancelling subscription ${subscription.subscriptionId}`);
              
              const result = await cancelSubscriptionGasless(
                account.address,
                smartWalletAddress,
                subscription.subscriptionId,
                generateAuthorizationSignature,
                account.id
              );

              if (result.success) {
                Alert.alert("Success", "Subscription cancelled successfully!");
                onSubscriptionCancelled();
                onClose();
              } else {
                throw new Error(result.error || "Failed to cancel subscription.");
              }
            } catch (error: any) {
              console.error('❌ Error cancelling subscription:', error);
              Alert.alert("Error", `Failed to cancel subscription: ${error.message}`);
            } finally {
              setCancelling(false);
            }
          }
        }
      ]
    );
  };

  const formatAmount = (amount: string) => {
    const amountInPYUSD = parseFloat(amount) / 1000000; // Convert from wei to PYUSD
    return `${amountInPYUSD.toFixed(2)} PYUSD`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const formatInterval = (seconds: number) => {
    const days = seconds / 86400;
    if (seconds === 86400) return "Daily";
    if (seconds === 604800) return "Weekly";
    if (seconds === 2592000) return "Monthly";
    return `Every ${days.toFixed(1)} days`;
  };

  const calculateNextPayment = () => {
    const lastPayment = parseInt(subscription.lastPayment);
    const interval = parseInt(subscription.interval);
    const nextPaymentTime = lastPayment + interval;
    const now = Math.floor(Date.now() / 1000);
    
    if (now >= nextPaymentTime) {
      return "Due now";
    }
    
    const timeUntilNext = nextPaymentTime - now;
    const hoursUntilNext = Math.ceil(timeUntilNext / 3600);
    
    if (hoursUntilNext < 24) {
      return `Due in ${hoursUntilNext} hours`;
    } else {
      const daysUntilNext = Math.ceil(hoursUntilNext / 24);
      return `Due in ${daysUntilNext} days`;
    }
  };

  const renderPaymentHistoryItem = (payment: PaymentHistoryItem) => (
    <LinearGradient
      key={payment.transactionHash}
      colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 12, padding: 1, marginBottom: 8 }}
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
              backgroundColor="#0079c120"
              alignItems="center"
              justifyContent="center"
            >
              <Ionicons name="checkmark-circle" size={20} color="#0079c1" />
            </YStack>
            <YStack flex={1}>
              <Text fontSize={16} fontWeight="600" color="#FFFFFF" fontFamily="SpaceGrotesk_600SemiBold">
                Payment Executed
              </Text>
              <Text fontSize={12} color="rgba(255,255,255,0.6)" fontFamily="SpaceMono_400Regular">
                {payment.transactionHash.slice(0, 6)}...{payment.transactionHash.slice(-4)}
              </Text>
            </YStack>
          </XStack>
          <YStack alignItems="flex-end">
            <Text fontSize={16} fontWeight="700" color="#0079c1" fontFamily="SpaceGrotesk_700Bold">
              {formatAmount(payment.amount)}
            </Text>
            <Text fontSize={12} color="rgba(255,255,255,0.6)" fontFamily="SpaceGrotesk_400Regular">
              {formatTimestamp(payment.timestamp)}
            </Text>
          </YStack>
        </XStack>
      </YStack>
    </LinearGradient>
  );

  return (
    <LinearGradient
      colors={['#0a0e27', '#000000']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center" width="100%" paddingHorizontal={20} paddingTop={10} paddingBottom={20}>
          <TouchableOpacity onPress={onClose} disabled={cancelling}>
            <Ionicons name="arrow-back" size={28} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Subscription Details</Text>
          <TouchableOpacity onPress={handleCancelSubscription} disabled={cancelling}>
            {cancelling ? (
              <ActivityIndicator size="small" color="#ff4444" />
            ) : (
              <Ionicons name="trash-outline" size={24} color="#ff4444" />
            )}
          </TouchableOpacity>
        </XStack>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadPaymentHistory(true)}
              tintColor="#0079c1"
            />
          }
        >
          {/* Subscription Info */}
          <YStack marginBottom={24}>
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 12, padding: 1 }}
            >
              <YStack
                backgroundColor="rgba(10,14,39,0.6)"
                borderRadius={11}
                padding={20}
                borderWidth={1}
                borderColor="rgba(0,121,193,0.2)"
              >
                <XStack justifyContent="space-between" alignItems="center" marginBottom={16}>
                  <Text fontSize={20} fontWeight="700" color="#FFFFFF" fontFamily="SpaceGrotesk_700Bold">
                    Subscription #{subscription.subscriptionId}
                  </Text>
                  <YStack
                    backgroundColor={subscription.active ? "#00ff88" : "#ff4444"}
                    paddingHorizontal={12}
                    paddingVertical={6}
                    borderRadius={16}
                  >
                    <Text fontSize={12} fontWeight="600" color="#000000" fontFamily="SpaceGrotesk_600SemiBold">
                      {subscription.active ? "ACTIVE" : "CANCELLED"}
                    </Text>
                  </YStack>
                </XStack>

                <YStack gap={12}>
                  <XStack justifyContent="space-between">
                    <Text fontSize={14} color="rgba(255,255,255,0.6)" fontFamily="SpaceGrotesk_400Regular">
                      Vendor
                    </Text>
                    <Text fontSize={14} color="#FFFFFF" fontFamily="SpaceMono_400Regular">
                      {subscription.vendor.slice(0, 6)}...{subscription.vendor.slice(-4)}
                    </Text>
                  </XStack>

                  <XStack justifyContent="space-between">
                    <Text fontSize={14} color="rgba(255,255,255,0.6)" fontFamily="SpaceGrotesk_400Regular">
                      Amount
                    </Text>
                    <Text fontSize={14} color="#FFFFFF" fontFamily="SpaceGrotesk_400Regular">
                      {formatAmount(subscription.amountPerInterval)}
                    </Text>
                  </XStack>

                  <XStack justifyContent="space-between">
                    <Text fontSize={14} color="rgba(255,255,255,0.6)" fontFamily="SpaceGrotesk_400Regular">
                      Interval
                    </Text>
                    <Text fontSize={14} color="#FFFFFF" fontFamily="SpaceGrotesk_400Regular">
                      {formatInterval(parseInt(subscription.interval))}
                    </Text>
                  </XStack>

                  <XStack justifyContent="space-between">
                    <Text fontSize={14} color="rgba(255,255,255,0.6)" fontFamily="SpaceGrotesk_400Regular">
                      Last Payment
                    </Text>
                    <Text fontSize={14} color="#FFFFFF" fontFamily="SpaceGrotesk_400Regular">
                      {formatTimestamp(subscription.lastPayment)}
                    </Text>
                  </XStack>

                  <XStack justifyContent="space-between">
                    <Text fontSize={14} color="rgba(255,255,255,0.6)" fontFamily="SpaceGrotesk_400Regular">
                      Next Payment
                    </Text>
                    <Text fontSize={14} color="#0079c1" fontFamily="SpaceGrotesk_600SemiBold">
                      {calculateNextPayment()}
                    </Text>
                  </XStack>
                </YStack>
              </YStack>
            </LinearGradient>
          </YStack>

          {/* Payment History */}
          <YStack marginBottom={24}>
            <XStack justifyContent="space-between" alignItems="center" marginBottom={16}>
              <Text fontSize={18} fontWeight="700" color="#FFFFFF" fontFamily="SpaceGrotesk_700Bold">
                Payment History
              </Text>
              <Text fontSize={14} color="rgba(255,255,255,0.6)" fontFamily="SpaceGrotesk_400Regular">
                {paymentHistory.length} payments
              </Text>
            </XStack>

            {loading ? (
              <YStack alignItems="center" paddingVertical={48}>
                <ActivityIndicator size="large" color="#0079c1" />
                <Text fontSize={16} color="rgba(255,255,255,0.6)" fontFamily="SpaceGrotesk_400Regular" marginTop={16}>
                  Loading payment history...
                </Text>
              </YStack>
            ) : paymentHistory.length > 0 ? (
              paymentHistory.map(renderPaymentHistoryItem)
            ) : (
              <YStack alignItems="center" paddingVertical={48}>
                <Ionicons name="receipt-outline" size={48} color="rgba(255,255,255,0.3)" />
                <Text fontSize={16} fontWeight="600" color="rgba(255,255,255,0.6)" fontFamily="SpaceGrotesk_600SemiBold" marginTop={16} marginBottom={8}>
                  No Payment History
                </Text>
                <Text fontSize={13} color="rgba(255,255,255,0.4)" fontFamily="SpaceMono_400Regular" textAlign="center">
                  Payments will appear here when executed
                </Text>
              </YStack>
            )}
          </YStack>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  scrollView: {
    flex: 1,
  },
});
