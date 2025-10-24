// Blockscout Service - Real-time blockchain data fetching
// Using Blockscout API for Arbitrum Sepolia

const BLOCKSCOUT_API_BASE = "https://arbitrum-sepolia.blockscout.com/api";
const PYUSD_CONTRACT_ADDRESS = "0x637A1259C6afd7E3AdF63993cA7E58BB438aB1B1";

export interface BlockscoutTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  blockNumber: string;
  isError: string;
  gasUsed: string;
  gasPrice: string;
  confirmations: string;
  methodId: string;
  functionName?: string;
}

export interface BlockscoutTokenTransfer {
  hash: string;
  from: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  timeStamp: string;
  blockNumber: string;
  confirmations: string;
  contractAddress: string;
}

export interface BlockscoutBalance {
  account: string;
  balance: string; // in wei
}

/**
 * Get ETH balance for an address
 */
export async function getETHBalance(address: string): Promise<string> {
  try {
    console.log('📊 Blockscout: Fetching ETH balance for', address);

    const url = `${BLOCKSCOUT_API_BASE}?module=account&action=balance&address=${address}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Blockscout API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== '1') {
      throw new Error(data.message || 'Failed to fetch balance');
    }

    // Convert wei to ETH
    const balanceInEth = (parseInt(data.result) / 1e18).toFixed(4);
    console.log('✅ Blockscout: ETH balance:', balanceInEth);

    return balanceInEth;
  } catch (error) {
    console.error('❌ Blockscout: Error fetching ETH balance:', error);
    return '0.0000';
  }
}

/**
 * Get token balance for an address
 */
export async function getTokenBalance(
  address: string,
  contractAddress: string = PYUSD_CONTRACT_ADDRESS
): Promise<string> {
  try {
    console.log('📊 Blockscout: Fetching token balance for', address);

    const url = `${BLOCKSCOUT_API_BASE}?module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${address}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Blockscout API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== '1') {
      throw new Error(data.message || 'Failed to fetch token balance');
    }

    // PYUSD has 6 decimals
    const balanceInPYUSD = (parseInt(data.result) / 1e6).toFixed(2);
    console.log('✅ Blockscout: PYUSD balance:', balanceInPYUSD);

    return balanceInPYUSD;
  } catch (error) {
    console.error('❌ Blockscout: Error fetching token balance:', error);
    return '0.00';
  }
}

/**
 * Get transaction history for an address
 */
export async function getTransactions(
  address: string,
  page: number = 1,
  offset: number = 10,
  sort: 'asc' | 'desc' = 'desc'
): Promise<BlockscoutTransaction[]> {
  try {
    console.log('📜 Blockscout: Fetching transactions for', address);

    const url = `${BLOCKSCOUT_API_BASE}?module=account&action=txlist&address=${address}&page=${page}&offset=${offset}&sort=${sort}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Blockscout API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== '1') {
      console.log('⚠️ Blockscout: No transactions found or error:', data.message);
      return [];
    }

    console.log('✅ Blockscout: Found', data.result.length, 'transactions');
    return data.result;
  } catch (error) {
    console.error('❌ Blockscout: Error fetching transactions:', error);
    return [];
  }
}

/**
 * Get token transfers (ERC-20) for an address
 */
export async function getTokenTransfers(
  address: string,
  contractAddress?: string,
  page: number = 1,
  offset: number = 20,
  sort: 'asc' | 'desc' = 'desc'
): Promise<BlockscoutTokenTransfer[]> {
  try {
    console.log('🪙 Blockscout: Fetching token transfers for', address);

    let url = `${BLOCKSCOUT_API_BASE}?module=account&action=tokentx&address=${address}&page=${page}&offset=${offset}&sort=${sort}`;

    // Filter by specific token contract if provided
    if (contractAddress) {
      url += `&contractaddress=${contractAddress}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Blockscout API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== '1') {
      console.log('⚠️ Blockscout: No token transfers found or error:', data.message);
      return [];
    }

    console.log('✅ Blockscout: Found', data.result.length, 'token transfers');
    return data.result;
  } catch (error) {
    console.error('❌ Blockscout: Error fetching token transfers:', error);
    return [];
  }
}

/**
 * Get PYUSD transfers specifically
 */
export async function getPYUSDTransfers(
  address: string,
  page: number = 1,
  offset: number = 20
): Promise<BlockscoutTokenTransfer[]> {
  return getTokenTransfers(address, PYUSD_CONTRACT_ADDRESS, page, offset);
}

