import { createPublicClient, http, formatUnits } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { PYUSD_ADDRESS } from '@/constants/contracts';

// Blockscout API configuration
const BLOCKSCOUT_API_BASE = 'https://arbitrum-sepolia.blockscout.com/api/v2';
const PYUSD_TOKEN_ADDRESS = '0x637A1259C6afd7E3AdF63993cA7E58BB438aB1B1';

// PYUSD ABI for Transfer events (fallback)
const PYUSD_ABI = [
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false }
    ]
  }
] as const;

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  amount: string; // in PYUSD units
  displayAmount: string; // formatted for display
  timestamp: number;
  blockNumber: bigint;
  type: 'sent' | 'received';
}

// Blockscout API response interfaces
interface BlockscoutTokenTransfer {
  block_hash: string;
  block_number: number;
  from: {
    hash: string;
  };
  to: {
    hash: string;
  };
  token: {
    address_hash: string;
    decimals: string;
    name: string;
    symbol: string;
  };
  total: {
    decimals: string;
    value: string;
  };
  transaction_hash: string;
  timestamp: string;
  type: string;
}

interface BlockscoutResponse {
  items: BlockscoutTokenTransfer[];
  next_page_params: any;
}

export interface TransactionHistoryOptions {
  fromBlock?: bigint;
  toBlock?: bigint;
  limit?: number;
}

/**
 * Fetch token transfers from Blockscout API
 */
async function fetchBlockscoutTransfers(
  address: string,
  tokenAddress: string,
  filter: 'from' | 'to' | 'both' = 'both',
  limit: number = 50
): Promise<BlockscoutTokenTransfer[]> {
  const transfers: BlockscoutTokenTransfer[] = [];
  
  try {
    // Fetch sent transfers
    if (filter === 'from' || filter === 'both') {
      const sentUrl = `${BLOCKSCOUT_API_BASE}/addresses/${address}/token-transfers?token=${tokenAddress}&type=ERC-20&filter=from`;
      console.log('🔍 Fetching sent transfers from:', sentUrl);
      
      const sentResponse = await fetch(sentUrl);
      if (sentResponse.ok) {
        const sentData: BlockscoutResponse = await sentResponse.json();
        transfers.push(...sentData.items);
        console.log('📤 Sent transfers found:', sentData.items.length);
      } else {
        console.log('❌ Error fetching sent transfers:', sentResponse.status);
      }
    }
    
    // Fetch received transfers
    if (filter === 'to' || filter === 'both') {
      const receivedUrl = `${BLOCKSCOUT_API_BASE}/addresses/${address}/token-transfers?token=${tokenAddress}&type=ERC-20&filter=to`;
      console.log('🔍 Fetching received transfers from:', receivedUrl);
      
      const receivedResponse = await fetch(receivedUrl);
      if (receivedResponse.ok) {
        const receivedData: BlockscoutResponse = await receivedResponse.json();
        transfers.push(...receivedData.items);
        console.log('📥 Received transfers found:', receivedData.items.length);
      } else {
        console.log('❌ Error fetching received transfers:', receivedResponse.status);
      }
    }
    
    // Remove duplicates based on transaction hash and log index
    const uniqueTransfers = transfers.filter((transfer, index, self) => 
      index === self.findIndex(t => 
        t.transaction_hash === transfer.transaction_hash && 
        t.block_number === transfer.block_number
      )
    );
    
    console.log('📊 Total unique transfers:', uniqueTransfers.length);
    return uniqueTransfers.slice(0, limit);
    
  } catch (error) {
    console.error('❌ Error fetching Blockscout transfers:', error);
    return [];
  }
}

/**
 * Get transaction history for a SmartWallet address (PYUSD transfers only)
 * Uses Blockscout API for reliable data fetching
 */
