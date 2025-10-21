import React, { useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { YStack, XStack, Text } from "tamagui";
import { LinearGradient } from "expo-linear-gradient";

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

  const renderSubAccount = (account: any) => (
    <TouchableOpacity
      key={account.id}
      onPress={() => Alert.alert("Account Details", `Name: ${account.name}\nType: ${account.type}\nBalance: $${account.balance}`)}
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
                  {account.name.toUpperCase()}
                </Text>
                <Text fontSize={12} color="rgba(255,255,255,0.5)" fontFamily="SpaceMono_400Regular">
                  &gt; {account.type === 'saver' ? 'Saver' : 'Sub Account'}
                </Text>
              </YStack>
            </XStack>
            <YStack backgroundColor={getStatusColor(account.status) + '20'} paddingHorizontal={12} paddingVertical={6} borderRadius={16}>
              <Text fontSize={10} fontWeight="600" color={getStatusColor(account.status)} fontFamily="SpaceGrotesk_600SemiBold" letterSpacing={0.5}>
                {account.status.toUpperCase()}
              </Text>
            </YStack>
          </XStack>

          {/* Balance */}
          <YStack marginBottom={16} backgroundColor="rgba(0,121,193,0.1)" padding={12} borderRadius={12}>
            <Text fontSize={11} color="rgba(255,255,255,0.5)" fontFamily="SpaceGrotesk_700Bold" letterSpacing={1} marginBottom={4}>
              AVAILABLE BALANCE
            </Text>
            <Text fontSize={28} fontWeight="700" color="#FFFFFF" fontFamily="SpaceGrotesk_700Bold">
              ${account.balance}
            </Text>
          </YStack>

          {/* Details */}
          <YStack gap={8} marginBottom={16}>
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={12} color="rgba(255,255,255,0.5)" fontFamily="SpaceMono_400Regular">
                &gt; Spending Limit
              </Text>
              <Text fontSize={12} fontWeight="600" color="#FFFFFF" fontFamily="SpaceGrotesk_600SemiBold">
                ${account.spendingLimit}
              </Text>
            </XStack>
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={12} color="rgba(255,255,255,0.5)" fontFamily="SpaceMono_400Regular">
                &gt; Spent This Period
              </Text>
              <Text fontSize={12} fontWeight="600" color="#FFFFFF" fontFamily="SpaceGrotesk_600SemiBold">
                ${account.spentThisPeriod}
              </Text>
            </XStack>
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={12} color="rgba(255,255,255,0.5)" fontFamily="SpaceMono_400Regular">
                &gt; Period
              </Text>
              <Text fontSize={12} fontWeight="600" color="#FFFFFF" fontFamily="SpaceGrotesk_600SemiBold">
                {account.periodDuration}
              </Text>
            </XStack>
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={12} color="rgba(255,255,255,0.5)" fontFamily="SpaceMono_400Regular">
                &gt; Child Wallet
              </Text>
              <Text fontSize={12} fontWeight="600" color="#0079c1" fontFamily="SpaceMono_400Regular">
                {account.childEOA}
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
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {subAccounts.length > 0 ? (
          subAccounts.map(renderSubAccount)
        ) : (
          <YStack alignItems="center" paddingVertical={48}>
            <Ionicons name="people-outline" size={48} color="rgba(255,255,255,0.3)" />
            <Text fontSize={16} fontWeight="600" color="rgba(255,255,255,0.6)" fontFamily="SpaceGrotesk_600SemiBold" marginTop={16} marginBottom={8}>
              No Sub-Accounts Yet
            </Text>
            <Text fontSize={13} color="rgba(255,255,255,0.4)" fontFamily="SpaceMono_400Regular" textAlign="center" marginBottom={24}>
              &gt; Create sub-accounts to manage family finances
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
