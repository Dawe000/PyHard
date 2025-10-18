import React, { useState, useCallback, useEffect } from "react";
import { 
  Text, 
  View, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
  RefreshControl
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

import {
  usePrivy,
  useEmbeddedEthereumWallet,
  getUserEmbeddedEthereumWallet,
} from "@privy-io/expo";

const { width, height } = Dimensions.get('window');

// Arbitrum Sepolia network details
const ARBITRUM_SEPOLIA_CHAIN_ID = "421614";
const ARBITRUM_SEPOLIA_RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";
const PYUSD_CONTRACT_ADDRESS = "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8"; // Arbitrum Sepolia PYUSD
const PYUSD_DECIMALS = 6;

export const BalanceScreen = () => {
  const [usdBalance, setUsdBalance] = useState("0.00");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { user } = usePrivy();
  const { wallets } = useEmbeddedEthereumWallet();
  const account = getUserEmbeddedEthereumWallet(user);

  const fetchBalances = useCallback(async (isManualRefresh = false) => {
    if (!account?.address) {
      console.log("❌ No wallet address available");
      setUsdBalance("0.00");
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
      const provider = await wallets[0].getProvider();
      
      // Check current network
      const networkId = await provider.request({
        method: "net_version",
        params: [],
      });
      
      if (networkId !== ARBITRUM_SEPOLIA_CHAIN_ID) {
        console.log("⚠️ Wallet is not on Arbitrum Sepolia network!");
        Alert.alert(
          "Wrong Network", 
          `Your wallet is on network ${networkId}, but Arbitrum Sepolia is ${ARBITRUM_SEPOLIA_CHAIN_ID}. Please switch networks.`
        );
        return;
      }
      
      // Fetch PYUSD balance and convert to USD
      const pyusdCallData = `0x70a08231000000000000000000000000${account.address.slice(2)}`;
      
      const pyusdBalanceHex = await provider.request({
        method: "eth_call",
        params: [
          {
            to: PYUSD_CONTRACT_ADDRESS,
            data: pyusdCallData,
          },
          "latest",
        ],
      });
      
      if (pyusdBalanceHex && pyusdBalanceHex !== "0x") {
        const pyusdBalance = (parseInt(pyusdBalanceHex, 16) / Math.pow(10, PYUSD_DECIMALS)).toFixed(2);
        setUsdBalance(pyusdBalance);
      } else {
        setUsdBalance("0.00");
      }
      
      console.log("✅ Balances fetched successfully");
      
    } catch (error: any) {
      console.error("❌ Error fetching balances:", error);
      Alert.alert("Error", `Failed to fetch balances: ${error.message}`);
    } finally {
      setIsRefreshing(false);
    }
  }, [account?.address, wallets]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  const copyAddress = useCallback(async () => {
    if (!account?.address) return;
    
    try {
      await Clipboard.setStringAsync(account.address);
      Alert.alert("Copied", "Wallet address copied to clipboard");
    } catch (error) {
      console.error("Error copying address:", error);
    }
  }, [account?.address]);

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchBalances(true)}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.greeting}>Hello, {user?.email?.split('@')[0] || 'User'}</Text>
            <TouchableOpacity onPress={copyAddress} style={styles.addressButton}>
              <Text style={styles.addressText}>{formatAddress(account?.address || "")}</Text>
              <Ionicons name="copy-outline" size={16} color="#0070BA" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <LinearGradient
            colors={['#0070BA', '#0056B3']}
            style={styles.balanceGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.balanceLabel}>USD Balance</Text>
            <Text style={styles.balanceAmount}>${usdBalance}</Text>
            <Text style={styles.balanceSubtext}>Available to send</Text>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert("Coming Soon", "Add funds feature coming soon!")}>
              <View style={styles.actionButtonContent}>
                <Ionicons name="add-circle" size={24} color="#34C759" />
                <Text style={styles.actionButtonText}>Add Funds</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert("Coming Soon", "Withdraw funds feature coming soon!")}>
              <View style={styles.actionButtonContent}>
                <Ionicons name="remove-circle" size={24} color="#FF3B30" />
                <Text style={styles.actionButtonText}>Withdraw</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert("Coming Soon", "Send feature coming soon!")}>
              <View style={styles.actionButtonContent}>
                <Ionicons name="arrow-up" size={24} color="#0070BA" />
                <Text style={styles.actionButtonText}>Send</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert("Coming Soon", "Receive feature coming soon!")}>
              <View style={styles.actionButtonContent}>
                <Ionicons name="arrow-down" size={24} color="#0070BA" />
                <Text style={styles.actionButtonText}>Receive</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity Placeholder */}
        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityPlaceholder}>
            <Ionicons name="time-outline" size={48} color="#C7C7CC" />
            <Text style={styles.placeholderText}>No recent transactions</Text>
            <Text style={styles.placeholderSubtext}>Your transaction history will appear here</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  addressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addressText: {
    fontSize: 12,
    color: '#0070BA',
    marginRight: 4,
    fontFamily: 'monospace',
  },
  balanceCard: {
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  balanceGradient: {
    padding: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickActions: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  actionButtonContent: {
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0070BA',
    marginTop: 8,
  },
  recentActivity: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  activityPlaceholder: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 12,
    marginBottom: 4,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
  },
});
