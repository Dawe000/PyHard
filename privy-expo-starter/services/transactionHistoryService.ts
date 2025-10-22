import { createPublicClient, http, formatUnits } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { PYUSD_ADDRESS } from '@/constants/contracts';

// PYUSD ABI for Transfer events
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

export interface TransactionHistoryOptions {
  fromBlock?: bigint;
  toBlock?: bigint;
  limit?: number;
}

/**
 * Get transaction history for a SmartWallet address (PYUSD transfers only)
 * All PYUSD transfers happen from/to the SmartWallet address
 */
export async function getTransactionHistory(
  smartWalletAddress: string,
  options: TransactionHistoryOptions = {}
): Promise<Transaction[]> {
  const publicClient = createPublicClient({
    chain: arbitrumSepolia,
    transport: http('https://sepolia-rollup.arbitrum.io/rpc')
  });

  try {
    console.log('🔍 Fetching transaction history for SmartWallet:', smartWalletAddress);
    console.log('🔍 PYUSD contract address:', PYUSD_ADDRESS);
    console.log('🔍 From block:', options.fromBlock || 'earliest');
    console.log('🔍 To block:', options.toBlock || 'latest');
    
    // Get Transfer events from PYUSD contract where the SmartWallet is either sender or receiver
    // We need to make two separate calls since viem doesn't support OR conditions in args
    console.log('🔍 Querying for sent transfers...');
    const sentLogs = await publicClient.getLogs({
      address: PYUSD_ADDRESS as `0x${string}`,
      event: {
        type: 'event',
        name: 'Transfer',
        inputs: [
          { name: 'from', type: 'address', indexed: true },
          { name: 'to', type: 'address', indexed: true },
          { name: 'value', type: 'uint256', indexed: false }
        ]
      },
      args: {
        from: smartWalletAddress as `0x${string}`
      },
      fromBlock: options.fromBlock,
      toBlock: options.toBlock
    });
    console.log('📤 Sent logs found:', sentLogs.length);
    
    console.log('🔍 Querying for received transfers...');
    const receivedLogs = await publicClient.getLogs({
      address: PYUSD_ADDRESS as `0x${string}`,
      event: {
        type: 'event',
        name: 'Transfer',
        inputs: [
          { name: 'from', type: 'address', indexed: true },
          { name: 'to', type: 'address', indexed: true },
          { name: 'value', type: 'uint256', indexed: false }
        ]
      },
      args: {
        to: smartWalletAddress as `0x${string}`
      },
      fromBlock: options.fromBlock,
      toBlock: options.toBlock
    });
    console.log('📥 Received logs found:', receivedLogs.length);

    // Combine and deduplicate logs
    const allLogs = [...sentLogs, ...receivedLogs];
    const uniqueLogs = allLogs.filter((log, index, self) => 
      index === self.findIndex(l => l.transactionHash === log.transactionHash && l.logIndex === log.logIndex)
    );
    
    console.log('📊 Found logs - Sent:', sentLogs.length, 'Received:', receivedLogs.length, 'Total unique:', uniqueLogs.length);

    // If no logs found, let's check if there are any PYUSD transfers at all
    if (uniqueLogs.length === 0) {
      console.log('🔍 No transfers found. Checking if SmartWallet has any PYUSD balance...');
      try {
        // Check PYUSD balance of SmartWallet
        const balance = await publicClient.readContract({
          address: PYUSD_ADDRESS as `0x${string}`,
          abi: [{
            type: 'function',
            name: 'balanceOf',
            inputs: [{ type: 'address', name: 'account' }],
            outputs: [{ type: 'uint256' }]
          }],
          functionName: 'balanceOf',
          args: [smartWalletAddress as `0x${string}`]
        });
        console.log('💰 SmartWallet PYUSD balance:', balance.toString());
        
        // Test: Get ANY Transfer events from PYUSD contract to see if the contract is working
        console.log('🔍 Testing: Getting ANY Transfer events from PYUSD contract...');
        const anyLogs = await publicClient.getLogs({
          address: PYUSD_ADDRESS as `0x${string}`,
          event: {
            type: 'event',
            name: 'Transfer',
            inputs: [
              { name: 'from', type: 'address', indexed: true },
              { name: 'to', type: 'address', indexed: true },
              { name: 'value', type: 'uint256', indexed: false }
            ]
          },
          fromBlock: options.fromBlock,
          toBlock: options.toBlock
        });
        console.log('🔍 ANY Transfer events found:', anyLogs.length);
        if (anyLogs.length > 0) {
          console.log('🔍 Sample Transfer event:', anyLogs[0]);
          // Check if any of these events involve our SmartWallet
          const ourEvents = anyLogs.filter(log => {
            const args = log.args as any;
            return args.from?.toLowerCase() === smartWalletAddress.toLowerCase() || 
                   args.to?.toLowerCase() === smartWalletAddress.toLowerCase();
          });
          console.log('🔍 Events involving our SmartWallet:', ourEvents.length);
          if (ourEvents.length > 0) {
            console.log('🔍 Our SmartWallet event:', ourEvents[0]);
          }
        }
      } catch (error) {
        console.log('❌ Error checking PYUSD balance or testing transfers:', error);
      }
    }

    // Get block details for timestamps
    const transactions: Transaction[] = [];
    
    for (const log of uniqueLogs.slice(0, options.limit || 50)) {
      try {
        const block = await publicClient.getBlock({
          blockHash: log.blockHash
        });

        const args = log.args as any;
        const isSent = args.from.toLowerCase() === smartWalletAddress.toLowerCase();
        const isReceived = args.to.toLowerCase() === smartWalletAddress.toLowerCase();

        if (isSent || isReceived) {
          const amount = args.value.toString();
          const displayAmount = formatUnits(BigInt(amount), 6); // PYUSD has 6 decimals

          transactions.push({
            hash: log.transactionHash,
            from: args.from,
            to: args.to,
            amount,
            displayAmount,
            timestamp: Number(block.timestamp),
            blockNumber: log.blockNumber,
            type: isSent ? 'sent' : 'received'
          });
        }
      } catch (error) {
        console.error('Error processing transaction log:', error);
        // Continue with other transactions
      }
    }

    // Sort by timestamp (newest first)
    return transactions.sort((a, b) => b.timestamp - a.timestamp);

  } catch (error) {
    console.error('Error fetching transaction history:', error);
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
  const oneDayAgo = BigInt(Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000));
  
  return getTransactionHistory(smartWalletAddress, {
    fromBlock: oneDayAgo,
    limit
  });
}

