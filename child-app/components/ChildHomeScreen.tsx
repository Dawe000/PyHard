import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ParentWalletInfo } from '../services/subWalletDetection';
import { loadChildWallet } from '../utils/crypto';

interface ChildHomeScreenProps {
  onBack: () => void;
  walletInfo: ParentWalletInfo | null;
}

export const ChildHomeScreen: React.FC<ChildHomeScreenProps> = ({ onBack, walletInfo }) => {
  const [loading, setLoading] = useState(true);
  const [childEOA, setChildEOA] = useState<string>('');

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const wallet = await loadChildWallet();
        if (wallet) {
          setChildEOA(wallet.address);
          console.log(`👶 Child EOA loaded: ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`);
        }
      } catch (error) {
        console.error('❌ Error loading child wallet:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWallet();
  }, []);

  // If we have walletInfo, we're ready to show the home screen
  useEffect(() => {
    if (walletInfo) {
      setLoading(false);
    }
  }, [walletInfo]);

  const handleSendMoney = () => {
    Alert.alert(
      'Send Money', 
      'Send money functionality coming soon!\n\nThis will allow you to send PYUSD to other addresses using your sub-wallet.',
      [{ text: 'OK' }]
    );
  };

  const handleViewTransactions = () => {
    Alert.alert('Transactions', 'Transaction history coming soon!');
  };

  const formatAmount = (amount: bigint, decimals: number = 6) => {
    return (Number(amount) / Math.pow(10, decimals)).toFixed(2);
  };

  const formatTimestamp = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const getRemainingBalance = () => {
    if (!walletInfo) return '0.00';
    const remaining = walletInfo.subWalletInfo.spendingLimit - walletInfo.subWalletInfo.spentThisPeriod;
    return formatAmount(remaining);
  };

  const getTimeUntilReset = () => {
    if (!walletInfo) return 'Unknown';
    
    const periodStart = Number(walletInfo.subWalletInfo.periodStart);
    const periodDuration = Number(walletInfo.subWalletInfo.periodDuration);
    const nextReset = periodStart + periodDuration;
    const now = Math.floor(Date.now() / 1000);
    
    if (now >= nextReset) {
      return 'Period has ended';
    }
    
    const timeLeft = nextReset - now;
    const days = Math.floor(timeLeft / (24 * 60 * 60));
    const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((timeLeft % (60 * 60)) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getSpentAmount = () => {
    if (!walletInfo) return '0.00';
    return formatAmount(walletInfo.subWalletInfo.spentThisPeriod);
  };

  const getTotalLimit = () => {
    if (!walletInfo) return '0.00';
    return formatAmount(walletInfo.subWalletInfo.spendingLimit);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading your wallet...</Text>
      </View>
    );
  }

  if (!walletInfo) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Child Wallet</Text>
        </View>
        
        <View style={styles.content}>
          <Ionicons name="hourglass-outline" size={64} color="#ccc" />
          <Text style={styles.waitingTitle}>Waiting for Parent</Text>
          <Text style={styles.waitingText}>
            Your parent needs to scan your QR code and create your sub-account.
          </Text>
          <Text style={styles.childAddress}>
            Your EOA: {childEOA.slice(0, 6)}...{childEOA.slice(-4)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>My Wallet</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: walletInfo.subWalletInfo.active ? '#34C759' : '#FF3B30' }]} />
              <Text style={styles.statusText}>
                {walletInfo.subWalletInfo.active ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.balanceAmount}>
            {getRemainingBalance()} PYUSD
          </Text>
          
          <View style={styles.balanceDetails}>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceDetailLabel}>Monthly Limit:</Text>
              <Text style={styles.balanceDetailValue}>{getTotalLimit()} PYUSD</Text>
            </View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceDetailLabel}>Spent:</Text>
              <Text style={styles.balanceDetailValue}>{getSpentAmount()} PYUSD</Text>
            </View>
          </View>
          
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.timeRemaining}>
              Reset in: {getTimeUntilReset()}
            </Text>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min((Number(walletInfo.subWalletInfo.spentThisPeriod) / Number(walletInfo.subWalletInfo.spendingLimit)) * 100, 100)}%` 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {((Number(walletInfo.subWalletInfo.spentThisPeriod) / Number(walletInfo.subWalletInfo.spendingLimit)) * 100).toFixed(1)}% used
            </Text>
          </View>
        </View>

        {/* Wallet Info */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Wallet Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Parent EOA:</Text>
            <Text style={styles.infoValue}>
              {walletInfo.parentEOA.slice(0, 6)}...{walletInfo.parentEOA.slice(-4)}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Smart Wallet:</Text>
            <Text style={styles.infoValue}>
              {walletInfo.smartWalletAddress.slice(0, 6)}...{walletInfo.smartWalletAddress.slice(-4)}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sub-Wallet ID:</Text>
            <Text style={styles.infoValue}>#{walletInfo.subWalletId}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Period Start:</Text>
            <Text style={styles.infoValue}>{formatTimestamp(walletInfo.subWalletInfo.periodStart)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Period Duration:</Text>
            <Text style={styles.infoValue}>{Number(walletInfo.subWalletInfo.periodDuration) / (24 * 60 * 60)} days</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mode:</Text>
            <Text style={styles.infoValue}>
              {walletInfo.subWalletInfo.mode === 0 ? 'Allowance' : 'Pocket Money'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={[styles.infoValue, { color: walletInfo.subWalletInfo.active ? '#34C759' : '#FF3B30' }]}>
              {walletInfo.subWalletInfo.active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="wallet-outline" size={24} color="#007bff" />
            <Text style={styles.statValue}>#{walletInfo.subWalletId}</Text>
            <Text style={styles.statLabel}>Sub-Wallet ID</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={24} color="#34C759" />
            <Text style={styles.statValue}>{Number(walletInfo.subWalletInfo.periodDuration) / (24 * 60 * 60)}d</Text>
            <Text style={styles.statLabel}>Period</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name={walletInfo.subWalletInfo.mode === 0 ? "card-outline" : "cash-outline"} size={24} color="#FF9500" />
            <Text style={styles.statValue}>{walletInfo.subWalletInfo.mode === 0 ? 'Allowance' : 'Pocket'}</Text>
            <Text style={styles.statLabel}>Mode</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.primaryAction]} onPress={handleSendMoney}>
            <Ionicons name="send" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Send Money</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.secondaryAction]} onPress={handleViewTransactions}>
            <Ionicons name="receipt-outline" size={20} color="#007bff" />
            <Text style={[styles.actionButtonText, styles.secondaryActionText]}>Transactions</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 40,
  },
  balanceCard: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  balanceDetails: {
    marginTop: 16,
    marginBottom: 12,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  balanceDetailLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  balanceDetailValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  timeRemaining: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 12,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryAction: {
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  secondaryAction: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActionText: {
    color: '#007bff',
  },
  waitingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  waitingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  childAddress: {
    fontSize: 14,
    color: '#007bff',
    fontFamily: 'monospace',
  },
});
