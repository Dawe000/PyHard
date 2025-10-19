// EIP-7702 Gas Sponsorship Worker

import { createPublicClient, createWalletClient, http, encodeFunctionData } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrumSepolia } from 'viem/chains';
import { PrivyClient, AuthorizationContext } from '@privy-io/node';

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
  userJWT: string; // User JWT for authorization context
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
  PRIVY_APP_ID: string;
  PRIVY_CLIENT_ID: string;
  PRIVY_APP_SECRET: string;
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

// EIP-7702 Authorization Signing Function using Privy Node SDK
async function signEIP7702Authorization(
  userJWT: string,
  eoaAddress: string,
  contractAddress: string,
  chainId: number,
  nonce: number,
  env: Env
): Promise<any> {
  console.log('🔐 Signing EIP-7702 authorization using Privy Node SDK...');
  console.log('🔐 User JWT length:', userJWT?.length);
  console.log('🔐 User JWT preview:', userJWT?.substring(0, 50) + '...');
  console.log('🔐 User JWT full token:', userJWT);
  console.log('🔐 EOA Address:', eoaAddress);
  console.log('🔐 Contract Address:', contractAddress);
  console.log('🔐 Chain ID:', chainId);
  console.log('🔐 Nonce:', nonce);

  try {
    // Create Privy client
    const privyClient = new PrivyClient({
      appId: env.PRIVY_APP_ID,
      appSecret: env.PRIVY_APP_SECRET
    });

    // Create authorization context with user JWT
    const authorizationContext: AuthorizationContext = {
      user_jwts: [userJWT]
    };

    console.log('🔐 Authorization context created with user JWT');

    // Get user's wallets to find the wallet ID
    const userWallets = await privyClient.wallets().list({
      authorization_context: authorizationContext
    });

    console.log('🔐 User wallets found:', userWallets.length);

    // Find the wallet that matches the EOA address
    const userWallet = userWallets.find((wallet: any) => 
      wallet.address.toLowerCase() === eoaAddress.toLowerCase()
    );

    if (!userWallet) {
      throw new Error(`No wallet found for EOA address: ${eoaAddress}`);
    }

    console.log('🔐 Found user wallet:', userWallet.id);

    // Sign EIP-7702 authorization using Privy Node SDK
    const response = await privyClient
      .wallets()
      .ethereum()
      .sign7702Authorization(userWallet.id, {
        contract: contractAddress,
        chain_id: chainId,
        nonce: nonce
      }, {
        authorization_context: authorizationContext
      });

    console.log('✅ EIP-7702 authorization signed successfully:', response);

    return response.authorization;
  } catch (error) {
    console.error('❌ EIP-7702 authorization signing failed:', error);
    throw error;
  }
}

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
      return { transactionHash: '', success: false, error: 'Request expired' };
    }

    // 3. Sign EIP-7702 authorization server-side using Privy Node SDK
    console.log('🔐 Signing EIP-7702 authorization server-side using Privy Node SDK...');
    let eip7702Authorization: any = null;
    
    try {
      eip7702Authorization = await signEIP7702Authorization(
        sponsorRequest.userJWT,
        sponsorRequest.eoaAddress,
        env.EOA_DELEGATION_ADDRESS,
        parseInt(sponsorRequest.chainId),
        0, // TODO: Get actual nonce
        env
      );
      console.log('✅ EIP-7702 authorization signed successfully:', eip7702Authorization);
    } catch (signError: any) {
      console.error('❌ EIP-7702 authorization signing failed:', signError);
      return { 
        transactionHash: '', 
        success: false, 
        error: `EIP-7702 signing failed: ${signError.message}` 
      };
    }

    // 4. Create clients
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

    // 4. Check if EOA is whitelisted (simplified - skip for demo)
    console.log('🔍 Skipping whitelist check for demo');

    // 5. Handle EIP-7702 transaction
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
    
    // Call EOADelegation.executeOnSmartWallet
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
        smartWalletExecuteData, // The SmartWallet.execute call
        BigInt(sponsorRequest.nonce),
        BigInt(sponsorRequest.deadline),
        sponsorRequest.signature as `0x${string}`
      ]
    });
    
    console.log('📝 Using signature from authorization:', sponsorRequest.signature);
    console.log('📝 Authorization object:', sponsorRequest.authorization);

    hash = await walletClient.sendTransaction({
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
