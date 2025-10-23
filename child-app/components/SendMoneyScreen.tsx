import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ParentWalletInfo } from '../services/subWalletDetection';
import { sendTransaction, validateTransaction } from '../services/transactionService';
import { trackTransaction } from '../services/contactsService';
import { UserSearchModal } from './UserSearchModal';
import { UserProfile, searchUsers } from '../services/userSearchService';

interface SendMoneyScreenProps {
  onBack: () => void;
  walletInfo: ParentWalletInfo | null;
  onOpenContacts?: () => void;
  selectedContact?: { name: string; address: string } | null;
}

export const SendMoneyScreen: React.FC<SendMoneyScreenProps> = ({ 
  onBack, 
  walletInfo, 
  onOpenContacts, 
  selectedContact 
}) => {
  const [recipientAddress, setRecipientAddress] = useState(selectedContact?.address || '');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Update recipient address when selectedContact changes
  React.useEffect(() => {
    if (selectedContact) {
      setRecipientAddress(selectedContact.address);
      setSelectedUser(null); // Clear user selection when contact is selected
    }
  }, [selectedContact]);

  // Update recipient address when selectedUser changes
  React.useEffect(() => {
    if (selectedUser) {
      setRecipientAddress(selectedUser.wallet_address);
    }
  }, [selectedUser]);

  // Search users when typing in recipient address field
  React.useEffect(() => {
    const searchUsersDebounced = async () => {
      if (recipientAddress.length < 2) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      // Don't search if it looks like a wallet address
      if (recipientAddress.startsWith('0x') && recipientAddress.length > 10) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      setIsSearching(true);
      setShowSearchResults(true);
      
      try {
        const results = await searchUsers(recipientAddress);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchUsersDebounced, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [recipientAddress]);

  const handleSelectUser = (user: UserProfile) => {
    setSelectedUser(user);
    setRecipientAddress(user.wallet_address);
    setShowSearchResults(false);
  };

  const handleAddressChange = (text: string) => {
    setRecipientAddress(text);
    // Clear selections when manually typing
    if (text !== selectedUser?.wallet_address) {
      setSelectedUser(null);
    }
  };

  const handleCloseSearchResults = () => {
    setShowSearchResults(false);
  };

  const getRemainingBalance = () => {
    if (!walletInfo) return 0;
    const remaining = walletInfo.subWalletInfo.spendingLimit - walletInfo.subWalletInfo.spentThisPeriod;
    return Number(remaining) / 1e6; // Convert from wei to PYUSD (6 decimals)
  };

  const handleSend = async () => {
    if (!walletInfo) {
      Alert.alert('Error', 'Wallet information not available');
      return;
    }

    // Validate the transaction
    const validation = validateTransaction(walletInfo, recipientAddress, amount);
    if (!validation.valid) {
      Alert.alert('Error', validation.error);
      return;
    }

    setLoading(true);

    try {
      console.log('🚀 Sending transaction:', {
        recipient: recipientAddress,
        amount: amount,
        walletInfo
      });

      const result = await sendTransaction({
        recipientAddress,
        amount,
        childEOA: walletInfo.subWalletInfo.childEOA,
        smartWalletAddress: walletInfo.smartWalletAddress,
        subWalletId: walletInfo.subWalletId,
      });

      if (result.success) {
        // Track the transaction for contacts
        await trackTransaction(recipientAddress);
        
        const recipientName = selectedContact?.name || 
                             selectedUser?.display_name || 
                             selectedUser?.username || 
                             'Unknown';
        
        Alert.alert(
          'Transaction Sent!',
          `Successfully sent ${amount} PYUSD to ${recipientName}\n\nAddress: ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}\nTransaction Hash: ${result.transactionHash}`,
          [
            {
              text: 'OK',
              onPress: () => {
                setRecipientAddress('');
                setAmount('');
                setSelectedUser(null);
                onBack();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to send transaction');
      }

    } catch (error) {
      console.error('❌ Error sending transaction:', error);
      Alert.alert('Error', 'Failed to send transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: bigint, decimals: number = 6) => {
    return (Number(amount) / Math.pow(10, decimals)).toFixed(2);
  };

  const getRemainingBalanceDisplay = () => {
    if (!walletInfo) return '0.00';
    const remaining = walletInfo.subWalletInfo.spendingLimit - walletInfo.subWalletInfo.spentThisPeriod;
    return formatAmount(remaining);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Send Money</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>
              {getRemainingBalanceDisplay()} PYUSD
            </Text>
            <Text style={styles.balanceSubtext}>
              Monthly Limit: {formatAmount(walletInfo?.subWalletInfo.spendingLimit || 0n)} PYUSD
            </Text>
          </View>

          {/* Send Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Send PYUSD</Text>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Text style={styles.inputLabel}>Recipient Address</Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.searchButton}
                    onPress={() => setShowUserSearch(true)}
                  >
                    <Ionicons name="search-outline" size={16} color="#007bff" />
                    <Text style={styles.searchButtonText}>Search</Text>
                  </TouchableOpacity>
                  {onOpenContacts && (
                    <TouchableOpacity
                      style={styles.contactsButton}
                      onPress={onOpenContacts}
                    >
                      <Ionicons name="people-outline" size={16} color="#007bff" />
                      <Text style={styles.contactsButtonText}>Contacts</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Type username or 0x..."
                value={recipientAddress}
                onChangeText={handleAddressChange}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
              />
              {(selectedContact || selectedUser) && (
                <Text style={styles.selectedContactText}>
                  Selected: {selectedContact?.name || selectedUser?.display_name || selectedUser?.username || 'Unknown'}
                </Text>
              )}

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <View style={styles.searchResultsContainer}>
                  {isSearching ? (
                    <View style={styles.searchResultItem}>
                      <ActivityIndicator size="small" color="#007bff" />
                      <Text style={styles.searchResultText}>Searching...</Text>
                    </View>
                  ) : searchResults.length > 0 ? (
                    searchResults.slice(0, 3).map((user) => (
                      <TouchableOpacity
                        key={user.wallet_address}
                        style={styles.searchResultItem}
                        onPress={() => handleSelectUser(user)}
                      >
                        <View style={styles.searchResultAvatar}>
                          <Text style={styles.searchResultAvatarText}>
                            {user.display_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
                          </Text>
                        </View>
                        <View style={styles.searchResultInfo}>
                          <Text style={styles.searchResultName}>
                            {user.display_name || user.username || 'Unknown'}
                          </Text>
                          <Text style={styles.searchResultAddress}>
                            {user.wallet_address.slice(0, 10)}...{user.wallet_address.slice(-8)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : recipientAddress.length >= 2 && !recipientAddress.startsWith('0x') ? (
                    <View style={styles.searchResultItem}>
                      <Text style={styles.searchResultText}>No users found</Text>
                    </View>
                  ) : null}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount (PYUSD)</Text>
              <View style={styles.amountInputContainer}>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.currencyLabel}>PYUSD</Text>
              </View>
            </View>

            {/* Transaction Summary */}
            {amount && recipientAddress && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Transaction Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>To:</Text>
                  <Text style={styles.summaryValue}>
                    {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Amount:</Text>
                  <Text style={styles.summaryValue}>{amount} PYUSD</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Remaining:</Text>
                  <Text style={styles.summaryValue}>
                    {(getRemainingBalance() - parseFloat(amount || '0')).toFixed(2)} PYUSD
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.sendButton,
                (!recipientAddress.trim() || !amount.trim() || loading) && styles.sendButtonDisabled
              ]}
              onPress={handleSend}
              disabled={!recipientAddress.trim() || !amount.trim() || loading}
            >
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.sendButtonText}>
                {loading ? 'Sending...' : 'Send Transaction'}
              </Text>
            </TouchableOpacity>
          </View>
            </ScrollView>
          </KeyboardAvoidingView>
          
          {/* User Search Modal */}
          <UserSearchModal
            visible={showUserSearch}
            onClose={() => setShowUserSearch(false)}
            onSelectUser={(user) => {
              setSelectedUser(user);
            }}
          />
        </SafeAreaView>
      );
    };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  keyboardView: {
    flex: 1,
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
  },
  balanceCard: {
    backgroundColor: '#007bff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f0f8ff',
    borderRadius: 6,
  },
  searchButtonText: {
    fontSize: 12,
    color: '#007bff',
    marginLeft: 4,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  contactsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f0f8ff',
    borderRadius: 6,
  },
  contactsButtonText: {
    fontSize: 12,
    color: '#007bff',
    marginLeft: 4,
    fontWeight: '600',
  },
  selectedContactText: {
    fontSize: 12,
    color: '#007bff',
    marginTop: 4,
    fontStyle: 'italic',
  },
  searchResultsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  searchResultAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  searchResultAddress: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  searchResultText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    padding: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  amountInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  currencyLabel: {
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#007bff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
