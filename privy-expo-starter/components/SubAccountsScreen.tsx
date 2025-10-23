import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { YStack, XStack, Text } from "tamagui";
import { LinearGradient } from "expo-linear-gradient";
import { usePrivy, getUserEmbeddedEthereumWallet } from '@privy-io/expo';
import { getOrCreateSmartWallet } from '@/services/smartWallet';
import { createPublicClient, http, parseAbi } from 'viem';
import { arbitrumSepolia } from 'viem/chains';

interface ChildAccount {
  parent_wallet: string;
  child_eoa: string;
  child_name: string;
  sub_wallet_id: number;
  created_at: number;
}

export const SubAccountsScreen = () => {
  const { user } = usePrivy();
  const account = getUserEmbeddedEthereumWallet(user);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState<'saver' | 'sub_account'>('saver');
  const [subAccounts, setSubAccounts] = useState<ChildAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch child accounts from smart contract
  const fetchChildAccounts = async () => {
    if (!account?.address) return;
    
    try {
      setLoading(true);
      console.log('🔍 Fetching sub-accounts from smart contract for:', account.address);
      
      // Get Privy access token
      const { createPrivyClient } = await import('@privy-io/expo');
      const privyClient = createPrivyClient('cmgtb4vg702vqld0da5wktriq');
      const accessToken = await privyClient.getAccessToken();
      
      if (!accessToken) {
        throw new Error("Failed to get Privy access token.");
      }
      
      // Get smart wallet address first
      const smartWalletInfo = await getOrCreateSmartWallet(account.address, accessToken);
      const smartWalletAddress = smartWalletInfo.address;
      
      if (!smartWalletAddress) {
        console.log('❌ No smart wallet found');
        setSubAccounts([]);
        return;
      }

      // Create viem client for smart contract queries
      const publicClient = createPublicClient({
        chain: arbitrumSepolia,
        transport: http('https://sepolia-rollup.arbitrum.io/rpc')
      });

      // SmartWallet ABI for the functions we need
      const smartWalletAbi = parseAbi([
        'function getSubWalletCount() external view returns (uint256)',
        'function getSubWallet(uint256 subWalletId) external view returns (address childEOA, uint256 spendingLimit, uint256 spentThisPeriod, uint256 periodStart, uint256 periodDuration, uint8 mode, bool active)'
      ]);

      // Get sub-account count
      const subWalletCount = await publicClient.readContract({
        address: smartWalletAddress as `0x${string}`,
        abi: smartWalletAbi,
        functionName: 'getSubWalletCount'
      });
      
      console.log(`📊 Found ${subWalletCount} sub-accounts`);
      
      if (subWalletCount === 0n) {
        setSubAccounts([]);
        return;
      }
      
      // Fetch each sub-account
      const subAccounts = [];
      for (let i = 1; i <= Number(subWalletCount); i++) {
        try {
          // Get sub-wallet details using viem
          const subWalletData = await publicClient.readContract({
            address: smartWalletAddress as `0x${string}`,
            abi: smartWalletAbi,
            functionName: 'getSubWallet',
            args: [BigInt(i)]
          });
          
          const [childEOA, spendingLimit, spentThisPeriod, periodStart, periodDuration, mode, active] = subWalletData;
          
          console.log(`📊 Sub-wallet ${i}:`, {
            childEOA,
            spendingLimit: spendingLimit.toString(),
            spentThisPeriod: spentThisPeriod.toString(),
            periodStart: periodStart.toString(),
            periodDuration: periodDuration.toString(),
            mode: Number(mode),
            active
          });
          
          subAccounts.push({
            parent_wallet: smartWalletAddress,
            child_eoa: childEOA,
            child_name: `Child ${i}`, // We'll need to get this from events or store it
            sub_wallet_id: i,
            created_at: Number(periodStart), // Use period start as creation time
            limit: Number(spendingLimit),
            limit_display: (Number(spendingLimit) / 1000000).toFixed(2), // Convert from wei to PYUSD
            spent_this_period: Number(spentThisPeriod),
            period_duration: Number(periodDuration),
            mode: Number(mode),
            active: active
          });
        } catch (subError) {
          console.error(`❌ Error fetching sub-account ${i}:`, subError);
        }
      }
      
      console.log('✅ Sub-accounts fetched from contract:', subAccounts);
      setSubAccounts(subAccounts);
      
    } catch (error) {
      console.error('❌ Error fetching sub-accounts:', error);
      setSubAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchChildAccounts();
  }, [account?.address]);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChildAccounts();
    setRefreshing(false);
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'saver':
        return 'card';
      case 'sub_account':
        return 'wallet';
      default:
        return 'person';
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'saver':
        return '#0079c1';
      case 'sub_account':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#34C759';
      case 'paused':
        return '#FF9500';
      case 'inactive':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const handleCreateAccount = () => {
    if (!newAccountName.trim()) {
      Alert.alert("Error", "Please enter a name for the sub-account");
      return;
    }

    const newAccount = {
      id: (subAccounts.length + 1).toString(),
      name: newAccountName,
      type: newAccountType,
      balance: '0.00',
      spendingLimit: '100.00',
      spentThisPeriod: '0.00',
      periodStart: new Date().toISOString().split('T')[0],
      periodDuration: newAccountType === 'sub_account' ? '7 days' : '30 days',
      status: 'active',
      childEOA: '0x' + Math.random().toString(16).substr(2, 8) + '...' + Math.random().toString(16).substr(2, 4)
    };

    setSubAccounts([...subAccounts, newAccount]);
    setNewAccountName('');
    setShowCreateModal(false);
    Alert.alert("Success", "Sub-account created successfully!");
  };

  const renderSubAccount = (childAccount: ChildAccount) => (
    <TouchableOpacity
      key={childAccount.sub_wallet_id}
      onPress={() => Alert.alert("Child Account Details", `Name: ${childAccount.child_name}\nEOA: ${childAccount.child_eoa}\nSub-Wallet ID: ${childAccount.sub_wallet_id}`)}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 16, padding: 1, marginBottom: 16 }}
      >
        <YStack
          backgroundColor="rgba(10,14,39,0.6)"
          borderRadius={15}
          padding={20}
          borderWidth={1}
          borderColor="rgba(0,121,193,0.2)"
        >
          {/* Header */}
          <XStack justifyContent="space-between" alignItems="center" marginBottom={16}>
            <XStack alignItems="center" gap={12} flex={1}>
              <YStack
                width={48}
                height={48}
                borderRadius={24}
                backgroundColor={getAccountTypeColor(account.type) + '20'}
                alignItems="center"
                justifyContent="center"
              >
                <Ionicons
                  name={getAccountTypeIcon(account.type)}
                  size={24}
                  color={getAccountTypeColor(account.type)}
                />
              </YStack>
              <YStack flex={1}>
                <Text fontSize={16} fontWeight="700" color="#FFFFFF" fontFamily="SpaceGrotesk_700Bold" marginBottom={4}>
                  {childAccount.child_name.toUpperCase()}
                </Text>
                <Text fontSize={12} color="rgba(255,255,255,0.5)" fontFamily="SpaceMono_400Regular">
                  &gt; Sub Account
                </Text>
              </YStack>
            </XStack>
            <YStack backgroundColor="#34C75920" paddingHorizontal={12} paddingVertical={6} borderRadius={16}>
              <Text fontSize={10} fontWeight="600" color="#34C759" fontFamily="SpaceGrotesk_600SemiBold" letterSpacing={0.5}>
                ACTIVE
              </Text>
            </YStack>
          </XStack>

          {/* Monthly Limit */}
          <YStack marginBottom={16} backgroundColor="rgba(0,121,193,0.1)" padding={12} borderRadius={12}>
            <Text fontSize={11} color="rgba(255,255,255,0.5)" fontFamily="SpaceGrotesk_700Bold" letterSpacing={1} marginBottom={4}>
              MONTHLY LIMIT
            </Text>
            <Text fontSize={16} fontWeight="700" color="#FFFFFF" fontFamily="SpaceMono_400Regular">
              {(childAccount as any).limit_display || '0.00'} PYUSD
            </Text>
          </YStack>

          {/* Details */}
          <YStack gap={8} marginBottom={16}>
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={12} color="rgba(255,255,255,0.5)" fontFamily="SpaceMono_400Regular">
                &gt; Sub-Wallet ID
              </Text>
              <Text fontSize={12} fontWeight="600" color="#FFFFFF" fontFamily="SpaceGrotesk_600SemiBold">
                #{childAccount.sub_wallet_id}
              </Text>
            </XStack>
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={12} color="rgba(255,255,255,0.5)" fontFamily="SpaceMono_400Regular">
                &gt; Created
              </Text>
              <Text fontSize={12} fontWeight="600" color="#FFFFFF" fontFamily="SpaceGrotesk_600SemiBold">
                {new Date(childAccount.created_at * 1000).toLocaleDateString()}
              </Text>
            </XStack>
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={12} color="rgba(255,255,255,0.5)" fontFamily="SpaceMono_400Regular">
                &gt; Child EOA
              </Text>
              <Text fontSize={12} fontWeight="600" color="#0079c1" fontFamily="SpaceMono_400Regular">
                {childAccount.child_eoa.slice(0, 6)}...{childAccount.child_eoa.slice(-4)}
              </Text>
            </XStack>
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={12} color="rgba(255,255,255,0.5)" fontFamily="SpaceMono_400Regular">
                &gt; Full EOA
              </Text>
              <Text fontSize={12} fontWeight="600" color="#0079c1" fontFamily="SpaceMono_400Regular">
                {childAccount.child_eoa}
              </Text>
            </XStack>
          </YStack>

          {/* Actions */}
          <XStack gap={8} justifyContent="space-between">
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => Alert.alert("Coming Soon", "Manage feature coming soon!")}
            >
              <YStack backgroundColor="rgba(0,121,193,0.15)" paddingVertical={10} paddingHorizontal={12} borderRadius={8} alignItems="center">
                <XStack alignItems="center" gap={6}>
                  <Ionicons name="settings-outline" size={16} color="#0079c1" />
                  <Text fontSize={11} fontWeight="600" color="#0079c1" fontFamily="SpaceGrotesk_600SemiBold">
                    MANAGE
                  </Text>
                </XStack>
              </YStack>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => Alert.alert("Coming Soon", "Fund feature coming soon!")}
            >
              <YStack backgroundColor="rgba(52,199,89,0.15)" paddingVertical={10} paddingHorizontal={12} borderRadius={8} alignItems="center">
                <XStack alignItems="center" gap={6}>
                  <Ionicons name="add-outline" size={16} color="#34C759" />
                  <Text fontSize={11} fontWeight="600" color="#34C759" fontFamily="SpaceGrotesk_600SemiBold">
                    FUND
                  </Text>
                </XStack>
              </YStack>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => Alert.alert("Coming Soon", "View transactions coming soon!")}
            >
              <YStack backgroundColor="rgba(255,255,255,0.1)" paddingVertical={10} paddingHorizontal={12} borderRadius={8} alignItems="center">
                <XStack alignItems="center" gap={6}>
                  <Ionicons name="list-outline" size={16} color="rgba(255,255,255,0.7)" />
                  <Text fontSize={11} fontWeight="600" color="rgba(255,255,255,0.7)" fontFamily="SpaceGrotesk_600SemiBold">
                    HISTORY
                  </Text>
                </XStack>
              </YStack>
            </TouchableOpacity>
          </XStack>
        </YStack>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <YStack paddingHorizontal={16} paddingTop={20} paddingBottom={10}>
        <XStack justifyContent="space-between" alignItems="center" marginBottom={16}>
          <Text fontSize={24} fontWeight="700" color="#FFFFFF" fontFamily="SpaceGrotesk_700Bold">
            SUB-ACCOUNTS
          </Text>
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
          >
            <YStack
              backgroundColor="#0079c1"
              width={44}
              height={44}
              borderRadius={22}
              alignItems="center"
              justifyContent="center"
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </YStack>
          </TouchableOpacity>
        </XStack>
      </YStack>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={{ paddingHorizontal: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0079c1"
          />
        }
      >
        {loading ? (
          <YStack alignItems="center" paddingVertical={48}>
            <Ionicons name="hourglass-outline" size={48} color="rgba(255,255,255,0.3)" />
            <Text fontSize={16} fontWeight="600" color="rgba(255,255,255,0.6)" fontFamily="SpaceGrotesk_600SemiBold" marginTop={16}>
              Loading Sub-Accounts...
            </Text>
          </YStack>
        ) : subAccounts.length > 0 ? (
          subAccounts.map(renderSubAccount)
        ) : (
          <YStack alignItems="center" paddingVertical={48}>
            <Ionicons name="people-outline" size={48} color="rgba(255,255,255,0.3)" />
            <Text fontSize={16} fontWeight="600" color="rgba(255,255,255,0.6)" fontFamily="SpaceGrotesk_600SemiBold" marginTop={16} marginBottom={8}>
              No Sub-Accounts Yet
            </Text>
            <Text fontSize={13} color="rgba(255,255,255,0.4)" fontFamily="SpaceMono_400Regular" textAlign="center" marginBottom={24}>
              &gt; Scan a child's QR code to create their sub-account
            </Text>
            <TouchableOpacity
              onPress={() => setShowCreateModal(true)}
            >
              <YStack backgroundColor="#0079c1" paddingHorizontal={24} paddingVertical={12} borderRadius={8}>
                <Text fontSize={14} fontWeight="600" color="#FFFFFF" fontFamily="SpaceGrotesk_600SemiBold">
                  CREATE FIRST SUB-ACCOUNT
                </Text>
              </YStack>
            </TouchableOpacity>
          </YStack>
        )}
      </ScrollView>

      {/* Create Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <YStack flex={1} backgroundColor="rgba(0, 0, 0, 0.7)" justifyContent="flex-end">
          <YStack
            backgroundColor="#0a0e27"
            borderTopLeftRadius={20}
            borderTopRightRadius={20}
            paddingTop={20}
          >
            <XStack justifyContent="space-between" alignItems="center" paddingHorizontal={20} marginBottom={20}>
              <Text fontSize={20} fontWeight="700" color="#FFFFFF" fontFamily="SpaceGrotesk_700Bold">
                CREATE SUB-ACCOUNT
              </Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </XStack>

            <YStack paddingHorizontal={20} marginBottom={20}>
              <Text fontSize={14} fontWeight="600" color="rgba(255,255,255,0.7)" fontFamily="SpaceGrotesk_600SemiBold" marginBottom={8} letterSpacing={0.5}>
                ACCOUNT NAME
              </Text>
              <TextInput
                style={styles.textInput}
                value={newAccountName}
                onChangeText={setNewAccountName}
                placeholder="Enter account name"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />

              <Text fontSize={14} fontWeight="600" color="rgba(255,255,255,0.7)" fontFamily="SpaceGrotesk_600SemiBold" marginBottom={8} marginTop={16} letterSpacing={0.5}>
                ACCOUNT TYPE
              </Text>
              <XStack gap={8}>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => setNewAccountType('saver')}
                >
                  <YStack
                    padding={16}
                    borderRadius={12}
                    borderWidth={2}
                    borderColor={newAccountType === 'saver' ? '#0079c1' : 'rgba(255,255,255,0.2)'}
                    backgroundColor={newAccountType === 'saver' ? 'rgba(0,121,193,0.1)' : 'transparent'}
                    alignItems="center"
                    gap={8}
                  >
                    <Ionicons
                      name="card"
                      size={20}
                      color={newAccountType === 'saver' ? '#0079c1' : 'rgba(255,255,255,0.5)'}
                    />
                    <Text
                      fontSize={12}
                      fontWeight="600"
                      color={newAccountType === 'saver' ? '#0079c1' : 'rgba(255,255,255,0.5)'}
                      fontFamily="SpaceGrotesk_600SemiBold"
                    >
                      SAVER
                    </Text>
                  </YStack>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => setNewAccountType('sub_account')}
                >
                  <YStack
                    padding={16}
                    borderRadius={12}
                    borderWidth={2}
                    borderColor={newAccountType === 'sub_account' ? '#0079c1' : 'rgba(255,255,255,0.2)'}
                    backgroundColor={newAccountType === 'sub_account' ? 'rgba(0,121,193,0.1)' : 'transparent'}
                    alignItems="center"
                    gap={8}
                  >
                    <Ionicons
                      name="wallet"
                      size={20}
                      color={newAccountType === 'sub_account' ? '#0079c1' : 'rgba(255,255,255,0.5)'}
                    />
                    <Text
                      fontSize={12}
                      fontWeight="600"
                      color={newAccountType === 'sub_account' ? '#0079c1' : 'rgba(255,255,255,0.5)'}
                      fontFamily="SpaceGrotesk_600SemiBold"
                    >
                      SUB ACCOUNT
                    </Text>
                  </YStack>
                </TouchableOpacity>
              </XStack>
            </YStack>

            <XStack paddingHorizontal={20} paddingBottom={20} gap={8}>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => setShowCreateModal(false)}
              >
                <YStack paddingVertical={16} alignItems="center">
                  <Text fontSize={16} fontWeight="600" color="rgba(255,255,255,0.5)" fontFamily="SpaceGrotesk_600SemiBold">
                    CANCEL
                  </Text>
                </YStack>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={handleCreateAccount}
              >
                <YStack backgroundColor="#0079c1" paddingVertical={16} alignItems="center" borderRadius={12}>
                  <Text fontSize={16} fontWeight="600" color="#FFFFFF" fontFamily="SpaceGrotesk_600SemiBold">
                    CREATE
                  </Text>
                </YStack>
              </TouchableOpacity>
            </XStack>
          </YStack>
        </YStack>
      </Modal>
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
  textInput: {
    borderWidth: 1,
    borderColor: 'rgba(0,121,193,0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: 'rgba(10,14,39,0.6)',
    fontFamily: 'SpaceGrotesk_400Regular',
  },
});
