// EIP-7702 Gas Sponsorship Worker
import { createPublicClient, createWalletClient, http, encodeFunctionData, keccak256, recoverAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { hardhat } from 'viem/chains';

// Types
interface SponsorRequest {
  eoaAddress: string; // The EOA making the call
  smartWalletAddress: string; // The SmartWallet to call
  functionData: string; // Encoded function call (e.g., createSubWallet)
  value: string; // ETH value (usually 0)
  nonce: string; // EOA's nonce for replay protection
  deadline: string; // Expiration timestamp
  signature: string; // EOA's signature
  chainId: string;
}

interface SponsorResponse {
  transactionHash: string;
  success: boolean;
  gasUsed?: string;
  error?: string;
}

interface Env {
  PAYMASTER_KV: KVNamespace;
  PAYMASTER_PRIVATE_KEY: string; // Relayer wallet private key for gas sponsorship
  EOA_DELEGATION_ADDRESS: string; // EOADelegation contract address
  EIP7702_PAYMASTER_ADDRESS: string; // EIP7702Paymaster contract address
  SMART_WALLET_FACTORY_ADDRESS: string;
  RPC_URL: string; // RPC endpoint (e.g., http://127.0.0.1:8545)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      // EIP-7702 sponsorship endpoint
      if (url.pathname === '/sponsor-transaction' && request.method === 'POST') {
        const response = await handleSponsorTransaction(request, env);
        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Health check
      if (url.pathname === '/health' && request.method === 'GET') {
        return new Response(JSON.stringify({ 
          status: 'healthy', 
          timestamp: Date.now(),
          type: 'EIP-7702 Gas Sponsorship Worker'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal Server Error', 
        message: (error as Error).message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

async function handleSponsorTransaction(request: Request, env: Env): Promise<SponsorResponse> {
  const sponsorRequest: SponsorRequest = await request.json();
  
  console.log('📥 Received sponsor request:', {
    eoaAddress: sponsorRequest.eoaAddress,
    smartWalletAddress: sponsorRequest.smartWalletAddress,
    nonce: sponsorRequest.nonce,
    deadline: sponsorRequest.deadline
  });

  try {
    // Step 1: Validate request
    validateRequest(sponsorRequest);
    
    // Step 2: Verify EOA signature
    await verifyEOASignature(sponsorRequest);
    
    // Step 3: Check if EOA is whitelisted in paymaster
    // TODO: Implement on-chain check when needed
    // await checkWhitelist(sponsorRequest.eoaAddress, env);
    
    // Step 4: Create clients
    const publicClient = createPublicClient({
      chain: hardhat,
      transport: http(env.RPC_URL || 'http://127.0.0.1:8545')
    });

    const relayerAccount = privateKeyToAccount(env.PAYMASTER_PRIVATE_KEY as `0x${string}`);
    const walletClient = createWalletClient({
      account: relayerAccount,
      chain: hardhat,
      transport: http(env.RPC_URL || 'http://127.0.0.1:8545')
    });

    console.log('🔑 Relayer address:', relayerAccount.address);
    
    // Step 5: Encode call to EOADelegation.executeOnSmartWallet()
    const executeData = encodeFunctionData({
      abi: [{
        type: 'function',
        name: 'executeOnSmartWallet',
        inputs: [
          { name: 'smartWallet', type: 'address' },
          { name: 'data', type: 'bytes' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
          { name: 'signature', type: 'bytes' }
        ],
        outputs: [{ name: '', type: 'bytes' }],
        stateMutability: 'nonpayable'
      }],
      functionName: 'executeOnSmartWallet',
      args: [
        sponsorRequest.smartWalletAddress as `0x${string}`,
        sponsorRequest.functionData as `0x${string}`,
        BigInt(sponsorRequest.nonce),
        BigInt(sponsorRequest.deadline),
        sponsorRequest.signature as `0x${string}`
      ]
    });

    console.log('📦 Encoded executeOnSmartWallet call');
    
    // Step 6: Estimate gas
    const gasEstimate = await publicClient.estimateGas({
      account: relayerAccount.address,
      to: env.EOA_DELEGATION_ADDRESS as `0x${string}`,
      data: executeData,
      value: BigInt(sponsorRequest.value || '0')
    });

    console.log('⛽ Gas estimate:', gasEstimate.toString());
    
    // Step 7: Submit transaction with gas sponsorship
    const txHash = await walletClient.sendTransaction({
      to: env.EOA_DELEGATION_ADDRESS as `0x${string}`,
      data: executeData,
      value: BigInt(sponsorRequest.value || '0'),
      gas: gasEstimate
    });

    console.log('✅ Transaction submitted:', txHash);
    
    // Step 8: Wait for transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    
    console.log('✅ Transaction confirmed:', {
      hash: txHash,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status
    });

    return {
      transactionHash: txHash,
      success: receipt.status === 'success',
      gasUsed: receipt.gasUsed.toString()
    };

  } catch (error) {
    console.error('❌ Error sponsoring transaction:', error);
    return {
      transactionHash: '',
      success: false,
      error: (error as Error).message
    };
  }
}

function validateRequest(request: SponsorRequest): void {
  if (!request.eoaAddress || !request.smartWalletAddress || !request.functionData) {
    throw new Error('Invalid request: missing required fields');
  }

  if (!request.nonce || !request.deadline || !request.signature) {
    throw new Error('Invalid request: missing signature fields');
  }

  // Check deadline hasn't passed
  const now = Math.floor(Date.now() / 1000);
  const deadline = parseInt(request.deadline);
  if (deadline < now) {
    throw new Error('Deadline has passed');
  }

  console.log('✅ Request validation passed');
}

async function verifyEOASignature(request: SponsorRequest): Promise<void> {
  // Recreate the message hash that was signed
  const messageHash = keccak256(
    encodeFunctionData({
      abi: [{ 
        type: 'function', 
        name: 'encode', 
        inputs: [
          { type: 'address', name: 'smartWallet' },
          { type: 'bytes', name: 'data' },
          { type: 'uint256', name: 'nonce' },
          { type: 'uint256', name: 'deadline' },
          { type: 'uint256', name: 'chainId' }
        ] 
      }],
      functionName: 'encode',
      args: [
        request.smartWalletAddress as `0x${string}`,
        request.functionData as `0x${string}`,
        BigInt(request.nonce),
        BigInt(request.deadline),
        BigInt(request.chainId)
      ]
    })
  );

  // Add Ethereum signed message prefix
  const ethSignedMessageHash = keccak256(
    `0x${Buffer.from('\x19Ethereum Signed Message:\n32').toString('hex')}${messageHash.slice(2)}`
  );

  // Recover signer from signature
  const recoveredAddress = await recoverAddress({
    hash: ethSignedMessageHash,
    signature: request.signature as `0x${string}`
  });

  if (recoveredAddress.toLowerCase() !== request.eoaAddress.toLowerCase()) {
    throw new Error(`Invalid signature: expected ${request.eoaAddress}, got ${recoveredAddress}`);
  }

  console.log('✅ Signature verification passed');
}
