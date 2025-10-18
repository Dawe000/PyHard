import React, { useState } from "react";
import { 
  Text, 
  View, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const SubAccountsScreen = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState<'saver' | 'sub_account'>('saver');

  // Mock sub-account data
  const [subAccounts, setSubAccounts] = useState([
    {
      id: '1',
      name: 'Family Saver',
      type: 'saver',
      balance: '150.00',
      spendingLimit: '200.00',
      spentThisPeriod: '50.00',
      periodStart: '2024-01-01',
      periodDuration: '30 days',
      status: 'active',
      childEOA: '0x742d...8a9b'
    },
    {
      id: '2',
      name: 'Kids Sub Account',
      type: 'sub_account',
      balance: '25.00',
      spendingLimit: '50.00',
      spentThisPeriod: '25.00',
      periodStart: '2024-01-15',
      periodDuration: '7 days',
      status: 'active',
      childEOA: '0x8a9b...742d'
    },
    {
      id: '3',
      name: 'Emergency Fund',
      type: 'saver',
      balance: '500.00',
      spendingLimit: '1000.00',
      spentThisPeriod: '0.00',
      periodStart: '2024-01-01',
      periodDuration: '90 days',
      status: 'paused',
      childEOA: '0x9abc...def0'
    }
  ]);

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
        return '#0070BA';
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

  const renderSubAccount = (account: any) => (
    <TouchableOpacity 
      key={account.id} 
      style={styles.accountCard}
      onPress={() => Alert.alert("Account Details", `Name: ${account.name}\nType: ${account.type}\nBalance: $${account.balance}`)}
    >
      <View style={styles.accountHeader}>
        <View style={styles.accountLeft}>
          <View style={[styles.accountIcon, { backgroundColor: getAccountTypeColor(account.type) + '20' }]}>
            <Ionicons 
              name={getAccountTypeIcon(account.type)} 
              size={24} 
              color={getAccountTypeColor(account.type)} 
            />
          </View>
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>{account.name}</Text>
            <Text style={styles.accountType}>
              {account.type === 'saver' ? 'Saver' : 'Sub Account'}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(account.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(account.status) }]}>
            {account.status}
          </Text>
        </View>
      </View>

      <View style={styles.accountBalance}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>${account.balance}</Text>
      </View>

      <View style={styles.accountDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Spending Limit</Text>
          <Text style={styles.detailValue}>${account.spendingLimit}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Spent This Period</Text>
          <Text style={styles.detailValue}>${account.spentThisPeriod}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Period</Text>
          <Text style={styles.detailValue}>{account.periodDuration}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Child Wallet</Text>
          <Text style={styles.detailValue}>{account.childEOA}</Text>
        </View>
      </View>

      <View style={styles.accountActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => Alert.alert("Coming Soon", "Manage feature coming soon!")}
        >
          <Ionicons name="settings-outline" size={16} color="#0070BA" />
          <Text style={styles.actionButtonText}>Manage</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => Alert.alert("Coming Soon", "Fund feature coming soon!")}
        >
          <Ionicons name="add-outline" size={16} color="#34C759" />
          <Text style={styles.actionButtonText}>Fund</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => Alert.alert("Coming Soon", "View transactions coming soon!")}
        >
          <Ionicons name="list-outline" size={16} color="#8E8E93" />
          <Text style={styles.actionButtonText}>History</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sub-Accounts</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {subAccounts.length > 0 ? (
          subAccounts.map(renderSubAccount)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#C7C7CC" />
            <Text style={styles.emptyTitle}>No sub-accounts yet</Text>
            <Text style={styles.emptySubtitle}>Create sub-accounts to manage family finances</Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.emptyButtonText}>Create First Sub-Account</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Create Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Sub-Account</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Account Name</Text>
              <TextInput
                style={styles.textInput}
                value={newAccountName}
                onChangeText={setNewAccountName}
                placeholder="Enter account name"
                placeholderTextColor="#C7C7CC"
              />

              <Text style={styles.inputLabel}>Account Type</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    newAccountType === 'saver' && styles.selectedTypeOption
                  ]}
                  onPress={() => setNewAccountType('saver')}
                >
                  <Ionicons 
                    name="card" 
                    size={20} 
                    color={newAccountType === 'saver' ? '#0070BA' : '#8E8E93'} 
                  />
                  <Text style={[
                    styles.typeOptionText,
                    newAccountType === 'saver' && styles.selectedTypeOptionText
                  ]}>
                    Saver
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    newAccountType === 'sub_account' && styles.selectedTypeOption
                  ]}
                  onPress={() => setNewAccountType('sub_account')}
                >
                  <Ionicons 
                    name="wallet" 
                    size={20} 
                    color={newAccountType === 'sub_account' ? '#0070BA' : '#8E8E93'} 
                  />
                  <Text style={[
                    styles.typeOptionText,
                    newAccountType === 'sub_account' && styles.selectedTypeOptionText
                  ]}>
                    Sub Account
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.createAccountButton}
                onPress={handleCreateAccount}
              >
                <Text style={styles.createAccountButtonText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  createButton: {
    backgroundColor: '#0070BA',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  accountType: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  accountBalance: {
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  accountDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  accountActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0070BA',
    marginLeft: 4,
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
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#0070BA',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  modalBody: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  selectedTypeOption: {
    borderColor: '#0070BA',
    backgroundColor: '#0070BA' + '10',
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginLeft: 8,
  },
  selectedTypeOptionText: {
    color: '#0070BA',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  createAccountButton: {
    flex: 1,
    backgroundColor: '#0070BA',
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    marginLeft: 8,
  },
  createAccountButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