/**
 * Get transaction by hash
 */
export async function getTransactionByHash(
  transactionHash: string
): Promise<Transaction | null> {
  const publicClient = createPublicClient({
    chain: arbitrumSepolia,
    transport: http('https://sepolia-rollup.arbitrum.io/rpc')
  });

  try {
    const receipt = await publicClient.getTransactionReceipt({
      hash: transactionHash as `0x${string}`
    });

    if (!receipt) return null;

    const block = await publicClient.getBlock({
      blockHash: receipt.blockHash
    });

    // Parse logs to find PYUSD Transfer event
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() === PYUSD_ADDRESS.toLowerCase()) {
        try {
          const decoded = publicClient.decodeEventLog({
            abi: PYUSD_ABI,
            data: log.data,
            topics: log.topics
          });

          if (decoded.eventName === 'Transfer') {
            const args = decoded.args as any;
            const amount = args.value.toString();
            const displayAmount = formatUnits(BigInt(amount), 6);

            return {
              hash: transactionHash,
              from: args.from,
              to: args.to,
              amount,
              displayAmount,
              timestamp: Number(block.timestamp),
              blockNumber: receipt.blockNumber,
              type: 'unknown' as 'sent' | 'received' // Can't determine without context
            };
          }
        } catch (error) {
          // Continue to next log
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching transaction:', error);
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
