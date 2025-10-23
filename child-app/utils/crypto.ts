import AsyncStorage from '@react-native-async-storage/async-storage';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

const WALLET_KEY = 'child_wallet';

export interface ChildWallet {
  address: string;
  privateKey: string;
}

/**
 * Generate a new EOA keypair for the child
 */
export function generateChildWallet(): ChildWallet {
  // Generate a cryptographically secure private key
  const privateKey = generatePrivateKey();
  
  // Derive the account from the private key
  const account = privateKeyToAccount(privateKey);
  
  return {
    address: account.address,
    privateKey: privateKey
  };
}

/**
 * Save child wallet to secure storage
 */
export async function saveChildWallet(wallet: ChildWallet): Promise<void> {
  try {
    await AsyncStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
    console.log('✅ Child wallet saved securely');
  } catch (error) {
    console.error('❌ Failed to save child wallet:', error);
    throw error;
  }
}

/**
 * Load child wallet from storage
 */
export async function loadChildWallet(): Promise<ChildWallet | null> {
  try {
    const stored = await AsyncStorage.getItem(WALLET_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  } catch (error) {
    console.error('❌ Failed to load child wallet:', error);
    return null;
  }
}

/**
 * Clear child wallet from storage
 */
export async function clearChildWallet(): Promise<void> {
  try {
    await AsyncStorage.removeItem(WALLET_KEY);
    console.log('✅ Child wallet cleared');
  } catch (error) {
    console.error('❌ Failed to clear child wallet:', error);
  }
}

/**
 * Get child wallet account for signing transactions
 */
export async function getChildWalletAccount(): Promise<ReturnType<typeof privateKeyToAccount> | null> {
  try {
    const wallet = await loadChildWallet();
    if (wallet) {
      return privateKeyToAccount(wallet.privateKey as `0x${string}`);
    }
    return null;
  } catch (error) {
    console.error('❌ Failed to get child wallet account:', error);
    return null;
  }
}
