// EIP-7702 Gas Sponsorship Worker

import { createPublicClient, createWalletClient, http, encodeFunctionData } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { hardhat } from 'viem/chains';

// Types
interface SponsorRequest {
  eoaAddress: string;
  smartWalletAddress: string;
  functionData: string;
  value: string;
  nonce: string;
  deadline: string;
  signature: string;
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
  PAYMASTER_PRIVATE_KEY: string;
  EOA_DELEGATION_ADDRESS: string;
  EIP7702_PAYMASTER_ADDRESS: string;
  SMART_WALLET_FACTORY_ADDRESS: string;
  RPC_URL: string;
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
  
  console.log('📥 Processing sponsor request:', {
    eoaAddress: sponsorRequest.eoaAddress,
    smartWalletAddress: sponsorRequest.smartWalletAddress,
    nonce: sponsorRequest.nonce,
    chainId: sponsorRequest.chainId
  });

  try {
    // 1. Basic validation
    if (!sponsorRequest.eoaAddress || !sponsorRequest.smartWalletAddress || !sponsorRequest.functionData) {
      return { transactionHash: '', success: false, error: 'Missing required fields' };
    }

    // 2. Check deadline
    const currentTime = Math.floor(Date.now() / 1000);
    if (parseInt(sponsorRequest.deadline) < currentTime) {
      return { ERR: 'Request expired' };
    }

    // 3. Create clients
    const publicClient = createPublicClient({
      chain: hardhat,
      transport: http(env.RPC_URL)
    });

    const relayerAccount = privateKeyToAccount(env.PAYMASTER_PRIVATE_KEY as `0x${string}`);
    const walletClient = createWalletClient({
      account: relayerAccount,
      chain: hardhat,
      transport: http(env.RPC_URL)
    });

    // 4. Check if EOA is whitelisted (simplified - skip for demo)
    console.log('🔍 Skipping whitelist check for demo');

    // 5. Encode call to EOADelegation.executeOnSmartWallet
    const executeData = encodeFunctionData({
      abi: [{
        type: 'function',
        name: 'executeOnSmartWallet',
        inputs: [
          { type: 'address', name: 'smartWallet' },
          { type: 'bytes', name: 'data' },
          { type: 'uint256', name: 'nonce' },
          { type: 'uint256', name: 'deadline' },
          { type: 'bytes', name: 'signature' }
        ]
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

    // 6. Submit transaction
    console.log('🚀 Submitting transaction to EOADelegation...');
    const hash = await walletClient.sendTransaction({
      to: env.EOA_DELEGATION_ADDRESS as `0x${string}`,
      data: executeData,
      value: 0n
    });

    console.log('✅ Transaction submitted:', hash);

    return {
      transactionHash: hash,
      success: true,
      gasUsed: '0'
    };

  } catch (error) {
    console.error('❌ Error in sponsor transaction:', error);
    return { 
      transactionHash: '', 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}