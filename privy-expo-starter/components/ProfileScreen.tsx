import React, { useState, useCallback, useEffect } from "react";
import { Alert, SafeAreaView as RNSafeAreaView } from "react-native";
import { YStack, XStack, Text, Button, Input, Card, Separator, ScrollView, Spinner } from "tamagui";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from "@expo/vector-icons";
import { usePrivy } from "@privy-io/expo";
import { getOrCreateSmartWallet } from "@/services/smartWallet";
import {
  getProfile,
  saveProfile as saveUserProfile,
  checkUsernameAvailability,
  UserProfile,
} from "@/services/profileService";

export const ProfileScreen = () => {
  const { user, logout, getAccessToken } = usePrivy();

  // Profile state
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [smartWalletAddress, setSmartWalletAddress] = useState("");

  // User info - extract from linked_accounts
  const emailAccount = user?.linked_accounts?.find((account: any) => account.type === 'email') as { address?: string } | undefined;
  const walletAccount = user?.linked_accounts?.find((account: any) => account.type === 'wallet') as { address?: string } | undefined;

  const userEmail: string | undefined = emailAccount?.address;
  const userWallet: string | undefined = walletAccount?.address;

  // Load profile data on mount
  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = useCallback(async () => {
    if (!user || !userWallet) return;

    try {
      const profileData = await getProfile(userWallet);

      if (profileData) {
        setDisplayName(profileData.display_name || '');
        setUsername(profileData.username || '');
        setBio(profileData.bio || '');
      } else if (userEmail) {
        const emailPrefix = userEmail.split('@')[0];
        setDisplayName(emailPrefix);
      }

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
  }, [user, userWallet, userEmail, getAccessToken]);

  const handleCheckUsername = useCallback(async () => {
    if (!username.trim()) {
      setUsernameError("Please enter a username");
      return;
    }

    const usernameRegex = /^[a-z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      setUsernameError("Username must be 3-20 characters (lowercase letters, numbers, underscore only)");
      setUsernameAvailable(false);
      return;
    }

    setIsCheckingUsername(true);
    setUsernameAvailable(null);
    setUsernameError(null);

    try {
      const result = await checkUsernameAvailability(username);
      setUsernameAvailable(result.available);

      if (!result.available) {
        setUsernameError(result.error || "Username is already taken");
      }
    } catch (error: any) {
      setUsernameError("Failed to check username availability");
    } finally {
      setIsCheckingUsername(false);
    }
  }, [username]);

  const handleSaveProfile = useCallback(async () => {
    if (!userWallet) {
      Alert.alert("Error", "Wallet not connected");
      return;
    }

    // Validate username if changed
    if (username && username.trim()) {
      const usernameRegex = /^[a-z0-9_]{3,20}$/;
      if (!usernameRegex.test(username)) {
        Alert.alert("Error", "Username must be 3-20 characters (lowercase letters, numbers, underscore only)");
        return;
      }
    }

    setIsSavingProfile(true);
    try {
      const profileUpdate: UserProfile = {
        wallet_address: userWallet,
        display_name: displayName.trim() || undefined,
        username: username.trim() || undefined,
        bio: bio.trim() || undefined,
      };

      await saveUserProfile(profileUpdate);
      Alert.alert("Success", "Profile saved!");
      setIsEditingProfile(false);
      setUsernameAvailable(null);
      setUsernameError(null);
    } catch (error: any) {
      Alert.alert("Error", `Failed to save profile: ${error.message}`);
    } finally {
      setIsSavingProfile(false);
    }
  }, [displayName, username, bio, userWallet]);

  
  return (
    <RNSafeAreaView style={{ flex: 1, backgroundColor: '#0a0e27' }}>
      <ScrollView flex={1} backgroundColor="#0a0e27">
        {/* Animated Header with Gradient */}
        <YStack>
          <LinearGradient
            colors={['#0079c1', '#003087', '#0a0e27']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingHorizontal: 10, paddingTop: 20, paddingBottom: 24 }}
          >
            <XStack justifyContent="space-between" alignItems="center">
              <YStack flex={1}>
                <Text fontSize={32} fontWeight="700" color="#FFFFFF" fontFamily="SpaceGrotesk_700Bold" letterSpacing={-1}>
                  PROFILE
                </Text>
                <Text fontSize={14} color="rgba(255,255,255,0.7)" marginTop={4} fontFamily="SpaceMono_400Regular">
                  &gt; Customize your account_
                </Text>
              </YStack>
              <Button
                size="$3"
                circular
                icon={<Ionicons name="log-out-outline" size={20} color="#0079c1" />}
                onPress={logout}
                backgroundColor="rgba(255,255,255,0.9)"
                borderWidth={1}
                borderColor="rgba(0,121,193,0.3)"
                pressStyle={{ scale: 0.95, backgroundColor: "#FFFFFF" }}
              />
            </XStack>
          </LinearGradient>
        </YStack>

        {/* Avatar Card - Glassmorphism */}
        <YStack marginHorizontal={16} marginTop={20}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 20, padding: 1 }}
          >
            <YStack
              backgroundColor="rgba(10,14,39,0.6)"
              borderRadius={19}
              padding={16}
              borderWidth={1}
              borderColor="rgba(0,121,193,0.2)"
              alignItems="center"
            >
              <LinearGradient
                colors={['#0079c1', '#009cde']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                  borderWidth: 2,
                  borderColor: 'rgba(255,255,255,0.2)',
                }}
              >
                <Text fontSize={40} color="#FFFFFF" fontWeight="700" fontFamily="SpaceGrotesk_700Bold">
                  {displayName ? displayName.charAt(0).toUpperCase() : userEmail?.charAt(0).toUpperCase() || "U"}
                </Text>
              </LinearGradient>
              <Text fontSize={20} fontWeight="700" color="#FFFFFF" fontFamily="SpaceGrotesk_700Bold">
                {displayName || "USER"}
              </Text>
              {userEmail && (
                <Text fontSize={12} color="rgba(255,255,255,0.6)" marginTop={4} fontFamily="SpaceMono_400Regular">
                  {userEmail}
                </Text>
              )}
            </YStack>
          </LinearGradient>
        </YStack>

        {/* Display Name Card */}
        <YStack marginHorizontal={16} marginTop={16}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 20, padding: 1 }}
          >
            <YStack backgroundColor="rgba(10,14,39,0.6)" borderRadius={19} padding={20} borderWidth={1} borderColor="rgba(0,121,193,0.2)">
              <XStack alignItems="center" marginBottom={12} gap={8}>
                <Ionicons name="person" size={20} color="#0079c1" />
                <Text fontSize={16} fontWeight="700" color="#FFFFFF" flex={1} fontFamily="SpaceGrotesk_700Bold">
                  DISPLAY NAME
                </Text>
              </XStack>

              <YStack gap={12}>
                <YStack backgroundColor="rgba(0,121,193,0.1)" padding={12} borderRadius={8} borderWidth={1} borderColor="rgba(0,121,193,0.2)">
                  <Text fontSize={15} color="#FFFFFF" fontWeight="500" fontFamily="SpaceMono_400Regular">
                    {displayName || "[ NOT_SET ]"}
                  </Text>
                </YStack>
              </YStack>
            </YStack>
          </LinearGradient>
        </YStack>

        {/* Edit Profile Card */}
        <YStack marginHorizontal={16} marginTop={16}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 20, padding: 1 }}
          >
            <YStack backgroundColor="rgba(10,14,39,0.6)" borderRadius={19} padding={20} borderWidth={1} borderColor="rgba(0,121,193,0.2)">
              <XStack alignItems="center" marginBottom={8} gap={8}>
                <Ionicons name="create" size={20} color="#0079c1" />
                <Text fontSize={16} fontWeight="700" color="#FFFFFF" flex={1} fontFamily="SpaceGrotesk_700Bold">
                  EDIT PROFILE
                </Text>
              </XStack>

              <Text fontSize={12} color="rgba(255,255,255,0.6)" marginBottom={16} fontFamily="SpaceMono_400Regular">
                &gt; Set your username and display name
              </Text>

              {/* Display Name Input */}
              <YStack marginBottom={16}>
                <Text fontSize={12} color="rgba(255,255,255,0.7)" marginBottom={8} fontFamily="SpaceGrotesk_600SemiBold">
                  Display Name
                </Text>
                <Input
                  size="$4"
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Enter your display name"
                  backgroundColor="rgba(255,255,255,0.05)"
                  borderColor="rgba(0,121,193,0.3)"
                  color="#FFFFFF"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  fontFamily="SpaceMono_400Regular"
                  focusStyle={{ borderColor: '#0079c1' }}
                />
              </YStack>

              {/* Username Input */}
              <YStack marginBottom={12}>
                <Text fontSize={12} color="rgba(255,255,255,0.7)" marginBottom={8} fontFamily="SpaceGrotesk_600SemiBold">
                  Username (searchable by others)
                </Text>
                <Input
                  size="$4"
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                    setUsernameAvailable(null);
                    setUsernameError(null);
                  }}
                  placeholder="yourname"
                  autoCapitalize="none"
                  autoCorrect={false}
                  backgroundColor="rgba(255,255,255,0.05)"
                  borderColor={usernameError ? 'rgba(239, 68, 68, 0.5)' : 'rgba(0,121,193,0.3)'}
                  color="#FFFFFF"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  fontFamily="SpaceMono_400Regular"
                  focusStyle={{ borderColor: '#0079c1' }}
                />
              </YStack>

              {usernameError && (
                <XStack
                  alignItems="center"
                  padding={10}
                  borderRadius={8}
                  gap={8}
                  marginBottom={12}
                  backgroundColor="rgba(239, 68, 68, 0.15)"
                  borderWidth={1}
                  borderColor="rgba(239, 68, 68, 0.3)"
                >
                  <Ionicons name="close-circle" size={20} color="#ef4444" />
                  <Text fontSize={12} color="#ef4444" fontFamily="SpaceMono_400Regular" flex={1}>
                    {usernameError}
                  </Text>
                </XStack>
              )}

              {usernameAvailable === true && (
                <XStack
                  alignItems="center"
                  padding={10}
                  borderRadius={8}
                  gap={8}
                  marginBottom={12}
                  backgroundColor="rgba(16, 185, 129, 0.15)"
                  borderWidth={1}
                  borderColor="rgba(16, 185, 129, 0.3)"
                >
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <Text fontSize={13} fontWeight="700" color="#10b981" fontFamily="SpaceGrotesk_700Bold">
                    ✓ AVAILABLE
                  </Text>
                </XStack>
              )}

              {/* Bio Input */}
              <YStack marginBottom={16}>
                <Text fontSize={12} color="rgba(255,255,255,0.7)" marginBottom={8} fontFamily="SpaceGrotesk_600SemiBold">
                  Bio (optional)
                </Text>
                <Input
                  size="$4"
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell us about yourself..."
                  backgroundColor="rgba(255,255,255,0.05)"
                  borderColor="rgba(0,121,193,0.3)"
                  color="#FFFFFF"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  fontFamily="SpaceMono_400Regular"
                  focusStyle={{ borderColor: '#0079c1' }}
                  multiline
                  numberOfLines={2}
                />
              </YStack>

              {/* Action Buttons */}
              <XStack gap={12} marginBottom={12}>
                <Button
                  flex={1}
                  onPress={handleCheckUsername}
                  disabled={isCheckingUsername || !username.trim()}
                  backgroundColor="rgba(0,121,193,0.2)"
                  borderWidth={1}
                  borderColor="#0079c1"
                  icon={isCheckingUsername ? undefined : <Ionicons name="search" size={16} color="#0079c1" />}
                  pressStyle={{ backgroundColor: 'rgba(0,121,193,0.3)' }}
                  opacity={isCheckingUsername || !username.trim() ? 0.5 : 1}
                >
                  {isCheckingUsername ? (
                    <Spinner color="#0079c1" />
                  ) : (
                    <Text color="#0079c1" fontWeight="600" fontFamily="SpaceGrotesk_600SemiBold">CHECK</Text>
                  )}
                </Button>

                <Button
                  flex={1}
                  onPress={handleSaveProfile}
                  disabled={isSavingProfile}
                  backgroundColor="#0079c1"
                  borderWidth={1}
                  borderColor="rgba(255,255,255,0.2)"
                  icon={isSavingProfile ? undefined : <Ionicons name="save" size={16} color="#FFFFFF" />}
                  pressStyle={{ backgroundColor: '#006ba8' }}
                >
                  {isSavingProfile ? (
                    <Spinner color="#FFFFFF" />
                  ) : (
                    <Text color="#FFFFFF" fontWeight="600" fontFamily="SpaceGrotesk_600SemiBold">SAVE</Text>
                  )}
                </Button>
              </XStack>

              <XStack
                alignItems="flex-start"
                backgroundColor="rgba(0,121,193,0.1)"
                padding={12}
                borderRadius={8}
                gap={8}
                borderWidth={1}
                borderColor="rgba(0,121,193,0.2)"
              >
                <Ionicons name="information-circle" size={18} color="#0079c1" />
                <Text flex={1} fontSize={11} color="rgba(255,255,255,0.7)" lineHeight={16} fontFamily="SpaceMono_400Regular">
                  Username: 3-20 chars, lowercase, alphanumeric + underscore only
                </Text>
              </XStack>
            </YStack>
          </LinearGradient>
        </YStack>

        {/* Wallet Info Card */}
        <YStack marginHorizontal={16} marginTop={16}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 20, padding: 1 }}
          >
            <YStack backgroundColor="rgba(10,14,39,0.6)" borderRadius={19} padding={20} borderWidth={1} borderColor="rgba(0,121,193,0.2)">
              <XStack alignItems="center" marginBottom={16} gap={8}>
                <Ionicons name="wallet" size={20} color="#0079c1" />
                <Text fontSize={16} fontWeight="700" color="#FFFFFF" flex={1} fontFamily="SpaceGrotesk_700Bold">
                  WALLET ADDRESSES
                </Text>
              </XStack>

              {userWallet && (
                <>
                  <YStack marginBottom={12}>
                    <Text fontSize={11} color="rgba(255,255,255,0.5)" marginBottom={6} fontWeight="500" fontFamily="SpaceGrotesk_600SemiBold" letterSpacing={1}>
                      EOA ADDRESS
                    </Text>
                    <YStack backgroundColor="rgba(0,121,193,0.1)" padding={12} borderRadius={8} borderWidth={1} borderColor="rgba(0,121,193,0.2)">
                      <Text fontSize={13} color="#FFFFFF" fontFamily="SpaceMono_400Regular">
                        {userWallet.slice(0, 10)}...{userWallet.slice(-8)}
                      </Text>
                    </YStack>
                  </YStack>
                </>
              )}

              {smartWalletAddress && (
                <YStack>
                  <Text fontSize={11} color="rgba(255,255,255,0.5)" marginBottom={6} fontWeight="500" fontFamily="SpaceGrotesk_600SemiBold" letterSpacing={1}>
                    SMART WALLET
                  </Text>
                  <YStack backgroundColor="rgba(0,121,193,0.1)" padding={12} borderRadius={8} borderWidth={1} borderColor="rgba(0,121,193,0.2)">
                    <Text fontSize={13} color="#FFFFFF" fontFamily="SpaceMono_400Regular">
                      {smartWalletAddress.slice(0, 10)}...{smartWalletAddress.slice(-8)}
                    </Text>
                  </YStack>
                </YStack>
              )}
            </YStack>
          </LinearGradient>
        </YStack>

        {/* Account Actions */}
        <YStack marginHorizontal={16} marginTop={16} marginBottom={24}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 20, padding: 1 }}
          >
            <YStack backgroundColor="rgba(10,14,39,0.6)" borderRadius={19} padding={20} borderWidth={1} borderColor="rgba(0,121,193,0.2)">
              <XStack alignItems="center" marginBottom={12} gap={8}>
                <Ionicons name="settings" size={20} color="#0079c1" />
                <Text fontSize={16} fontWeight="700" color="#FFFFFF" flex={1} fontFamily="SpaceGrotesk_700Bold">
                  ACCOUNT
                </Text>
              </XStack>

              <Button
                onPress={logout}
                backgroundColor="rgba(239, 68, 68, 0.15)"
                borderColor="rgba(239, 68, 68, 0.3)"
                borderWidth={1}
                pressStyle={{ backgroundColor: 'rgba(239, 68, 68, 0.25)' }}
                icon={<Ionicons name="log-out" size={18} color="#ef4444" />}
                justifyContent="flex-start"
                paddingHorizontal={16}
              >
                <Text color="#FFFFFF" flex={1} textAlign="left" fontWeight="600" fontFamily="SpaceGrotesk_600SemiBold">
                  LOGOUT
                </Text>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
              </Button>
            </YStack>
          </LinearGradient>
        </YStack>
      </ScrollView>
    </RNSafeAreaView>
  );
};