/**
 * Get PYUSD transfers using v2 API (better for smart contracts)
 */
export async function getPYUSDTransfersV2(
  address: string
): Promise<any[]> {
  try {
    console.log('🪙 Blockscout v2: Fetching PYUSD transfers for', address);

    const url = `https://arbitrum-sepolia.blockscout.com/api/v2/addresses/${address}/token-transfers?type=ERC-20&token=${PYUSD_CONTRACT_ADDRESS}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Blockscout API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.log('⚠️ Blockscout v2: No PYUSD transfers found');
      return [];
    }

    console.log('✅ Blockscout v2: Found', data.items.length, 'PYUSD transfers');
    return data.items;
  } catch (error) {
    console.error('❌ Blockscout v2: Error fetching PYUSD transfers:', error);
    return [];
  }
}

/**
 * Get internal transactions (contract calls)
 */
export async function getInternalTransactions(
  address: string,
  page: number = 1,
  offset: number = 10,
  sort: 'asc' | 'desc' = 'desc'
): Promise<BlockscoutTransaction[]> {
  try {
    console.log('🔍 Blockscout: Fetching internal transactions for', address);

    const url = `${BLOCKSCOUT_API_BASE}?module=account&action=txlistinternal&address=${address}&page=${page}&offset=${offset}&sort=${sort}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Blockscout API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== '1') {
      console.log('⚠️ Blockscout: No internal transactions found or error:', data.message);
      return [];
    }

    console.log('✅ Blockscout: Found', data.result.length, 'internal transactions');
    return data.result;
  } catch (error) {
    console.error('❌ Blockscout: Error fetching internal transactions:', error);
    return [];
  }
}

/**
 * Get transaction details by hash
 */
export async function getTransactionByHash(txHash: string): Promise<BlockscoutTransaction | null> {
  try {
    console.log('🔎 Blockscout: Fetching transaction', txHash);

    const url = `${BLOCKSCOUT_API_BASE}?module=transaction&action=gettxinfo&txhash=${txHash}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Blockscout API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== '1') {
      throw new Error(data.message || 'Transaction not found');
    }

    console.log('✅ Blockscout: Transaction found');
    return data.result;
  } catch (error) {
    console.error('❌ Blockscout: Error fetching transaction:', error);
    return null;
  }
}

/**
 * Get transaction receipt status
 */
export async function getTransactionStatus(txHash: string): Promise<'success' | 'failed' | 'pending'> {
  try {
    console.log('📊 Blockscout: Checking transaction status', txHash);

    const url = `${BLOCKSCOUT_API_BASE}?module=transaction&action=gettxreceiptstatus&txhash=${txHash}`;
    const response = await fetch(url);

    if (!response.ok) {
      return 'pending';
    }

    const data = await response.json();

    if (data.status !== '1') {
      return 'pending';
    }

    const status = data.result.status === '1' ? 'success' : 'failed';
    console.log('✅ Blockscout: Transaction status:', status);

    return status;
  } catch (error) {
    console.error('❌ Blockscout: Error checking transaction status:', error);
    return 'pending';
  }
}

/**
 * Format timestamp to readable date
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(parseInt(timestamp) * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

/**
 * Format address for display
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Get Blockscout explorer URL for transaction
 */
export function getTransactionURL(txHash: string): string {
  return `https://arbitrum-sepolia.blockscout.com/tx/${txHash}`;
}

/**
 * Get Blockscout explorer URL for address
 */
export function getAddressURL(address: string): string {
  return `https://arbitrum-sepolia.blockscout.com/address/${address}`;
}

/**
 * Poll for new transactions (for real-time updates)
 */
export async function pollForNewTransactions(
  address: string,
  lastKnownBlockNumber: string,
  callback: (transactions: BlockscoutTransaction[]) => void
): Promise<void> {
  try {
    const transactions = await getTransactions(address, 1, 10);

    const newTransactions = transactions.filter(
      tx => parseInt(tx.blockNumber) > parseInt(lastKnownBlockNumber)
    );

    if (newTransactions.length > 0) {
      console.log('🔔 Blockscout: Found', newTransactions.length, 'new transactions');
      callback(newTransactions);
    }
  } catch (error) {
    console.error('❌ Blockscout: Error polling for transactions:', error);
  }
}
