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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { searchUsers, UserProfile } from '../services/userSearchService';

interface ContactsScreenProps {
  onBack: () => void;
  onSelectContact: (user: UserProfile) => void;
}

export const ContactsScreen: React.FC<ContactsScreenProps> = ({ onBack, onSelectContact }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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

  const handleSelectUser = (user: UserProfile) => {
    onSelectContact(user);
  };

  const renderUser = ({ item }: { item: UserProfile }) => (
    <View style={styles.userCard}>
      <LinearGradient
        colors={['rgba(0,121,193,0.15)', 'rgba(0,48,135,0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.userGradient}
      >
        <TouchableOpacity
          style={styles.userContent}
          onPress={() => handleSelectUser(item)}
        >
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
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  return (
    <LinearGradient
      colors={['#0a0e27', '#001133', '#0a0e27']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>USER DIRECTORY</Text>
        <Ionicons name="people" size={28} color="#0079c1" />
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <LinearGradient
          colors={['rgba(0,121,193,0.15)', 'rgba(0,121,193,0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.searchGradient}
        >
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by username or name..."
              placeholderTextColor="rgba(255,255,255,0.3)"
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
        </LinearGradient>

        {/* Search Info */}
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle" size={16} color="#0079c1" />
          <Text style={styles.infoText}>
            Search for users by their username or display name
          </Text>
        </View>
      </View>

      {/* Results */}
      <View style={styles.content}>
        {isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Searching users...</Text>
          </View>
        ) : searchQuery.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Start typing to search</Text>
            <Text style={styles.emptySubtext}>
              Search for any user by their username or name
            </Text>
          </View>
        ) : searchQuery.length < 2 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="create-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Type at least 2 characters</Text>
          </View>
        ) : searchResults.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
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
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
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
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchGradient: {
    borderRadius: 12,
    padding: 1,
    marginBottom: 12,
  },
  searchContainer: {
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
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  infoText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  userCard: {
    marginBottom: 12,
  },
  userGradient: {
    borderRadius: 12,
    padding: 1,
  },
  userContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10,14,39,0.6)',
    borderRadius: 11,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,121,193,0.2)',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,121,193,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0079c1',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  username: {
    fontSize: 13,
    color: '#0079c1',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  walletAddress: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  bio: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 16,
  },
});
