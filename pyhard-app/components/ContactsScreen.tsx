import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { searchUsers, UserProfile } from '../services/profileService';

interface ContactsScreenProps {
  onNavigateToSend?: (walletAddress: string, username?: string) => void;
}

export const ContactsScreen = ({ onNavigateToSend }: ContactsScreenProps = {}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendToUser = (user: UserProfile) => {
    if (onNavigateToSend) {
      onNavigateToSend(user.wallet_address, user.username);
    } else {
      Alert.alert(
        'Send PYUSD',
        `Recipient: ${user.display_name || user.username}\n\nWallet: ${user.wallet_address.slice(0, 10)}...${user.wallet_address.slice(-8)}\n\nSwitch to the Send tab to complete the transaction.`,
        [{ text: 'OK' }]
      );
    }
  };

  const renderUser = ({ item }: { item: UserProfile }) => (
    <View style={styles.userCard}>
      <LinearGradient
        colors={['rgba(0,121,193,0.15)', 'rgba(0,48,135,0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.userGradient}
      >
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {item.display_name?.charAt(0).toUpperCase() || item.username?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.display_name || item.username || 'Unknown'}</Text>
            {item.username && (
              <Text style={styles.username}>@{item.username}</Text>
            )}
            <Text style={styles.walletAddress}>
              {item.wallet_address.slice(0, 10)}...{item.wallet_address.slice(-8)}
            </Text>
            {item.bio && (
              <Text style={styles.bio} numberOfLines={2}>{item.bio}</Text>
            )}
          </View>
        </View>

        {/* Send Button */}
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => handleSendToUser(item)}
        >
          <LinearGradient
            colors={['#0079c1', '#005a8f']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sendButtonGradient}
          >
            <Ionicons name="send" size={18} color="#fff" />
            <Text style={styles.sendButtonText}>SEND</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0e27', '#001133', '#0a0e27']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>User Directory</Text>
          <Ionicons name="people" size={28} color="#0079c1" />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by username or name..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Info */}
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle" size={18} color="#0079c1" />
          <Text style={styles.infoText}>
            Search for users by their username or display name
          </Text>
        </View>

        {/* Results */}
        {isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0079c1" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : searchQuery.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyText}>Start typing to search</Text>
            <Text style={styles.emptySubtext}>
              Search for any user by their username or name
            </Text>
          </View>
        ) : searchQuery.length < 2 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="create-outline" size={64} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyText}>Type at least 2 characters</Text>
          </View>
        ) : searchResults.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyText}>No users found</Text>
            <Text style={styles.emptySubtext}>
              Try searching for a different username
            </Text>
          </View>
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.wallet_address}
            renderItem={renderUser}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,121,193,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,121,193,0.2)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#fff',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,121,193,0.1)',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,121,193,0.2)',
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  userGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,121,193,0.2)',
    borderRadius: 12,
    flexDirection: 'column',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sendButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,121,193,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,121,193,0.5)',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0079c1',
  },
  userDetails: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: 'rgba(0,121,193,0.9)',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  walletAddress: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  bio: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
    lineHeight: 18,
  },
});
