import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ParentWalletInfo } from '../services/subWalletDetection';
import { sendTransaction, validateTransaction } from '../services/transactionService';
import { trackTransaction } from '../services/contactsService';
import { saveChildTransaction } from '../services/transactionHistoryService';
import { UserSearchModal } from './UserSearchModal';
import { UserProfile, searchUsers } from '../services/userSearchService';
import { QRScannerScreen } from './QRScannerScreen';
import { QRCodeData, isPaymentRequest, PaymentRequestData } from '../utils/qrCodeUtils';

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
  const [showQRScanner, setShowQRScanner] = useState(false);

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

  const handleQRScanned = (qrData: QRCodeData) => {
    setShowQRScanner(false);
    
    if (isPaymentRequest(qrData)) {
      const paymentData = qrData.data as PaymentRequestData;
      setRecipientAddress(paymentData.smartWalletAddress);
      setAmount(paymentData.amount);
      setSelectedUser(null);
    }
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
        
        // Save transaction to local history using the new service
        const newTransaction = {
          hash: result.transactionHash || '0x' + Date.now().toString(16),
          from: walletInfo.smartWalletAddress,
          to: recipientAddress,
          value: String(parseFloat(amount) * 1e6),
          timeStamp: String(Math.floor(Date.now() / 1000)),
          type: 'sent' as const,
          amount: amount,
        };
        
        try {
          await saveChildTransaction(
            newTransaction,
            walletInfo.subWalletInfo.childEOA,
            walletInfo.smartWalletAddress
          );
          console.log('✅ Transaction saved to history');
        } catch (err) {
          console.error('❌ Failed to save transaction to history:', err);
        }
        
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
    <LinearGradient
      colors={['#0a0e27', '#001133', '#0a0e27']}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>SEND PYUSD</Text>
            <Text style={styles.headerSubtitle}>Transfer funds to any wallet</Text>
          </View>

          {/* Balance Card */}
          <View style={styles.balanceSection}>
            <LinearGradient
              colors={['rgba(0,121,193,0.15)', 'rgba(0,48,135,0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.balanceGradient}
            >
              <View style={styles.balanceContent}>
                <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
                <Text style={styles.balanceAmount}>${getRemainingBalanceDisplay()}</Text>
                <Text style={styles.balanceSubtext}>
                  LIMIT: ${formatAmount(walletInfo?.subWalletInfo.spendingLimit || 0n)} PYUSD
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Recipient Input */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>RECIPIENT</Text>
            <LinearGradient
              colors={['rgba(0,121,193,0.15)', 'rgba(0,121,193,0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.inputGradient}
            >
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.5)" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Username or 0x..."
                  value={recipientAddress}
                  onChangeText={handleAddressChange}
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowQRScanner(true)} style={{ marginRight: 12 }}>
                  <Ionicons name="qr-code-outline" size={22} color="#0079c1" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowUserSearch(true)}>
                  <Ionicons name="search" size={20} color="#0079c1" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Selected User */}
            {(selectedContact || selectedUser) && (
              <View style={styles.selectedUserContainer}>
                <View style={styles.selectedUserAvatar}>
                  <Text style={styles.selectedUserAvatarText}>
                    {(selectedContact?.name || selectedUser?.display_name)?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
                <View style={styles.selectedUserInfo}>
                  <Text style={styles.selectedUserName}>
                    {selectedContact?.name || selectedUser?.display_name || selectedUser?.username}
                  </Text>
                  <Text style={styles.selectedUserAddress}>
                    {recipientAddress.slice(0, 10)}...{recipientAddress.slice(-8)}
                  </Text>
                </View>
              </View>
            )}

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <View style={styles.searchResultsContainer}>
                {isSearching ? (
                  <View style={styles.searchLoadingContainer}>
                    <ActivityIndicator size="small" color="#0079c1" />
                    <Text style={styles.searchLoadingText}>Searching...</Text>
                  </View>
                ) : (
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
                          {user.display_name || user.username}
                        </Text>
                        <Text style={styles.searchResultAddress}>
                          {user.wallet_address.slice(0, 10)}...{user.wallet_address.slice(-8)}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </View>

          {/* Amount Input */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>AMOUNT (PYUSD)</Text>
            <LinearGradient
              colors={['rgba(0,121,193,0.15)', 'rgba(0,121,193,0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.inputGradient}
            >
              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={[styles.textInput, styles.amountInput]}
                  placeholder="0.00"
                  value={amount}
                  onChangeText={setAmount}
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="decimal-pad"
                />
                <Text style={styles.currencyLabel}>PYUSD</Text>
              </View>
            </LinearGradient>

            {/* Quick Amount Buttons */}
            <View style={styles.quickAmountsGrid}>
              {[5, 10, 25, 50].map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  style={styles.quickAmountButton}
                  onPress={() => setAmount(quickAmount.toString())}
                >
                  <LinearGradient
                    colors={['rgba(0,121,193,0.2)', 'rgba(0,121,193,0.1)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.quickAmountGradient}
                  >
                    <Text style={styles.quickAmountText}>${quickAmount}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Transaction Summary */}
          {amount && recipientAddress && (
            <View style={styles.summarySection}>
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.summaryGradient}
              >
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryTitle}>TRANSACTION SUMMARY</Text>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Recipient</Text>
                    <Text style={styles.summaryValue}>
                      {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
                    </Text>
                  </View>
                  
                  <View style={styles.divider} />
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Amount</Text>
                    <Text style={styles.summaryValue}>${amount}</Text>
                  </View>
                  
                  <View style={styles.divider} />
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Remaining</Text>
                    <Text style={[styles.summaryValue, styles.remainingValue]}>
                      ${(getRemainingBalance() - parseFloat(amount || '0')).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Send Button */}
          <TouchableOpacity
            style={styles.sendButtonContainer}
            onPress={handleSend}
            disabled={!recipientAddress.trim() || !amount.trim() || loading}
          >
            <LinearGradient
              colors={(!recipientAddress.trim() || !amount.trim() || loading) 
                ? ['rgba(0,121,193,0.3)', 'rgba(0,121,193,0.2)']
                : ['#0079c1', '#00a8e8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sendButtonGradient}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="send" size={20} color="#fff" />
                  <Text style={styles.sendButtonText}>SEND TRANSACTION</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
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

      {/* QR Scanner Modal */}
      <Modal
        visible={showQRScanner}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowQRScanner(false)}
      >
        <QRScannerScreen
          onQRScanned={handleQRScanned}
          onClose={() => setShowQRScanner(false)}
        />
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  balanceSection: {
    marginBottom: 24,
  },
  balanceGradient: {
    borderRadius: 16,
    padding: 1,
  },
  balanceContent: {
    backgroundColor: 'rgba(10,14,39,0.6)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,121,193,0.2)',
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'monospace',
  },
  inputSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputGradient: {
    borderRadius: 12,
    padding: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10,14,39,0.8)',
    borderRadius: 11,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,121,193,0.2)',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  currencySymbol: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  amountInput: {
    fontSize: 20,
    fontWeight: '600',
  },
  currencyLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  quickAmountsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  quickAmountButton: {
    flex: 1,
  },
  quickAmountGradient: {
    borderRadius: 8,
    padding: 1,
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0079c1',
    textAlign: 'center',
    paddingVertical: 10,
    backgroundColor: 'rgba(10,14,39,0.6)',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(0,121,193,0.3)',
  },
  selectedUserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(0,121,193,0.1)',
    borderRadius: 8,
    gap: 12,
  },
  selectedUserAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,121,193,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedUserAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0079c1',
  },
  selectedUserInfo: {
    flex: 1,
  },
  selectedUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  selectedUserAddress: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'monospace',
  },
  searchResultsContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(10,14,39,0.9)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,121,193,0.3)',
    overflow: 'hidden',
  },
  searchLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  searchLoadingText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  searchResultAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,121,193,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResultAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0079c1',
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  searchResultAddress: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'monospace',
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryGradient: {
    borderRadius: 16,
    padding: 1,
  },
  summaryContent: {
    backgroundColor: 'rgba(10,14,39,0.6)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  remainingValue: {
    color: '#0079c1',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 12,
  },
  sendButtonContainer: {
    marginTop: 8,
  },
  sendButtonGradient: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
