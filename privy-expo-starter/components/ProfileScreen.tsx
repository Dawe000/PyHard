import React, { useState, useCallback, useEffect } from "react";
import { Alert, SafeAreaView as RNSafeAreaView } from "react-native";
import { YStack, XStack, Text, Button, Input, Card, Separator, ScrollView, Spinner } from "tamagui";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from "@expo/vector-icons";
import { usePrivy } from "@privy-io/expo";
import { getOrCreateSmartWallet } from "@/services/smartWallet";
import { checkENSAvailability, registerENS, loadProfile as loadProfileData, saveProfile } from "@/services/profileService";

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

  // Load profile data on mount
  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = useCallback(async () => {
    if (!user) return;

    try {
      const profileData = await loadProfileData(userWallet || '');

      if (profileData?.displayName) {
        setDisplayName(profileData.displayName);
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
  }, [user, userWallet, getAccessToken]);

  const handleSaveName = useCallback(async () => {
    if (!displayName.trim()) {
      Alert.alert("Error", "Please enter a display name");
      return;
    }

    setIsSavingProfile(true);
    try {
      const token = await getAccessToken();
      await saveProfile(userWallet || '', { displayName }, token || '');
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
      if (!token) throw new Error("Failed to get access token");

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

              {isEditingName ? (
                <YStack gap={12}>
                  <Input
                    size="$4"
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Enter your display name"
                    autoFocus
                    backgroundColor="rgba(255,255,255,0.05)"
                    borderColor="rgba(0,121,193,0.3)"
                    color="#FFFFFF"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    fontFamily="SpaceMono_400Regular"
                    focusStyle={{ borderColor: '#0079c1' }}
                  />
                  <XStack gap={12}>
                    <Button
                      flex={1}
                      onPress={() => setIsEditingName(false)}
                      backgroundColor="rgba(255,255,255,0.1)"
                      borderColor="rgba(255,255,255,0.2)"
                      borderWidth={1}
                      pressStyle={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                    >
                      <Text color="#FFFFFF" fontFamily="SpaceGrotesk_600SemiBold">Cancel</Text>
                    </Button>
                    <Button
                      flex={1}
                      onPress={handleSaveName}
                      disabled={isSavingProfile}
                      backgroundColor="#0079c1"
                      borderWidth={1}
                      borderColor="rgba(255,255,255,0.2)"
                      pressStyle={{ backgroundColor: '#006ba8' }}
                    >
                      {isSavingProfile ? <Spinner color="#FFFFFF" /> : <Text color="#FFFFFF" fontWeight="600" fontFamily="SpaceGrotesk_600SemiBold">Save</Text>}
                    </Button>
                  </XStack>
                </YStack>
              ) : (
                <YStack gap={12}>
                  <YStack backgroundColor="rgba(0,121,193,0.1)" padding={12} borderRadius={8} borderWidth={1} borderColor="rgba(0,121,193,0.2)">
                    <Text fontSize={15} color="#FFFFFF" fontWeight="500" fontFamily="SpaceMono_400Regular">
                      {displayName || "[ NOT_SET ]"}
                    </Text>
                  </YStack>
                  <Button
                    onPress={() => setIsEditingName(true)}
                    backgroundColor="rgba(0,121,193,0.15)"
                    borderColor="#0079c1"
                    borderWidth={1}
                    icon={<Ionicons name="pencil" size={16} color="#FFFFFF" />}
                    pressStyle={{ backgroundColor: 'rgba(0,121,193,0.25)' }}
                  >
                    <Text color="#FFFFFF" fontWeight="600" fontFamily="SpaceGrotesk_600SemiBold">EDIT NAME</Text>
                  </Button>
                </YStack>
              )}
            </YStack>
          </LinearGradient>
        </YStack>

        {/* ENS Registration Card */}
        <YStack marginHorizontal={16} marginTop={16}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 20, padding: 1 }}
          >
            <YStack backgroundColor="rgba(10,14,39,0.6)" borderRadius={19} padding={20} borderWidth={1} borderColor="rgba(0,121,193,0.2)">
              <XStack alignItems="center" marginBottom={8} gap={8}>
                <Ionicons name="globe" size={20} color="#0079c1" />
                <Text fontSize={16} fontWeight="700" color="#FFFFFF" flex={1} fontFamily="SpaceGrotesk_700Bold">
                  ENS NAME
                </Text>
              </XStack>

              <Text fontSize={12} color="rgba(255,255,255,0.6)" marginBottom={12} fontFamily="SpaceMono_400Regular">
                &gt; Register custom .pyusd.eth domain
              </Text>

              <XStack alignItems="center" gap={8} marginBottom={12}>
                <Input
                  flex={1}
                  size="$4"
                  value={ensName}
                  onChangeText={(text) => {
                    setENSName(text.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                    setENSAvailable(null);
                  }}
                  placeholder="yourname"
                  autoCapitalize="none"
                  autoCorrect={false}
                  backgroundColor="rgba(255,255,255,0.05)"
                  borderColor="rgba(0,121,193,0.3)"
                  color="#FFFFFF"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  fontFamily="SpaceMono_400Regular"
                  focusStyle={{ borderColor: '#0079c1' }}
                />
                <Text fontSize={14} color="rgba(255,255,255,0.6)" fontWeight="500" fontFamily="SpaceMono_700Bold">
                  .pyusd.eth
                </Text>
              </XStack>

              {ensAvailable !== null && (
                <XStack
                  alignItems="center"
                  padding={10}
                  borderRadius={8}
                  gap={8}
                  marginBottom={12}
                  backgroundColor={ensAvailable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}
                  borderWidth={1}
                  borderColor={ensAvailable ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}
                >
                  <Ionicons
                    name={ensAvailable ? "checkmark-circle" : "close-circle"}
                    size={20}
                    color={ensAvailable ? "#10b981" : "#ef4444"}
                  />
                  <Text fontSize={13} fontWeight="700" color={ensAvailable ? "#10b981" : "#ef4444"} fontFamily="SpaceGrotesk_700Bold">
                    {ensAvailable ? "✓ AVAILABLE" : "✗ TAKEN"}
                  </Text>
                </XStack>
              )}

              <XStack gap={12} marginBottom={12}>
                <Button
                  flex={1}
                  onPress={handleCheckENS}
                  disabled={isCheckingENS || !ensName.trim()}
                  backgroundColor="#0079c1"
                  borderWidth={1}
                  borderColor="rgba(255,255,255,0.2)"
                  icon={isCheckingENS ? undefined : <Ionicons name="search" size={16} color="#FFFFFF" />}
                  pressStyle={{ backgroundColor: '#006ba8' }}
                  opacity={isCheckingENS || !ensName.trim() ? 0.5 : 1}
                >
                  {isCheckingENS ? (
                    <Spinner color="#FFFFFF" />
                  ) : (
                    <Text color="#FFFFFF" fontWeight="600" fontFamily="SpaceGrotesk_600SemiBold">CHECK</Text>
                  )}
                </Button>

                {ensAvailable && (
                  <Button
                    flex={1}
                    onPress={handleRegisterENS}
                    disabled={isRegisteringENS}
                    backgroundColor="#10b981"
                    borderWidth={1}
                    borderColor="rgba(255,255,255,0.2)"
                    icon={isRegisteringENS ? undefined : <Ionicons name="sparkles" size={16} color="#FFFFFF" />}
                    pressStyle={{ backgroundColor: '#059669' }}
                  >
                    {isRegisteringENS ? (
                      <Spinner color="#FFFFFF" />
                    ) : (
                      <Text color="#FFFFFF" fontWeight="600" fontFamily="SpaceGrotesk_600SemiBold">REGISTER</Text>
                    )}
                  </Button>
                )}
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
                  Gas-free registration via smart wallet
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
