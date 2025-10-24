import { ParentWalletInfo } from './subWalletDetection';
import { loadChildWallet } from '../utils/crypto';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrumSepolia } from 'viem/chains';

const PAYMASTER_URL = 'https://paymaster-cf-worker.dawid-pisarczyk.workers.dev';

export interface SendTransactionRequest {
  recipientAddress: string;
  amount: string; // Amount in PYUSD (as string to avoid precision issues)
  childEOA: string;
  smartWalletAddress: string;
  subWalletId: number;
}

export interface SendTransactionResponse {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

// Sponsor request format (same as main app)
interface SponsorRequest {
  eoaAddress: string;
  smartWalletAddress: string;
  functionData: string;
  value: string;
  nonce: string;
  deadline: string;
  signature: string;
  chainId: string;
  eip7702Authorization: any;
}

interface SponsorResponse {
  transactionHash: string;
  success: boolean;
  gasUsed?: string;
  error?: string;
}

/**
 * Send a transaction from the child's sub-wallet using EIP-7702 delegation
 */
export async function sendTransaction(
  request: SendTransactionRequest
): Promise<SendTransactionResponse> {
  try {
    console.log('🚀 Sending transaction from child sub-wallet:', {
      childEOA: request.childEOA,
      smartWalletAddress: request.smartWalletAddress,
      subWalletId: request.subWalletId,
      recipientAddress: request.recipientAddress,
      amount: request.amount
    });

    // Load child wallet to get private key
    const childWallet = await loadChildWallet();
    if (!childWallet) {
      throw new Error('Child wallet not found');
    }

    // Create viem clients
    const publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http('https://sepolia-rollup.arbitrum.io/rpc')
    });

    const walletClient = createWalletClient({
      account: privateKeyToAccount(childWallet.privateKey as `0x${string}`),
      chain: arbitrumSepolia,
      transport: http('https://sepolia-rollup.arbitrum.io/rpc')
    });

    // Get current nonce for the child EOA
    const currentNonce = await publicClient.getTransactionCount({ 
      address: request.childEOA as `0x${string}`, 
      blockTag: 'pending' 
    });

    console.log('📊 Current nonce:', currentNonce);

    // Convert amount to wei (PYUSD has 6 decimals)
    const amountInWei = BigInt(Math.floor(parseFloat(request.amount) * 1000000));

    // Create PYUSD transfer function call data
    // PYUSD transfer function signature: transfer(address to, uint256 amount)
    const transferData = `0xa9059cbb${request.recipientAddress.slice(2).padStart(64, '0')}${amountInWei.toString(16).padStart(64, '0')}`;
    console.log('📝 PYUSD transfer data:', transferData);

    // Create real EIP-7702 authorization using viem (same as tests)
    console.log('🔐 Creating real EIP-7702 authorization...');
    console.log('🔍 Using nonce:', currentNonce, 'for authorization');
    
    // Use the same pattern as the tests - signAuthorization method
    const authorization = await walletClient.signAuthorization({
      contractAddress: '0x0977081db8717cb860716edcd117ef1fbf108857' as `0x${string}`, // EOADelegation address
      chainId: 421614,
      nonce: currentNonce // Use the actual current nonce, not 0
    });
    
    console.log('✅ EIP-7702 authorization signed:', authorization);

    // Create authorization wrapper in the same format as main app
    const authorizationWrapper = {
      data: {
        authorization: {
          address: authorization.address,
          chainId: authorization.chainId.toString(),
          nonce: authorization.nonce.toString(),
          r: authorization.r,
          s: authorization.s,
          v: authorization.v.toString(),
          yParity: authorization.yParity
        }
      }
    };

    // Create sponsor request with real authorization (same format as main app)
    const sponsorRequest: SponsorRequest = {
      eoaAddress: request.childEOA,
      smartWalletAddress: request.smartWalletAddress,
      functionData: transferData, // Keep for compatibility
      value: "0",
      nonce: "0", // Not needed for EIP-7702 (same as main app)
      deadline: Math.floor(Date.now() / 1000 + 600).toString(), // 10 minutes from now
      signature: JSON.stringify({
        chain_id: authorization.chainId.toString(),
        contract: authorization.address,
        nonce: authorization.nonce.toString(), // Use actual nonce from authorization
        r: authorization.r,
        s: authorization.s,
        y_parity: authorization.yParity
      }), // EIP-7702 authorization signature (paymaster format)
      chainId: "421614", // Arbitrum Sepolia
      eip7702Authorization: authorizationWrapper, // Include full authorization object (same as main app)
      subWalletId: request.subWalletId, // Add sub-wallet ID
      recipientAddress: request.recipientAddress, // Add recipient address
      amount: request.amount // Add amount
    };

    console.log('📤 Sponsor request:', JSON.stringify(sponsorRequest, null, 2));

    console.log('🌐 Making HTTP request to sponsor-transaction endpoint...');
    const response = await fetch(`${PAYMASTER_URL}/sponsor-transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sponsorRequest),
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response status text:', response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Paymaster error:', errorText);
      throw new Error(`Paymaster error: ${response.status} - ${errorText}`);
    }

    const result: SponsorResponse = await response.json();
    console.log('✅ Transaction result:', result);

    return {
      success: result.success,
      transactionHash: result.transactionHash,
      error: result.error
    };

  } catch (error) {
    console.error('❌ Error sending transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Validate if a transaction can be sent (check balance, limits, etc.)
 */
export function validateTransaction(
  walletInfo: ParentWalletInfo | null,
  recipientAddress: string,
  amount: string
): { valid: boolean; error?: string } {
  if (!walletInfo) {
    return { valid: false, error: 'Wallet information not available' };
  }

  if (!recipientAddress.trim()) {
    return { valid: false, error: 'Recipient address is required' };
  }

  if (!recipientAddress.startsWith('0x') || recipientAddress.length !== 42) {
    return { valid: false, error: 'Invalid recipient address format' };
  }

  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    return { valid: false, error: 'Invalid amount' };
  }

  // Check if wallet is active
  if (!walletInfo.subWalletInfo.active) {
    return { valid: false, error: 'Sub-wallet is not active' };
  }

  // Check remaining balance
  const remainingBalance = Number(walletInfo.subWalletInfo.spendingLimit - walletInfo.subWalletInfo.spentThisPeriod) / 1e6;
  if (amountNum > remainingBalance) {
    return { valid: false, error: `Amount exceeds remaining balance of ${remainingBalance.toFixed(2)} PYUSD` };
  }

  return { valid: true };
}
