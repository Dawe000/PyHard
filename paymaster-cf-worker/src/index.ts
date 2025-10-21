// EIP-7702 Gas Sponsorship Worker

import { createPublicClient, createWalletClient, http, encodeFunctionData } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrumSepolia } from 'viem/chains';

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
  eip7702Authorization: any; // The signed authorization from client
}

interface SponsorResponse {
  transactionHash: string;
  success: boolean;
  gasUsed?: string;
  error?: string;
}

interface CreateSmartWalletRequest {
  eoaAddress: string;
  privyToken: string;
}

interface CreateSmartWalletResponse {
  smartWalletAddress: string;
  isNew: boolean;
  transactionHash?: string;
  error?: string;
}


interface Env {
  PAYMASTER_KV: KVNamespace;
  PAYMASTER_PRIVATE_KEY: string;
  EOA_DELEGATION_ADDRESS: string;
  EIP7702_PAYMASTER_ADDRESS: string;
  SMART_WALLET_FACTORY_ADDRESS: string;
  PYUSD_ADDRESS: string;
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

      // SmartWallet creation endpoint
      if (url.pathname === '/create-smart-wallet' && request.method === 'POST') {
        const response = await handleCreateSmartWallet(request, env);
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
  
  console.log('📥 Processing sponsor request for:', sponsorRequest.eoaAddress);
  console.log('📥 Full sponsor request:', JSON.stringify(sponsorRequest, null, 2));

  try {
    // 1. Basic validation
    if (!sponsorRequest.eoaAddress || !sponsorRequest.smartWalletAddress || !sponsorRequest.functionData) {
      return { transactionHash: '', success: false, error: 'Missing required fields' };
    }

    // 2. Authorization validation
    if (!sponsorRequest.eip7702Authorization) {
      return { transactionHash: '', success: false, error: 'Missing EIP-7702 authorization' };
    }

    // 3. Check deadline
    const currentTime = Math.floor(Date.now() / 1000);
    if (parseInt(sponsorRequest.deadline) < currentTime) {
      return { transactionHash: '', success: false, error: 'Request expired' };
    }

    // 4. Use client-provided EIP-7702 authorization
    const eip7702Authorization = sponsorRequest.eip7702Authorization;
    console.log('✅ Using client-provided EIP-7702 authorization:', JSON.stringify(eip7702Authorization, null, 2));

    // 5. Create clients
    const publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(env.RPC_URL)
    });

    const relayerAccount = privateKeyToAccount(env.PAYMASTER_PRIVATE_KEY as `0x${string}`);
    const walletClient = createWalletClient({
      account: relayerAccount,
      chain: arbitrumSepolia,
      transport: http(env.RPC_URL)
    });

    // 6. Check if EOA is whitelisted (simplified - skip for demo)
    console.log('🔍 Skipping whitelist check for demo');

    // 7. Handle EIP-7702 transaction
    let hash: string;
    
    // Use the correct EIP-7702 flow: call EOADelegation.executeOnSmartWallet
    console.log('🚀 Using EOADelegation.executeOnSmartWallet...');
    
    // The data should be the encoded SmartWallet.execute() call
    const smartWalletExecuteData = encodeFunctionData({
      abi: [{
        type: 'function',
        name: 'execute',
        inputs: [
          { type: 'address', name: 'target' },
          { type: 'uint256', name: 'value' },
          { type: 'bytes', name: 'data' }
        ]
      }],
      functionName: 'execute',
      args: [
        env.PYUSD_ADDRESS as `0x${string}`, // PYUSD contract
        0n, // No ETH value
        sponsorRequest.functionData as `0x${string}` // PYUSD transfer data
      ]
    });
    
    // CF Worker as Paymaster: Sponsor gas for EIP-7702 transaction
    console.log('📝 EIP-7702 authorization object:', JSON.stringify(eip7702Authorization, null, 2));
    
    // For EIP-7702, we need to use the authorization to delegate the EOA to the smart contract
    // The EIP-7702 authorization allows the EOA to execute as the smart contract
    
    console.log('📝 Using EIP-7702 authorization for transaction...');
    console.log('📝 EIP-7702 authorization details:', {
      contract: eip7702Authorization.contract,
      chainId: eip7702Authorization.chain_id,
      nonce: eip7702Authorization.nonce,
      r: eip7702Authorization.r,
      s: eip7702Authorization.s,
      yParity: eip7702Authorization.y_parity
    });
    
