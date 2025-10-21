import React, { useState, useCallback, useEffect } from "react";
import {
  Text,
  TextInput,
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { usePrivy } from "@privy-io/expo";
import { getOrCreateSmartWallet } from "@/services/smartWallet";
import { checkENSAvailability, registerENS, loadProfile as loadProfileData, saveProfile } from "@/services/profileService";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ProfileScreen = () => {
  const { user, logout, getAccessToken } = usePrivy();

  // Profile state
  const [displayName, setDisplayName] = useState("");
  const [ensName, setENSName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isCheckingENS, setIsCheckingENS] = useState(false);
  const [isRegisteringENS, setIsRegisteringENS] = useState(false);
  const [ensAvailable, setENSAvailable] = useState<boolean | null>(null);
  const [smartWalletAddress, setSmartWalletAddress] = useState("");

  // User info - extract from linked_accounts
  const emailAccount = user?.linked_accounts?.find((account: any) => account.type === 'email') as { address?: string } | undefined;
  const walletAccount = user?.linked_accounts?.find((account: any) => account.type === 'wallet') as { address?: string } | undefined;

  const userEmail: string | undefined = emailAccount?.address;
  const userWallet: string | undefined = walletAccount?.address;
  const userId: string | undefined = user?.id;

  // Load profile data on mount
  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = useCallback(async () => {
    if (!user) return;

    try {
      // Load profile from AsyncStorage
      const profileData = await loadProfileData(userWallet || '');

      if (profileData?.displayName) {
        setDisplayName(profileData.displayName);
      } else if (userEmail) {
        // Fallback to email prefix if no saved name
        const emailPrefix = userEmail.split('@')[0];
        setDisplayName(emailPrefix);
      }

      // Get smart wallet address
      const token = await getAccessToken();
      if (token && userWallet) {
        const walletData = await getOrCreateSmartWallet(userWallet, token);
        if (walletData.address) {
          setSmartWalletAddress(walletData.address);
        }
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  }, [user, userWallet, getAccessToken]);

  const handleSaveName = useCallback(async () => {
    if (!displayName.trim()) {
      Alert.alert("Error", "Please enter a display name");
      return;
    }

    setIsSavingProfile(true);
    try {
      // Save to AsyncStorage
      const token = await getAccessToken();
      await saveProfile(
        userWallet || '',
        { displayName },
        token || ''
      );
      Alert.alert("Success", "Display name saved!");
      setIsEditingName(false);
    } catch (error: any) {
      Alert.alert("Error", `Failed to save: ${error.message}`);
    } finally {
      setIsSavingProfile(false);
    }
  }, [displayName, userWallet, getAccessToken]);

  const handleCheckENS = useCallback(async () => {
    if (!ensName.trim()) {
      Alert.alert("Error", "Please enter an ENS name to check");
      return;
    }

    if (!/^[a-z0-9-]+$/.test(ensName)) {
      Alert.alert("Error", "ENS name can only contain lowercase letters, numbers, and hyphens");
      return;
    }

    setIsCheckingENS(true);
    setENSAvailable(null);

    try {
      const available = await checkENSAvailability(ensName);
      setENSAvailable(available);

      if (available) {
        Alert.alert(
          "Available! 🎉",
          `${ensName}.pyusd.eth is available!\n\nWould you like to register it?`,
          [
            { text: "Not Now", style: "cancel" },
            { text: "Register", onPress: handleRegisterENS }
          ]
        );
      } else {
        Alert.alert("Unavailable", `${ensName}.pyusd.eth is already taken. Try another name.`);
      }
    } catch (error: any) {
      Alert.alert("Error", `Failed to check availability: ${error.message}`);
    } finally {
      setIsCheckingENS(false);
    }
  }, [ensName]);

  const handleRegisterENS = useCallback(async () => {
    if (!ensName.trim() || !userWallet || !smartWalletAddress) {
      Alert.alert("Error", "Missing required information for ENS registration");
      return;
    }

    setIsRegisteringENS(true);

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error("Failed to get access token");
      }

      const result = await registerENS(ensName, userWallet, smartWalletAddress, token);

      if (result.success) {
        Alert.alert(
          "Success! 🎉",
          `${ensName}.pyusd.eth has been registered!\n\nTransaction: ${result.transactionHash}`,
        );
        setENSName("");
        setENSAvailable(null);
      } else {
        throw new Error(result.error || "Registration failed");
      }
    } catch (error: any) {
      Alert.alert("Error", `Failed to register ENS: ${error.message}`);
    } finally {
      setIsRegisteringENS(false);
    }
  }, [ensName, userWallet, smartWalletAddress, getAccessToken]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.greeting}>Profile</Text>
            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={20} color="#0070BA" />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Customize your account</Text>
        </View>

        {/* Avatar Card */}
        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {displayName ? displayName.charAt(0).toUpperCase() : userEmail?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <Text style={styles.userName}>{displayName || "User"}</Text>
            {userEmail && <Text style={styles.userEmail}>{userEmail}</Text>}
          </View>
        </View>

        {/* Display Name Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person" size={24} color="#0070BA" />
            <Text style={styles.cardTitle}>Display Name</Text>
          </View>

          {isEditingName ? (
            <View>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your display name"
                placeholderTextColor="#9ca3af"
                autoFocus
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setIsEditingName(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSaveName}
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.displayNameContainer}>
                <Text style={styles.displayNameText}>
                  {displayName || "Not set"}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={() => setIsEditingName(true)}
              >
                <Ionicons name="pencil" size={16} color="#0070BA" />
                <Text style={styles.editButtonText}>Edit Display Name</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ENS Registration Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="globe" size={24} color="#0070BA" />
            <Text style={styles.cardTitle}>ENS Name</Text>
          </View>

          <Text style={styles.description}>
            Register a custom .pyusd.eth name for your wallet
          </Text>

          <View style={styles.ensInputContainer}>
            <TextInput
              style={[styles.input, styles.ensInput]}
              value={ensName}
              onChangeText={(text) => {
                setENSName(text.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                setENSAvailable(null);
              }}
              placeholder="yourname"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.ensSuffix}>.pyusd.eth</Text>
          </View>

          {ensAvailable !== null && (
            <View style={[
              styles.availabilityBadge,
              ensAvailable ? styles.availableBadge : styles.unavailableBadge
            ]}>
              <Ionicons
                name={ensAvailable ? "checkmark-circle" : "close-circle"}
                size={20}
                color={ensAvailable ? "#10b981" : "#ef4444"}
              />
              <Text style={[
                styles.availabilityText,
                ensAvailable ? styles.availableText : styles.unavailableText
              ]}>
                {ensAvailable ? "Available!" : "Already taken"}
              </Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.checkButton]}
              onPress={handleCheckENS}
              disabled={isCheckingENS || !ensName.trim()}
            >
              {isCheckingENS ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="search" size={16} color="#fff" />
                  <Text style={styles.checkButtonText}>Check Availability</Text>
                </>
              )}
            </TouchableOpacity>

            {ensAvailable && (
              <TouchableOpacity
                style={[styles.button, styles.registerButton]}
                onPress={handleRegisterENS}
                disabled={isRegisteringENS}
              >
                {isRegisteringENS ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={16} color="#fff" />
                    <Text style={styles.registerButtonText}>Register</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#0070BA" />
            <Text style={styles.infoText}>
              Registration is gas-free! Your smart wallet will handle the transaction.
            </Text>
          </View>
        </View>

        {/* Wallet Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="wallet" size={24} color="#0070BA" />
            <Text style={styles.cardTitle}>Wallet Addresses</Text>
          </View>

          {userWallet && (
            <View style={styles.addressRow}>
              <Text style={styles.addressLabel}>EOA Address</Text>
              <Text style={styles.addressText} numberOfLines={1}>
                {userWallet.slice(0, 10)}...{userWallet.slice(-8)}
              </Text>
            </View>
          )}

          {smartWalletAddress && (
            <View style={styles.addressRow}>
              <Text style={styles.addressLabel}>Smart Wallet</Text>
              <Text style={styles.addressText} numberOfLines={1}>
                {smartWalletAddress.slice(0, 10)}...{smartWalletAddress.slice(-8)}
              </Text>
            </View>
          )}
        </View>

        {/* Account Actions */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="settings" size={24} color="#0070BA" />
            <Text style={styles.cardTitle}>Account</Text>
          </View>

          <TouchableOpacity style={styles.actionButton} onPress={logout}>
            <Ionicons name="log-out" size={20} color="#ef4444" />
            <Text style={styles.actionButtonText}>Logout</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E1E1E',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F0F7FF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0070BA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  displayNameContainer: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  displayNameText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  ensInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ensInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 8,
  },
  ensSuffix: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  availableBadge: {
    backgroundColor: '#d1fae5',
  },
  unavailableBadge: {
    backgroundColor: '#fee2e2',
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  availableText: {
    color: '#10b981',
  },
  unavailableText: {
    color: '#ef4444',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  editButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0070BA',
  },
  editButtonText: {
    color: '#0070BA',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#0070BA',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  checkButton: {
    backgroundColor: '#0070BA',
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#10b981',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#0070BA',
    lineHeight: 18,
  },
  addressRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  addressLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  addressText: {
    fontSize: 14,
    color: '#1f2937',
    fontFamily: 'monospace',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 40,
  },
});