export async function getTransactionHistory(
  smartWalletAddress: string,
  options: TransactionHistoryOptions = {}
): Promise<Transaction[]> {
  try {
    console.log('🔍 Fetching transaction history for SmartWallet:', smartWalletAddress);
    console.log('🔍 Using Blockscout API for PYUSD transfers');
    console.log('🔍 PYUSD token address:', PYUSD_TOKEN_ADDRESS);
    console.log('🔍 Limit:', options.limit || 50);
    
    // Fetch transfers from Blockscout API
    const transfers = await fetchBlockscoutTransfers(
      smartWalletAddress,
      PYUSD_TOKEN_ADDRESS,
      'both',
      options.limit || 50
    );
    
    console.log('📊 Raw transfers from Blockscout:', transfers.length);
    
    // Convert Blockscout transfers to our Transaction format
    const transactions: Transaction[] = transfers.map(transfer => {
      const isSent = transfer.from.hash.toLowerCase() === smartWalletAddress.toLowerCase();
      const isReceived = transfer.to.hash.toLowerCase() === smartWalletAddress.toLowerCase();
      
      // Convert amount from smallest units to display units
      const amount = transfer.total.value;
      const decimals = parseInt(transfer.token.decimals);
      const displayAmount = formatUnits(BigInt(amount), decimals);
      
      // Convert timestamp from ISO string to Unix timestamp
      const timestamp = Math.floor(new Date(transfer.timestamp).getTime() / 1000);
      
      return {
        hash: transfer.transaction_hash,
        from: transfer.from.hash,
        to: transfer.to.hash,
        amount,
        displayAmount,
        timestamp: timestamp * 1000, // Convert to milliseconds for display
        blockNumber: BigInt(transfer.block_number),
        type: isSent ? 'sent' : 'received'
      };
    });
    
    // Sort by timestamp (newest first)
    const sortedTransactions = transactions.sort((a, b) => b.timestamp - a.timestamp);
    
    console.log('✅ Processed transactions:', sortedTransactions.length);
    return sortedTransactions;
    
  } catch (error) {
    console.error('❌ Error fetching transaction history:', error);
    return [];
  }
}

/**
 * Get recent transactions (last 24 hours)
 */
export async function getRecentTransactions(
  smartWalletAddress: string,
  limit: number = 20
): Promise<Transaction[]> {
  // For now, just get recent transactions without time filtering
  // Blockscout API doesn't have built-in time filtering, so we'll filter client-side
  const allTransactions = await getTransactionHistory(smartWalletAddress, { limit: 100 });
  
  // Filter to last 24 hours
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentTransactions = allTransactions.filter(tx => tx.timestamp > oneDayAgo);
  
  return recentTransactions.slice(0, limit);
}

/**
 * Get transaction by hash using Blockscout API
 */
export async function getTransactionByHash(
  transactionHash: string
): Promise<Transaction | null> {
  try {
    // Use Blockscout API to get transaction details
    const url = `${BLOCKSCOUT_API_BASE}/transactions/${transactionHash}`;
    console.log('🔍 Fetching transaction details from:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      console.log('❌ Error fetching transaction:', response.status);
      return null;
    }
    
    const txData = await response.json();
    
    // Check if this transaction has PYUSD transfers
    if (txData.token_transfers && txData.token_transfers.length > 0) {
      const pyusdTransfer = txData.token_transfers.find((transfer: any) => 
        transfer.token.address_hash.toLowerCase() === PYUSD_TOKEN_ADDRESS.toLowerCase()
      );
      
      if (pyusdTransfer) {
        const amount = pyusdTransfer.total.value;
        const decimals = parseInt(pyusdTransfer.token.decimals);
        const displayAmount = formatUnits(BigInt(amount), decimals);
        
        // Convert timestamp
        const timestamp = Math.floor(new Date(pyusdTransfer.timestamp).getTime() / 1000);
        
        return {
          hash: transactionHash,
          from: pyusdTransfer.from.hash,
          to: pyusdTransfer.to.hash,
          amount,
          displayAmount,
          timestamp: timestamp * 1000,
          blockNumber: BigInt(pyusdTransfer.block_number),
          type: 'unknown' as 'sent' | 'received' // Can't determine without context
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error fetching transaction:', error);
    return null;
  }
}

/**
 * Format timestamp for display
 */
export function formatTransactionTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60000) { // Less than 1 minute
    return 'Just now';
  } else if (diff < 3600000) { // Less than 1 hour
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  } else if (diff < 86400000) { // Less than 1 day
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  }
}

/**
 * Format address for display
 */
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
