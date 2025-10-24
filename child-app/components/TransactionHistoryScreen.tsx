import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getChildTransactions, ChildTransaction } from '../services/transactionHistoryService';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  type: 'sent' | 'received';
  amount: string;
}

interface TransactionHistoryScreenProps {
  walletAddress?: string;
  smartWalletAddress?: string;
  onBack?: () => void;
}

export const TransactionHistoryScreen: React.FC<TransactionHistoryScreenProps> = ({ 
  walletAddress,
  smartWalletAddress,
  onBack 
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  console.log('📊 TransactionHistoryScreen - childEOA:', walletAddress);
  console.log('📊 TransactionHistoryScreen - smartWallet:', smartWalletAddress);

  useEffect(() => {
    loadTransactions();
  }, [smartWalletAddress]);

  const loadTransactions = async (isRefresh = false) => {
    if (!smartWalletAddress || !walletAddress) {
      console.log('❌ No wallet addresses provided');
      setIsLoading(false);
      return;
    }

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      console.log('🔍 Fetching transactions for child wallet:', walletAddress);
      console.log('🔍 Through parent smart wallet:', smartWalletAddress);
      
      // Load transactions using the new service
      // This filters transactions from the parent wallet by this specific child
      const childTxs = await getChildTransactions(walletAddress, smartWalletAddress);
      
      console.log(`✅ Loaded ${childTxs.length} transactions for this child`);
      setTransactions(childTxs as Transaction[]);
    } catch (error) {
      console.error('❌ Error loading transactions:', error);
      Alert.alert('Error', 'Failed to load transaction history');
      setTransactions([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isSent = item.type === 'sent';

    return (
      <TouchableOpacity style={styles.transactionCard}>
        <LinearGradient
          colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.transactionGradient}
        >
          <View style={styles.transactionContent}>
            <View style={styles.transactionLeft}>
              <View style={[
                styles.iconContainer,
                { backgroundColor: isSent ? 'rgba(255,59,48,0.2)' : 'rgba(52,199,89,0.2)' }
              ]}>
                <Ionicons
                  name={isSent ? 'arrow-up' : 'arrow-down'}
                  size={20}
                  color={isSent ? '#FF3B30' : '#34C759'}
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionType}>
                  {isSent ? 'Sent to' : 'Received from'} {formatAddress(isSent ? item.to : item.from)}
                </Text>
                <Text style={styles.transactionTime}>
                  &gt; {formatTimestamp(item.timeStamp)}
                </Text>
              </View>
            </View>
            <View style={styles.transactionRight}>
              <Text style={[
                styles.transactionAmount,
                { color: isSent ? '#FF3B30' : '#34C759' }
              ]}>
                {isSent ? '-' : '+'}${item.amount}
              </Text>
              <View style={styles.tokenBadge}>
                <Text style={styles.tokenBadgeText}>PYUSD</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (!smartWalletAddress) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="rgba(255,59,48,0.5)" />
          <Text style={styles.emptyText}>Wallet Not Connected</Text>
          <Text style={styles.emptySubtext}>
            Please connect your wallet to view transaction history
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={64} color="rgba(255,255,255,0.3)" />
        <Text style={styles.emptyText}>No Transactions Yet</Text>
        <Text style={styles.emptySubtext}>
          Your transaction history will appear here
        </Text>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#0a0e27', '#001133', '#0a0e27']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0079c1" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>TRANSACTION HISTORY</Text>
        <Ionicons name="receipt" size={28} color="#0079c1" />
      </View>

      {/* Wallet Address Info */}
      {walletAddress && (
        <View style={styles.walletInfo}>
          <Text style={styles.walletLabel}>Wallet Address</Text>
          <Text style={styles.walletAddress}>
            {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
          </Text>
        </View>
      )}

      {/* Transaction List */}
      {isLoading && transactions.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0079c1" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.hash}
          renderItem={renderTransaction}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadTransactions(true)}
              tintColor="#0079c1"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    flex: 1,
  },
  walletInfo: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  walletLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  walletAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0079c1',
    fontFamily: 'monospace',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  transactionCard: {
    marginBottom: 12,
  },
  transactionGradient: {
    borderRadius: 12,
    padding: 1,
  },
  transactionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(10,14,39,0.6)',
    borderRadius: 11,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,121,193,0.2)',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'monospace',
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  tokenBadge: {
    backgroundColor: 'rgba(52,199,89,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tokenBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#34C759',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 16,
  },
});
