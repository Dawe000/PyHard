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

import {
  getOrCreateSmartWallet,
  getSmartWalletPYUSDBalance,
} from "@/services/smartWallet";

const { width, height } = Dimensions.get('window');

// Arbitrum Sepolia network details
const ARBITRUM_SEPOLIA_CHAIN_ID = "421614";
const ARBITRUM_SEPOLIA_RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";
const PYUSD_CONTRACT_ADDRESS = "0x637A1259C6afd7E3AdF63993cA7E58BB438aB1B1"; // Real PYUSD on Arbitrum Sepolia
const PYUSD_DECIMALS = 6;

export const BalanceScreen = () => {
  const [usdBalance, setUsdBalance] = useState("0.00");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [smartWalletAddress, setSmartWalletAddress] = useState<string | null>(null);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);

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
      
      // Fetch PYUSD balance from SmartWallet
      const balance = await getSmartWalletPYUSDBalance(
        smartWalletAddress,
        provider,
        PYUSD_CONTRACT_ADDRESS,
        PYUSD_DECIMALS
      );
      
      setUsdBalance(balance);
      console.log("✅ SmartWallet balance fetched successfully:", balance);
      
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
              <Text style={styles.addressText}>{formatAddress(smartWalletAddress || account?.address || "")}</Text>
              <Ionicons name="copy-outline" size={16} color="#0070BA" />
            </TouchableOpacity>
          </View>
          {isCreatingWallet && (
            <View style={styles.walletCreationBanner}>
              <Ionicons name="hourglass-outline" size={16} color="#0070BA" />
              <Text style={styles.walletCreationText}>Creating your SmartWallet...</Text>
            </View>
          )}
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <LinearGradient
            colors={['#0070BA', '#0056B3']}
            style={styles.balanceGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.balanceLabel}>Your Balance</Text>
            <Text style={styles.balanceAmount}>${usdBalance}</Text>
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
  walletCreationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  walletCreationText: {
    fontSize: 14,
    color: '#0070BA',
    marginLeft: 8,
    fontWeight: '500',
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
