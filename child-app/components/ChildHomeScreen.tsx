import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ParentWalletInfo } from '../services/subWalletDetection';
import { loadChildWallet } from '../utils/crypto';
import { formatUnits } from 'viem';

const PYUSD_DECIMALS = 6;

interface ChildHomeScreenProps {
  onBack: () => void;
  walletInfo: ParentWalletInfo | null;
  onSendMoney?: () => void;
}

export const ChildHomeScreen: React.FC<ChildHomeScreenProps> = ({ onBack, walletInfo, onSendMoney }) => {
  const [loading, setLoading] = useState(true);
  const [childEOA, setChildEOA] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  useEffect(() => {
    if (walletInfo) {
      setLoading(false);
    }
  }, [walletInfo]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount: bigint | string) => {
    if (typeof amount === 'string') return amount;
    return parseFloat(formatUnits(amount, PYUSD_DECIMALS)).toFixed(2);
  };

  const getRemainingBalance = () => {
    if (!walletInfo) return '0.00';
    const limit = Number(formatAmount(walletInfo.subWalletInfo.spendingLimit));
    const spent = Number(formatAmount(walletInfo.subWalletInfo.spentThisPeriod));
    return (limit - spent).toFixed(2);
  };

  const calculateSpentPercentage = () => {
    if (!walletInfo) return 0;
    const limit = Number(formatAmount(walletInfo.subWalletInfo.spendingLimit));
    const spent = Number(formatAmount(walletInfo.subWalletInfo.spentThisPeriod));
    return limit > 0 ? (spent / limit) * 100 : 0;
  };

  const getDaysUntilReset = () => {
    if (!walletInfo) return 0;
    return Math.floor(
      (Number(walletInfo.subWalletInfo.periodStart) + Number(walletInfo.subWalletInfo.periodDuration) - Date.now() / 1000) / 86400
    );
  };


  if (loading) {
    return (
      <LinearGradient
        colors={['#0a0e27', '#1a1f3a', '#0a0e27']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0079c1" />
          <Text style={styles.loadingText}>Loading wallet...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!walletInfo) {
    return (
      <LinearGradient
        colors={['#0a0e27', '#1a1f3a', '#0a0e27']}
        style={styles.container}
      >
        <View style={styles.waitingContainer}>
          <Text style={styles.waitingTitle}>Waiting for Parent</Text>
          <Text style={styles.waitingText}>
            Your parent needs to scan your QR code and create your sub-account.
          </Text>
          <View style={styles.addressCard}>
            <Text style={styles.addressLabel}>Your Address</Text>
            <Text style={styles.addressValue}>{formatAddress(childEOA)}</Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0a0e27', '#1a1f3a', '#0a0e27']}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#0079c1"
          />
        }
      >
        {/* Header - Wallet Info */}
        <View style={styles.headerCard}>
          <LinearGradient
            colors={['rgba(0,121,193,0.1)', 'rgba(0,48,135,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradientBorder}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerTop}>
                <Text style={styles.greeting}>HELLO, CHILD</Text>
              </View>
              <TouchableOpacity style={styles.addressContainer}>
                <Text style={styles.addressLabel}>&gt; WALLET</Text>
                <Text style={styles.addressValue}>{formatAddress(childEOA)}</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceSection}>
          <LinearGradient
            colors={['rgba(0,121,193,0.3)', 'rgba(0,48,135,0.2)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceGradientBorder}
          >
            <View style={styles.balanceCard}>
              <Text style={styles.balanceTitle}>AVAILABLE BALANCE</Text>
              <Text style={styles.balanceAmount}>${getRemainingBalance()}</Text>
              <Text style={styles.balanceSubtext}>PYUSD</Text>
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>&gt; Live on Arbitrum Sepolia</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={onSendMoney || (() => Alert.alert('Send Money', 'Use the Send tab!'))}
            >
              <LinearGradient
                colors={['rgba(0,121,193,0.15)', 'rgba(0,121,193,0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.actionGradient}
              >
                <View style={styles.actionContent}>
                  <Ionicons name="send" size={28} color="#0079c1" />
                  <Text style={styles.actionText}>SEND</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => Alert.alert('Coming Soon', 'Add funds feature coming soon!')}
            >
              <LinearGradient
                colors={['rgba(0,121,193,0.15)', 'rgba(0,121,193,0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.actionGradient}
              >
                <View style={styles.actionContent}>
                  <Ionicons name="add-circle" size={28} color="#34C759" />
                  <Text style={styles.actionText}>ADD FUNDS</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 16,
    opacity: 0.8,
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  waitingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  waitingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  addressCard: {
    backgroundColor: 'rgba(26, 31, 58, 0.6)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
  },
  addressLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  addressValue: {
    color: '#0079c1',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  headerCard: {
    marginBottom: 16,
  },
  headerGradientBorder: {
    borderRadius: 16,
    padding: 1,
  },
  headerContent: {
    backgroundColor: 'rgba(10,14,39,0.6)',
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,121,193,0.2)',
  },
  headerTop: {
    marginBottom: 12,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    backgroundColor: 'rgba(0,121,193,0.1)',
    borderRadius: 8,
  },
  address: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.5,
    marginRight: 4,
  },
  addressMono: {
    fontSize: 12,
    color: '#0079c1',
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  balanceSection: {
    marginVertical: 16,
  },
  balanceGradientBorder: {
    borderRadius: 20,
    padding: 2,
  },
  balanceCard: {
    backgroundColor: 'rgba(10,14,39,0.8)',
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,121,193,0.3)',
  },
  balanceTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    marginBottom: 12,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  balanceSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'monospace',
  },
  liveBadge: {
    marginTop: 12,
    padding: 8,
    backgroundColor: 'rgba(0,121,193,0.15)',
    borderRadius: 8,
  },
  liveBadgeText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'monospace',
  },
  actionsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
  },
  actionGradient: {
    borderRadius: 16,
    padding: 1,
  },
  actionContent: {
    backgroundColor: 'rgba(10,14,39,0.6)',
    borderRadius: 15,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,121,193,0.2)',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
