import React, { useState } from "react";
import { 
  Text, 
  View, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  ScrollView,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
        return '#0070BA';
      default:
        return '#8E8E93';
    }
  };

  const renderTransaction = (transaction: any) => (
    <TouchableOpacity 
      key={transaction.id} 
      style={styles.transactionItem}
      onPress={() => Alert.alert("Transaction Details", `Hash: ${transaction.hash}\nStatus: ${transaction.status}`)}
    >
      <View style={styles.transactionLeft}>
        <View style={[styles.transactionIcon, { backgroundColor: getTransactionColor(transaction.type) + '20' }]}>
          <Ionicons 
            name={getTransactionIcon(transaction.type)} 
            size={20} 
            color={getTransactionColor(transaction.type)} 
          />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionType}>
            {transaction.type === 'send' ? 'Sent to' : 
             transaction.type === 'receive' ? 'Received from' : 
             'Swapped to'} {transaction.to || transaction.from}
          </Text>
          <Text style={styles.transactionTime}>{transaction.timestamp}</Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[
          styles.transactionAmount,
          { color: transaction.type === 'receive' ? '#34C759' : '#FF3B30' }
        ]}>
          {transaction.type === 'receive' ? '+' : '-'}${transaction.amount}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: '#34C759' + '20' }]}>
          <Text style={[styles.statusText, { color: '#34C759' }]}>
            {transaction.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderContract = (contract: any) => (
    <TouchableOpacity 
      key={contract.id} 
      style={styles.contractItem}
      onPress={() => Alert.alert("Contract Details", `Address: ${contract.address}\nMethod: ${contract.method}`)}
    >
      <View style={styles.contractLeft}>
        <View style={[styles.contractIcon, { backgroundColor: '#0070BA' + '20' }]}>
          <Ionicons name="code-slash" size={20} color="#0070BA" />
        </View>
        <View style={styles.contractDetails}>
          <Text style={styles.contractName}>{contract.name}</Text>
          <Text style={styles.contractMethod}>{contract.method}</Text>
          <Text style={styles.contractTime}>{contract.timestamp}</Text>
        </View>
      </View>
      <View style={styles.contractRight}>
        <View style={[styles.statusBadge, { backgroundColor: '#34C759' + '20' }]}>
          <Text style={[styles.statusText, { color: '#34C759' }]}>
            {contract.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
        <TouchableOpacity onPress={() => Alert.alert("Coming Soon", "Export feature coming soon!")}>
          <Ionicons name="download-outline" size={24} color="#0070BA" />
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'transactions' && styles.activeTab]}
          onPress={() => setSelectedTab('transactions')}
        >
          <Text style={[styles.tabText, selectedTab === 'transactions' && styles.activeTabText]}>
            Transactions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'contracts' && styles.activeTab]}
          onPress={() => setSelectedTab('contracts')}
        >
          <Text style={[styles.tabText, selectedTab === 'contracts' && styles.activeTabText]}>
            Contracts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {selectedTab === 'transactions' ? (
          <View>
            {mockTransactions.length > 0 ? (
              mockTransactions.map(renderTransaction)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color="#C7C7CC" />
                <Text style={styles.emptyTitle}>No transactions yet</Text>
                <Text style={styles.emptySubtitle}>Your transaction history will appear here</Text>
              </View>
            )}
          </View>
        ) : (
          <View>
            {mockContracts.length > 0 ? (
              mockContracts.map(renderContract)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="code-slash" size={48} color="#C7C7CC" />
                <Text style={styles.emptyTitle}>No contract interactions</Text>
                <Text style={styles.emptySubtitle}>Your contract interactions will appear here</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#E5E5EA',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#0070BA',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  transactionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: 14,
    color: '#8E8E93',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  contractItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  contractLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contractIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contractDetails: {
    flex: 1,
  },
  contractName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  contractMethod: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  contractTime: {
    fontSize: 12,
    color: '#C7C7CC',
  },
  contractRight: {
    alignItems: 'flex-end',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
  },
});
