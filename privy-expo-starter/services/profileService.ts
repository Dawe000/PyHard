// Profile Service - Uses AsyncStorage for local data persistence (perfect for hackathon!)

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ENSCheckResponse {
  available: boolean;
  name: string;
}

export interface ENSRegisterResponse {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

// Storage keys
const STORAGE_KEYS = {
  DISPLAY_NAME: 'profile_display_name',
  ENS_NAME: 'profile_ens_name',
  AVATAR_URL: 'profile_avatar_url',
  ENS_REGISTRY: 'ens_registry', // JSON array of registered ENS names
};

/**
 * Check if an ENS name is available
 * @param ensName - The ENS name to check (without .pyusd.eth suffix)
 */
export async function checkENSAvailability(ensName: string): Promise<boolean> {
  try {
    console.log('🔍 Checking ENS availability for:', ensName);

    // Check local AsyncStorage registry
    const registryJson = await AsyncStorage.getItem(STORAGE_KEYS.ENS_REGISTRY);
    const registry: string[] = registryJson ? JSON.parse(registryJson) : [];

    const available = !registry.includes(ensName.toLowerCase());

    console.log('✅ ENS availability result:', available);
    return available;
  } catch (error) {
    console.error('❌ Error checking ENS availability:', error);
    return true; // Default to available on error
  }
}

/**
 * Register an ENS name for the user (saves to AsyncStorage)
 * @param ensName - The ENS name to register (without .pyusd.eth suffix)
 * @param eoaAddress - User's EOA address
 * @param smartWalletAddress - User's smart wallet address
 */
export async function registerENS(
  ensName: string,
  eoaAddress: string,
  smartWalletAddress: string,
  _privyToken: string // Keep signature compatible but unused
): Promise<ENSRegisterResponse> {
  try {
    console.log('🚀 Registering ENS name:', ensName);
    console.log('📊 EOA:', eoaAddress);
    console.log('📊 Smart Wallet:', smartWalletAddress);

    // Check if already registered
    const registryJson = await AsyncStorage.getItem(STORAGE_KEYS.ENS_REGISTRY);
    const registry: string[] = registryJson ? JSON.parse(registryJson) : [];

    if (registry.includes(ensName.toLowerCase())) {
      return {
        success: false,
        error: 'ENS name already registered',
      };
    }

    // Add to registry
    registry.push(ensName.toLowerCase());
    await AsyncStorage.setItem(STORAGE_KEYS.ENS_REGISTRY, JSON.stringify(registry));

    // Save as user's ENS name
    await AsyncStorage.setItem(STORAGE_KEYS.ENS_NAME, ensName.toLowerCase());

    // Generate mock transaction hash
    const txHash = `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`;

    console.log('✅ ENS registered successfully (local storage)');
    return {
      success: true,
      transactionHash: txHash,
    };
  } catch (error) {
    console.error('❌ Error registering ENS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Save user profile data to AsyncStorage
 * @param eoaAddress - User's EOA address (unused but kept for compatibility)
 * @param profileData - Profile data to save
 */
export async function saveProfile(
  _eoaAddress: string,
  profileData: {
    displayName?: string;
    ensName?: string;
    avatarUrl?: string;
  },
  _privyToken: string // Keep signature compatible but unused
): Promise<boolean> {
  try {
    console.log('💾 Saving profile to AsyncStorage');
    console.log('📊 Profile data:', profileData);

    // Save each field to AsyncStorage
    if (profileData.displayName !== undefined) {
      await AsyncStorage.setItem(STORAGE_KEYS.DISPLAY_NAME, profileData.displayName);
    }
    if (profileData.ensName !== undefined) {
      await AsyncStorage.setItem(STORAGE_KEYS.ENS_NAME, profileData.ensName);
    }
    if (profileData.avatarUrl !== undefined) {
      await AsyncStorage.setItem(STORAGE_KEYS.AVATAR_URL, profileData.avatarUrl);
    }

    console.log('✅ Profile saved successfully');
    return true;
  } catch (error) {
    console.error('❌ Error saving profile:', error);
    return false;
  }
}

/**
 * Load user profile data from AsyncStorage
 * @param eoaAddress - User's EOA address (unused but kept for compatibility)
 */
export async function loadProfile(_eoaAddress: string): Promise<{
  displayName?: string;
  ensName?: string;
  avatarUrl?: string;
} | null> {
  try {
    console.log('📥 Loading profile from AsyncStorage');

    const displayName = await AsyncStorage.getItem(STORAGE_KEYS.DISPLAY_NAME);
    const ensName = await AsyncStorage.getItem(STORAGE_KEYS.ENS_NAME);
    const avatarUrl = await AsyncStorage.getItem(STORAGE_KEYS.AVATAR_URL);

    const profile = {
      displayName: displayName || undefined,
      ensName: ensName || undefined,
      avatarUrl: avatarUrl || undefined,
    };

    console.log('✅ Profile loaded:', profile);
    return profile;
  } catch (error) {
    console.error('❌ Error loading profile:', error);
    return null;
  }
}
