// EIP-7702 Gas Sponsorship Worker

import { createPublicClient, createWalletClient, http, encodeFunctionData } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrumSepolia } from 'viem/chains';
import { PrivyClient, AuthorizationContext } from '@privy-io/node';

// Polyfill Buffer for Cloudflare Workers
if (typeof Buffer === 'undefined') {
  (globalThis as any).Buffer = class Buffer {
    static from(data: any, encoding?: any) {
      if (typeof data === 'string') {
        const encoder = new TextEncoder();
        return encoder.encode(data);
      }
      return new Uint8Array(data);
    }
    static isBuffer(obj: any) {
      return obj instanceof Uint8Array;
    }
    static alloc(size: number) {
      return new Uint8Array(size);
    }
    static allocUnsafe(size: number) {
      return new Uint8Array(size);
    }
    static concat(list: Uint8Array[], length?: number) {
      const totalLength = length || list.reduce((acc, item) => acc + item.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const item of list) {
        result.set(item, offset);
        offset += item.length;
      }
      return result;
    }
  };
}

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
  identityToken: string; // Identity token for user verification
  accessToken: string; // Access token for authorization context
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
  identityToken: string,
  accessToken: string,
  eoaAddress: string,
  contractAddress: string,
  chainId: number,
  nonce: number,
  env: Env
): Promise<any> {
  console.log('🔐 Signing EIP-7702 authorization...');

  try {
    console.log('🔍 Creating PrivyClient with appId:', env.PRIVY_APP_ID);
    console.log('🔍 App secret length:', env.PRIVY_APP_SECRET?.length);
    console.log('🔍 App secret preview:', env.PRIVY_APP_SECRET?.substring(0, 10) + '...');
    console.log('🔍 App secret full value:', env.PRIVY_APP_SECRET);
    
      const privyClient = new PrivyClient({
        appId: env.PRIVY_APP_ID,
        appSecret: env.PRIVY_APP_SECRET
      });
    
    console.log('✅ PrivyClient created successfully');


    // Parse identity token to get wallet ID from linked_accounts
    let userWallet: any = null;
    
    try {
      const tokenParts = identityToken.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        
        if (payload.linked_accounts) {
          const linkedAccounts = JSON.parse(payload.linked_accounts);
          
          // Find the wallet that matches the EOA address
          const matchingAccount = linkedAccounts.find((account: any) => 
            account.address && account.address.toLowerCase() === eoaAddress.toLowerCase()
          );
          
          if (matchingAccount && matchingAccount.id) {
            userWallet = { id: matchingAccount.id, address: matchingAccount.address };
          }
        }
      }
    } catch (e) {
      console.log('⚠️ Could not parse linked_accounts from identity token');
    }

    if (!userWallet) {
      throw new Error(`No wallet found for EOA address: ${eoaAddress}`);
    }

    console.log('🔍 Wallet ID:', userWallet.id);
    console.log('🔍 Contract address:', contractAddress);
    console.log('🔍 Chain ID:', chainId);
    console.log('🔍 Nonce:', nonce);
    console.log('🔍 Access token preview:', accessToken.substring(0, 50) + '...');
    
    const authorizationContext: AuthorizationContext = {
      user_jwts: [accessToken]
    };
    
    console.log('🔍 Authorization context:', authorizationContext);
    
    const response = await privyClient
      .wallets()
      .ethereum()
      .sign7702Authorization(userWallet.id, {
        params: {
          contract: contractAddress,
          chain_id: chainId,
          nonce: nonce
        },
        authorization_context: authorizationContext
      });

    console.log('✅ EIP-7702 authorization signed successfully');
    return response.authorization;
  } catch (error: any) {
    console.error('❌ EIP-7702 authorization signing failed:', error.message);
    throw error;
  }
}

async function handleSponsorTransaction(request: Request, env: Env): Promise<SponsorResponse> {
  const sponsorRequest: SponsorRequest = await request.json();
  
  console.log('📥 Processing sponsor request for:', sponsorRequest.eoaAddress);

  try {
    // 1. Basic validation
    if (!sponsorRequest.eoaAddress || !sponsorRequest.smartWalletAddress || !sponsorRequest.functionData) {
      return { transactionHash: '', success: false, error: 'Missing required fields' };
    }

    // 2. Token validation
    if (!sponsorRequest.identityToken || !sponsorRequest.accessToken) {
      return { transactionHash: '', success: false, error: 'Missing identity token or access token' };
    }

    // 3. Check deadline
    const currentTime = Math.floor(Date.now() / 1000);
    if (parseInt(sponsorRequest.deadline) < currentTime) {
      return { transactionHash: '', success: false, error: 'Request expired' };
    }

    // 4. Sign EIP-7702 authorization server-side using Privy Node SDK
    console.log('🔐 Signing EIP-7702 authorization server-side using Privy Node SDK...');
    let eip7702Authorization: any = null;
    
    try {
      eip7702Authorization = await signEIP7702Authorization(
        sponsorRequest.identityToken,
        sponsorRequest.accessToken,
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
