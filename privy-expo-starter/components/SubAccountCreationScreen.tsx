import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QRCodeData, SubAccountRequestData } from '@/utils/qrCodeUtils';
import { createSubAccountGasless } from '@/services/subAccountService';
import { usePrivy, getUserEmbeddedEthereumWallet, useAuthorizationSignature } from '@privy-io/expo';
import { getOrCreateSmartWallet } from '@/services/smartWallet';

interface SubAccountCreationScreenProps {
  qrData: QRCodeData;
  onClose: () => void;
  onSuccess: (subWalletId: number) => void;
}

export const SubAccountCreationScreen: React.FC<SubAccountCreationScreenProps> = ({ 
  qrData, 
  onClose, 
  onSuccess 
}) => {
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { user } = usePrivy();
  const { generateAuthorizationSignature } = useAuthorizationSignature();
  const account = getUserEmbeddedEthereumWallet(user);

  const subAccountData = qrData.data as SubAccountRequestData;

  const handleCreateSubAccount = async () => {
    if (!monthlyLimit || parseFloat(monthlyLimit) <= 0) {
      Alert.alert('Error', 'Please enter a valid monthly limit greater than 0.');
      return;
    }

    if (!account?.address) {
      Alert.alert('Error', 'Wallet not connected.');
      return;
    }

    setIsCreating(true);

    try {
      // Get SmartWallet address
      const smartWalletInfo = await getOrCreateSmartWallet(account.address, "placeholder-token");
      const smartWalletAddress = smartWalletInfo.address;

      if (!smartWalletAddress) {
        throw new Error("Failed to get SmartWallet address.");
      }

      // Create sub-account gaslessly
      const result = await createSubAccountGasless(
        account.address,
        smartWalletAddress,
        subAccountData.childEOA,
        monthlyLimit,
        generateAuthorizationSignature,
        account.id // Pass the wallet ID for Privy API calls
      );

      if (result.success) {
        // Store child account in database
        try {
          await fetch('https://profile-service.dawid-pisarczyk.workers.dev/child-account', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              parent_wallet: smartWalletAddress,
              child_eoa: subAccountData.childEOA,
              child_name: subAccountData.childName,
              sub_wallet_id: result.subWalletId || 0,
            }),
          });
          console.log('✅ Child account stored in database');
        } catch (dbError) {
          console.error('❌ Failed to store child account:', dbError);
          // Don't fail the whole operation if database storage fails
        }

        Alert.alert(
          'Success!',
          `Sub-account created for ${subAccountData.childName} with ${monthlyLimit} PYUSD monthly limit.`,
          [
            { 
              text: 'OK', 
              onPress: () => {
                onSuccess(result.subWalletId || 0);
                onClose();
              }
            }
          ]
        );
      } else {
        throw new Error(result.error || 'Failed to create sub-account');
      }
    } catch (error: any) {
      console.error('Error creating sub-account:', error);
      Alert.alert('Error', `Failed to create sub-account: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Sub-Account</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.childInfo}>
          <Text style={styles.childName}>{subAccountData.childName}</Text>
          <Text style={styles.childAddress}>
            {subAccountData.childEOA.slice(0, 6)}...{subAccountData.childEOA.slice(-4)}
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Monthly Limit (PYUSD)</Text>
          <TextInput
            style={styles.input}
            value={monthlyLimit}
            onChangeText={setMonthlyLimit}
            placeholder="Enter monthly limit"
            keyboardType="numeric"
            autoFocus
          />

          <View style={styles.periodInfo}>
            <Text style={styles.periodLabel}>Period: 30 days</Text>
            <Text style={styles.periodDescription}>
              Allowance resets every 30 days
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.createButton, isCreating && styles.createButtonDisabled]}
          onPress={handleCreateSubAccount}
          disabled={isCreating}
        >
          <Text style={styles.createButtonText}>
            {isCreating ? 'Creating...' : 'Create Sub-Account'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  childInfo: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  childName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  childAddress: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  form: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  periodInfo: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
  },
  periodLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1976d2',
    marginBottom: 4,
  },
  periodDescription: {
    fontSize: 12,
    color: '#666',
  },
  createButton: {
    backgroundColor: '#1976d2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
