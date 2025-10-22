import React, { useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { YStack, XStack, Text } from "tamagui";
import { LinearGradient } from "expo-linear-gradient";

export const TransactionsScreen = () => {
  const [selectedTab, setSelectedTab] = useState<'transactions' | 'contracts'>('transactions');

  // Mock transaction data
  const mockTransactions = [
    {
      id: '1',
      type: 'send',
      amount: '50.00',
      currency: 'PYUSD',
      to: '0x742d...8a9b',
      timestamp: '2 hours ago',
      status: 'completed',
      hash: '0x1234...5678'
    },
    {
      id: '2',
      type: 'receive',
      amount: '25.00',
      currency: 'PYUSD',
      from: '0x8a9b...742d',
      timestamp: '1 day ago',
      status: 'completed',
      hash: '0x5678...1234'
    },
    {
      id: '3',
      type: 'swap',
      amount: '100.00',
      currency: 'PYUSD',
      to: 'ETH',
      timestamp: '3 days ago',
      status: 'completed',
      hash: '0x9abc...def0'
    }
  ];

  // Mock contract interactions
  const mockContracts = [
    {
      id: '1',
      name: 'PYUSD Token Contract',
      address: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8',
      method: 'transfer',
      timestamp: '2 hours ago',
      status: 'completed',
      hash: '0x1234...5678'
    },
    {
      id: '2',
      name: 'Uniswap V3 Router',
      address: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
      method: 'swapExactTokensForTokens',
      timestamp: '3 days ago',
      status: 'completed',
      hash: '0x5678...1234'
    }
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return 'arrow-up';
      case 'receive':
        return 'arrow-down';
      case 'swap':
        return 'swap-horizontal';
      default:
        return 'swap-horizontal';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'send':
        return '#FF3B30';
      case 'receive':
        return '#34C759';
      case 'swap':
        return '#0079c1';
      default:
        return '#8E8E93';
    }
  };

  const renderTransaction = (transaction: any) => (
    <TouchableOpacity
      key={transaction.id}
      onPress={() => Alert.alert("Transaction Details", `Hash: ${transaction.hash}\nStatus: ${transaction.status}`)}
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
                backgroundColor={getTransactionColor(transaction.type) + '20'}
                alignItems="center"
                justifyContent="center"
              >
                <Ionicons
                  name={getTransactionIcon(transaction.type)}
                  size={20}
                  color={getTransactionColor(transaction.type)}
                />
              </YStack>
              <YStack flex={1}>
                <Text fontSize={14} fontWeight="600" color="#FFFFFF" fontFamily="SpaceGrotesk_600SemiBold" marginBottom={4}>
                  {transaction.type === 'send' ? 'Sent to' :
                   transaction.type === 'receive' ? 'Received from' :
                   'Swapped to'} {transaction.to || transaction.from}
                </Text>
                <Text fontSize={12} color="rgba(255,255,255,0.5)" fontFamily="SpaceMono_400Regular">
                  &gt; {transaction.timestamp}
                </Text>
              </YStack>
            </XStack>
            <YStack alignItems="flex-end" gap={4}>
              <Text
                fontSize={16}
                fontWeight="700"
                color={transaction.type === 'receive' ? '#34C759' : '#FF3B30'}
                fontFamily="SpaceGrotesk_700Bold"
              >
                {transaction.type === 'receive' ? '+' : '-'}${transaction.amount}
              </Text>
              <YStack backgroundColor="rgba(52,199,89,0.2)" paddingHorizontal={8} paddingVertical={4} borderRadius={12}>
                <Text fontSize={10} fontWeight="600" color="#34C759" fontFamily="SpaceGrotesk_600SemiBold" letterSpacing={0.5}>
                  {transaction.status.toUpperCase()}
                </Text>
              </YStack>
            </YStack>
          </XStack>
        </YStack>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderContract = (contract: any) => (
    <TouchableOpacity
      key={contract.id}
      onPress={() => Alert.alert("Contract Details", `Address: ${contract.address}\nMethod: ${contract.method}`)}
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
                backgroundColor="rgba(0,121,193,0.2)"
                alignItems="center"
                justifyContent="center"
              >
                <Ionicons name="code-slash" size={20} color="#0079c1" />
              </YStack>
              <YStack flex={1}>
                <Text fontSize={14} fontWeight="600" color="#FFFFFF" fontFamily="SpaceGrotesk_600SemiBold" marginBottom={2}>
                  {contract.name}
                </Text>
                <Text fontSize={12} color="rgba(255,255,255,0.6)" fontFamily="SpaceMono_400Regular" marginBottom={2}>
                  {contract.method}
                </Text>
                <Text fontSize={11} color="rgba(255,255,255,0.4)" fontFamily="SpaceMono_400Regular">
                  &gt; {contract.timestamp}
                </Text>
              </YStack>
            </XStack>
            <YStack backgroundColor="rgba(52,199,89,0.2)" paddingHorizontal={8} paddingVertical={4} borderRadius={12}>
              <Text fontSize={10} fontWeight="600" color="#34C759" fontFamily="SpaceGrotesk_600SemiBold" letterSpacing={0.5}>
                {contract.status.toUpperCase()}
              </Text>
            </YStack>
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
            ACTIVITY
          </Text>
          <TouchableOpacity onPress={() => Alert.alert("Coming Soon", "Export feature coming soon!")}>
            <Ionicons name="download-outline" size={24} color="#0079c1" />
          </TouchableOpacity>
        </XStack>

        {/* Tab Selector */}
        <XStack gap={8} padding={4} backgroundColor="rgba(255,255,255,0.1)" borderRadius={12}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setSelectedTab('transactions')}
          >
            <YStack
              backgroundColor={selectedTab === 'transactions' ? 'rgba(0,121,193,0.3)' : 'transparent'}
              paddingVertical={12}
              borderRadius={8}
              alignItems="center"
              borderWidth={selectedTab === 'transactions' ? 1 : 0}
              borderColor="rgba(0,121,193,0.5)"
            >
              <Text
                fontSize={14}
                fontWeight="600"
                color={selectedTab === 'transactions' ? '#0079c1' : 'rgba(255,255,255,0.6)'}
                fontFamily="SpaceGrotesk_600SemiBold"
                letterSpacing={0.5}
              >
                TRANSACTIONS
              </Text>
            </YStack>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setSelectedTab('contracts')}
          >
            <YStack
              backgroundColor={selectedTab === 'contracts' ? 'rgba(0,121,193,0.3)' : 'transparent'}
              paddingVertical={12}
              borderRadius={8}
              alignItems="center"
              borderWidth={selectedTab === 'contracts' ? 1 : 0}
              borderColor="rgba(0,121,193,0.5)"
            >
              <Text
                fontSize={14}
                fontWeight="600"
                color={selectedTab === 'contracts' ? '#0079c1' : 'rgba(255,255,255,0.6)'}
                fontFamily="SpaceGrotesk_600SemiBold"
                letterSpacing={0.5}
              >
                CONTRACTS
              </Text>
            </YStack>
          </TouchableOpacity>
        </XStack>
      </YStack>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {selectedTab === 'transactions' ? (
          <YStack>
            {mockTransactions.length > 0 ? (
              mockTransactions.map(renderTransaction)
            ) : (
              <YStack alignItems="center" paddingVertical={48}>
                <Ionicons name="receipt-outline" size={48} color="rgba(255,255,255,0.3)" />
                <Text fontSize={16} fontWeight="600" color="rgba(255,255,255,0.6)" fontFamily="SpaceGrotesk_600SemiBold" marginTop={16} marginBottom={8}>
                  No Transactions Yet
                </Text>
                <Text fontSize={13} color="rgba(255,255,255,0.4)" fontFamily="SpaceMono_400Regular" textAlign="center">
                  &gt; Your transaction history will appear here
                </Text>
              </YStack>
            )}
          </YStack>
        ) : (
          <YStack>
            {mockContracts.length > 0 ? (
              mockContracts.map(renderContract)
            ) : (
              <YStack alignItems="center" paddingVertical={48}>
                <Ionicons name="code-slash" size={48} color="rgba(255,255,255,0.3)" />
                <Text fontSize={16} fontWeight="600" color="rgba(255,255,255,0.6)" fontFamily="SpaceGrotesk_600SemiBold" marginTop={16} marginBottom={8}>
                  No Contract Interactions
                </Text>
                <Text fontSize={13} color="rgba(255,255,255,0.4)" fontFamily="SpaceMono_400Regular" textAlign="center">
                  &gt; Your contract interactions will appear here
                </Text>
              </YStack>
            )}
          </YStack>
        )}
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
