import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChildTransaction {
  hash: string;
  from: string; // Smart wallet address
  to: string; // Recipient address
  value: string; // Amount in smallest units (6 decimals for PYUSD)
  timeStamp: string; // Unix timestamp
  type: 'sent' | 'received';
  amount: string; // Amount in PYUSD units
  childEOA: string; // The child wallet that initiated this transaction
  smartWalletAddress: string; // The parent's smart wallet address
}

// Blockscout API configuration
const BLOCKSCOUT_API_BASE = 'https://arbitrum-sepolia.blockscout.com/api/v2';
const PYUSD_TOKEN_ADDRESS = '0x637A1259C6afd7E3AdF63993cA7E58BB438aB1B1';

/**
 * Fetch transactions from Blockscout for the parent smart wallet
 * and filter for transactions initiated by the specific child
 */
export async function getChildTransactionsFromBlockscout(
  childEOA: string,
  smartWalletAddress: string
): Promise<ChildTransaction[]> {
  try {
    console.log('🔍 Fetching transactions from Blockscout for smart wallet:', smartWalletAddress);
    console.log('🔍 Filtering for child EOA:', childEOA);
    
    // Fetch token transfers for the smart wallet
    const url = `${BLOCKSCOUT_API_BASE}/addresses/${smartWalletAddress}/token-transfers?token=${PYUSD_TOKEN_ADDRESS}&type=ERC-20`;
    console.log('📡 API URL:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      console.log('❌ Error fetching from Blockscout:', response.status);
      return [];
    }
    
    const data = await response.json();
    const transfers = data.items || [];
    
    console.log(`📊 Found ${transfers.length} total transfers for smart wallet`);
    
    // Filter transfers by checking transaction details
    const childTransactions: ChildTransaction[] = [];
    
    for (const transfer of transfers) {
      // Fetch transaction details to check if it was initiated by our child
      const txUrl = `${BLOCKSCOUT_API_BASE}/transactions/${transfer.transaction_hash}`;
      const txResponse = await fetch(txUrl);
      
      if (txResponse.ok) {
        const txData = await txResponse.json();
        
        // Check if transaction was sent TO the child EOA (EIP-7702 delegation)
        const wasInitiatedByChild = txData.to?.hash?.toLowerCase() === childEOA.toLowerCase();
        
        if (wasInitiatedByChild) {
          const isSent = transfer.from.hash.toLowerCase() === smartWalletAddress.toLowerCase();
          const timestamp = new Date(transfer.timestamp).getTime() / 1000;
          
          childTransactions.push({
            hash: transfer.transaction_hash,
            from: transfer.from.hash,
            to: transfer.to.hash,
            value: transfer.total.value,
            timeStamp: String(Math.floor(timestamp)),
            type: isSent ? 'sent' : 'received',
            amount: (parseInt(transfer.total.value) / 1e6).toFixed(2),
            childEOA: childEOA,
            smartWalletAddress: smartWalletAddress,
          });
          
          console.log(`✅ Found child transaction: ${isSent ? 'SENT' : 'RECEIVED'} ${(parseInt(transfer.total.value) / 1e6).toFixed(2)} PYUSD`);
        }
      }
    }
    
    console.log(`✅ Found ${childTransactions.length} transactions initiated by child ${childEOA}`);
    return childTransactions;
    
  } catch (error) {
    console.error('❌ Error fetching from Blockscout:', error);
    return [];
  }
}

/**
 * Save a transaction to the child's local history
 * Transactions are stored per parent wallet, not per child wallet
 */
export async function saveChildTransaction(
  transaction: Omit<ChildTransaction, 'childEOA' | 'smartWalletAddress'>,
  childEOA: string,
  smartWalletAddress: string
): Promise<void> {
  try {
    const key = `child_transactions_${smartWalletAddress}`;
    
    const fullTransaction: ChildTransaction = {
      ...transaction,
      childEOA,
      smartWalletAddress,
    };
    
    // Get existing transactions for this parent wallet
    const stored = await AsyncStorage.getItem(key);
    const existingTxs: ChildTransaction[] = stored ? JSON.parse(stored) : [];
    
    // Add new transaction at the beginning (newest first)
    const updatedTxs = [fullTransaction, ...existingTxs];
    
    // Save back to storage
    await AsyncStorage.setItem(key, JSON.stringify(updatedTxs));
    
    console.log('✅ Transaction saved to history for parent wallet:', smartWalletAddress);
    console.log('📝 Transaction initiated by child:', childEOA);
  } catch (error) {
    console.error('❌ Failed to save transaction to history:', error);
    throw error;
  }
}

/**
 * Get all transactions for a specific child wallet
 * Fetches from Blockscout and filters by checking transaction details
 */
export async function getChildTransactions(
  childEOA: string,
  smartWalletAddress: string
): Promise<ChildTransaction[]> {
  try {
    console.log('🔍 Fetching transactions for child:', childEOA);
    console.log('🔍 Through smart wallet:', smartWalletAddress);
    
    // Fetch from Blockscout
    const blockscoutTxs = await getChildTransactionsFromBlockscout(childEOA, smartWalletAddress);
    
    // Also get locally tracked transactions (for recently sent txs that might not be indexed yet)
    const key = `child_transactions_${smartWalletAddress}`;
    const stored = await AsyncStorage.getItem(key);
    const localTxs: ChildTransaction[] = stored ? JSON.parse(stored) : [];
    
    // Filter local transactions for this child
    const localChildTxs = localTxs.filter(tx => 
      tx.childEOA.toLowerCase() === childEOA.toLowerCase()
    );
    
    // Merge and deduplicate (Blockscout is source of truth, local is for recent txs)
    const allTxs = [...blockscoutTxs];
    const blockscoutHashes = new Set(blockscoutTxs.map(tx => tx.hash.toLowerCase()));
    
    // Add local transactions that aren't in Blockscout yet
    for (const localTx of localChildTxs) {
      if (!blockscoutHashes.has(localTx.hash.toLowerCase())) {
        allTxs.push(localTx);
      }
    }
    
    // Sort by timestamp (newest first)
    allTxs.sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp));
    
    console.log(`✅ Total transactions for child: ${allTxs.length} (${blockscoutTxs.length} from Blockscout, ${localChildTxs.length - blockscoutTxs.length} pending locally)`);
    
    return allTxs;
  } catch (error) {
    console.error('❌ Error loading child transactions:', error);
    return [];
  }
}

/**
 * Get all transactions for a parent wallet (all children combined)
 */
export async function getAllParentWalletTransactions(
  smartWalletAddress: string
): Promise<ChildTransaction[]> {
  try {
    const key = `child_transactions_${smartWalletAddress}`;
    const stored = await AsyncStorage.getItem(key);
    
    if (!stored) {
      console.log('📭 No transactions found for parent wallet:', smartWalletAddress);
      return [];
    }
    
    const allTxs: ChildTransaction[] = JSON.parse(stored);
    console.log(`✅ Found ${allTxs.length} total transactions for parent wallet`);
    
    return allTxs;
  } catch (error) {
    console.error('❌ Error loading parent wallet transactions:', error);
    return [];
  }
}

/**
 * Clear all transactions for a specific parent wallet
 * Useful for testing or resetting data
 */
export async function clearParentWalletTransactions(
  smartWalletAddress: string
): Promise<void> {
  try {
    const key = `child_transactions_${smartWalletAddress}`;
    await AsyncStorage.removeItem(key);
    console.log('✅ Cleared all transactions for parent wallet:', smartWalletAddress);
  } catch (error) {
    console.error('❌ Error clearing transactions:', error);
    throw error;
  }
}