    // Send transaction with EIP-7702 authorization
    // The EIP-7702 authorization allows the EOA to execute as the smart contract
    hash = await walletClient.sendTransaction({
      to: sponsorRequest.smartWalletAddress as `0x${string}`,
      data: smartWalletExecuteData,
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

async function handleCreateSmartWallet(request: Request, env: Env): Promise<CreateSmartWalletResponse> {
  try {
    const { eoaAddress, privyToken }: CreateSmartWalletRequest = await request.json();
    
    console.log('📥 Processing SmartWallet creation request:', { eoaAddress });

    // 1. Validate input
    if (!eoaAddress || !privyToken) {
      return { 
        smartWalletAddress: '', 
        isNew: false, 
        error: 'Missing required fields: eoaAddress or privyToken' 
      };
    }

    // 2. Verify Privy token (simplified for now - will add full verification)
    // TODO: Add proper Privy JWT verification using @privy-io/server-auth
    console.log('🔐 PrivyAvailable token verification (simplified)');

    // 3. Create clients
    const publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(env.RPC_URL)
    });

    console.log('🔍 Private key from env:', env.PAYMASTER_PRIVATE_KEY);
    console.log('🔍 Private key type:', typeof env.PAYMASTER_PRIVATE_KEY);
    console.log('🔍 Private key length:', env.PAYMASTER_PRIVATE_KEY?.length);

    const relayerAccount = privateKeyToAccount(env.PAYMASTER_PRIVATE_KEY as `0x${string}`);
    const walletClient = createWalletClient({
      account: relayerAccount,
      chain: arbitrumSepolia,
      transport: http(env.RPC_URL)
    });

    // 4. Check if SmartWallet already exists
    const getWalletData = encodeFunctionData({
      abi: [{
        type: 'function',
        name: 'getWallet',
        inputs: [{ type: 'address', name: 'owner' }],
        outputs: [{ type: 'address' }],
        stateMutability: 'view'
      }],
      functionName: 'getWallet',
      args: [eoaAddress as `0x${string}`]
    });

    const existingWallet = await publicClient.call({
      to: env.SMART_WALLET_FACTORY_ADDRESS as `0x${string}`,
      data: getWalletData
    });

    console.log('🔍 Existing wallet check result:', existingWallet);
    console.log('🔍 existingWallet.data type:', typeof existingWallet.data);
    console.log('🔍 existingWallet.data value:', existingWallet.data);

    // If wallet exists (not zero address), return it
    if (existingWallet.data && 
        typeof existingWallet.data === 'string' && 
        existingWallet.data !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
      const walletAddress = `0x${existingWallet.data.slice(-40)}`;
      console.log('✅ SmartWallet already exists:', walletAddress);
      return {
        smartWalletAddress: walletAddress,
        isNew: false
      };
    }

    // 5. Create new SmartWallet
    console.log('🏗️ Creating new SmartWallet for:', eoaAddress);
    
    const createWalletData = encodeFunctionData({
      abi: [{
        type: 'function',
        name: 'createWallet',
        inputs: [{ type: 'address', name: 'owner' }],
        outputs: [{ type: 'address', name: 'wallet' }]
      }],
      functionName: 'createWallet',
      args: [eoaAddress as `0x${string}`]
    });

    const hash = await walletClient.sendTransaction({
      to: env.SMART_WALLET_FACTORY_ADDRESS as `0x${string}`,
      data: createWalletData,
      value: 0n
    });

    console.log('✅ SmartWallet creation transaction submitted:', hash);

    // Wait for transaction and get the wallet address from logs
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    console.log('🔍 Transaction receipt:', receipt);
    
    // Parse the WalletCreated event to get the new wallet address
    // Event: WalletCreated(address indexed owner, address indexed wallet)
    let newWalletAddress = '';
    if (receipt.logs && receipt.logs.length > 0) {
      console.log('🔍 Parsing logs for WalletCreated event...');
      // The wallet address is the second indexed parameter (topic[2])
      const walletCreatedLog = receipt.logs.find(log => 
        log.topics.length >= 3 && 
        log.address.toLowerCase() === env.SMART_WALLET_FACTORY_ADDRESS.toLowerCase()
      );
      
      console.log('🔍 Found wallet created log:', walletCreatedLog);
      
      if (walletCreatedLog && walletCreatedLog.topics && walletCreatedLog.topics[2]) {
        newWalletAddress = `0x${walletCreatedLog.topics[2].slice(-40)}`;
        console.log('✅ Extracted wallet address from log:', newWalletAddress);
      } else {
        console.log('⚠️ Could not extract wallet address from logs');
      }
    } else {
      console.log('⚠️ No logs found in transaction receipt');
    }

    console.log('✅ SmartWallet created:', newWalletAddress);

    return {
      smartWalletAddress: newWalletAddress,
      isNew: true,
      transactionHash: hash
    };

  } catch (error) {
    console.error('❌ Error creating SmartWallet:', error);
    return {
      smartWalletAddress: '',
      isNew: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
