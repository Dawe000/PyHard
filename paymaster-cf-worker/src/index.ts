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

interface CreateSubAccountRequest {
  parentEOA: string;
  smartWalletAddress: string;
  childEOA: string;
  monthlyLimit: string;
  authorizationSignature: {
    chainId: string;
    address: string;
    nonce: string;
    r: string;
    s: string;
    yParity: number;
  };
  eoaNonce: number;
  createSubWalletData: string;
  executeOnSmartWalletData: string;
}

interface CreateSubAccountResponse {
  success: boolean;
  transactionHash?: string;
  subWalletId?: number;
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

      // Sub-account creation endpoint
      if (url.pathname === '/create-subaccount' && request.method === 'POST') {
        const response = await handleCreateSubAccount(request, env);
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
  
  console.log(`💸 Sponsoring transaction for: ${sponsorRequest.eoaAddress.slice(0, 6)}...${sponsorRequest.eoaAddress.slice(-4)}`);

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

    // 5. Create clients
    const publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(env.RPC_URL)
    });

    const relayerAccount = privateKeyToAccount(env.PAYMASTER_PRIVATE_KEY as `0x${string}`);
    console.log('🔍 Paymaster account address:', relayerAccount.address);
    console.log('🔍 Private key (first 10 chars):', env.PAYMASTER_PRIVATE_KEY.substring(0, 10) + '...');
    
    const walletClient = createWalletClient({
      account: relayerAccount,
      chain: arbitrumSepolia,
      transport: http(env.RPC_URL)
    });

    // 6. Check if EOA is whitelisted (simplified - skip for demo)
    console.log('🔍 Skipping whitelist check for demo');

    // 7. Handle EIP-7702 transaction - submit TO USER'S EOA with authorization
    console.log('🚀 Using CORRECT EIP-7702 flow: submit to user EOA with authorization...');
    
    // Prepare SmartWallet.execute() call data
    const executeData = encodeFunctionData({
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

    // Submit transaction TO USER'S EOA (not SmartWallet!) with EIP-7702 authorization
    console.log('🚀 Submitting transaction TO USER EOA with EIP-7702 authorization...');
    
    // Format the authorization list properly for viem
    const authorizationList = [{
      chainId: BigInt(sponsorRequest.signature.chain_id),
      address: sponsorRequest.signature.contract as `0x${string}`,
      nonce: BigInt(sponsorRequest.signature.nonce),
      r: sponsorRequest.signature.r as `0x${string}`,
      s: sponsorRequest.signature.s as `0x${string}`,
      yParity: sponsorRequest.signature.y_parity
    }];
    
    console.log('📝 Transaction details:', {
      to: sponsorRequest.eoaAddress, // TO USER'S EOA!
      data: executeData, // SmartWallet.execute() call
      authorizationList: authorizationList.map(auth => ({
        chainId: auth.chainId.toString(),
        address: auth.address,
        nonce: auth.nonce.toString(),
        r: auth.r,
        s: auth.s,
        yParity: auth.yParity
      })) // EIP-7702 delegation (converted for logging)
    });
    
    // Debug: Check if the authorization signature is valid
    console.log('🔍 Authorization signature validation:');
    console.log('🔍 - Contract address:', authorizationList[0].address);
    console.log('🔍 - Chain ID:', authorizationList[0].chainId.toString());
    console.log('🔍 - Nonce:', authorizationList[0].nonce.toString());
    console.log('🔍 - R:', authorizationList[0].r);
    console.log('🔍 - S:', authorizationList[0].s);
    console.log('🔍 - Y Parity:', authorizationList[0].yParity);
    
    // Debug: Check EOA nonce to see if it matches authorization
    try {
      const eoaNonce = await publicClient.getTransactionCount({
        address: sponsorRequest.eoaAddress as `0x${string}`
      });
      console.log('🔍 EOA nonce:', eoaNonce);
      console.log('🔍 Authorization nonce:', authorizationList[0].nonce.toString());
      console.log('🔍 Nonce matches:', eoaNonce === Number(authorizationList[0].nonce));
      
      // Check if EOA has any transaction history
      const eoaNoncePending = await publicClient.getTransactionCount({
        address: sponsorRequest.eoaAddress as `0x${string}`,
        blockTag: 'pending'
      });
      console.log('🔍 EOA pending nonce:', eoaNoncePending);
      
      // The issue might be that we need to use the EOA's current nonce, not 0
      if (eoaNonce > 0) {
        console.log('⚠️ EOA has transaction history - authorization nonce 0 might be invalid');
        console.log('💡 Suggestion: Use current EOA nonce for authorization');
      }
    } catch (error) {
      console.log('❌ Error checking EOA nonce:', error);
    }

    // EIP-7702 flow: First submit EIP-7702 authorization, then call EOADelegation
    console.log('🚀 Step 1: Submitting EIP-7702 authorization to delegate EOA to EOADelegation...');
    
    // First transaction: Submit EIP-7702 authorization to delegate EOA to EOADelegation
    const authHash = await walletClient.sendTransaction({
      to: sponsorRequest.eoaAddress as `0x${string}`, // TO EOA
      data: '0x', // Empty data for EIP-7702 authorization
      authorizationList: authorizationList, // EIP-7702 authorization (delegates EOA to EOADelegation)
      value: 0n
    });
    
    console.log('✅ EIP-7702 authorization submitted:', authHash);
    
    // Wait for authorization to be mined
    console.log('⏳ Waiting for EIP-7702 authorization to be mined...');
    await publicClient.waitForTransactionReceipt({ hash: authHash });
    console.log('✅ EIP-7702 authorization confirmed');
    
    // Second transaction: Call EOADelegation.executeOnSmartWallet
    console.log('🚀 Step 2: Calling EOADelegation.executeOnSmartWallet...');
    console.log('🔍 Paymaster address:', relayerAccount.address);
    console.log('🔍 SmartWallet address:', sponsorRequest.smartWalletAddress);
    console.log('🔍 Execute data length:', executeData.length);
    console.log('🔍 Nonce:', sponsorRequest.signature.nonce);
    console.log('🔍 Deadline:', sponsorRequest.deadline);
    
    // Check if paymaster is authorized in the contract
    try {
      const isAuthorized = await publicClient.readContract({
        address: env.EOA_DELEGATION_ADDRESS as `0x${string}`,
        abi: [{
          type: 'function',
          name: 'authorizedPaymasters',
          inputs: [{ type: 'address', name: 'paymaster' }],
          outputs: [{ type: 'bool' }]
        }],
        functionName: 'authorizedPaymasters',
        args: [relayerAccount.address]
      });
      console.log('🔍 Paymaster authorized in contract:', isAuthorized);
    } catch (error) {
      console.log('❌ Error checking paymaster authorization:', error);
    }
    
    const delegationData = encodeFunctionData({
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
        sponsorRequest.smartWalletAddress as `0x${string}`, // SmartWallet
        executeData as `0x${string}`, // SmartWallet.execute() call data
        BigInt(sponsorRequest.signature.nonce), // Nonce
        BigInt(sponsorRequest.deadline), // Deadline
        '0x' // Empty signature - paymaster is authorized
      ]
    });
    
    // Get current nonce to avoid nonce conflicts
    const currentNonce = await publicClient.getTransactionCount({
      address: relayerAccount.address,
      blockTag: 'pending'
    });
    console.log('🔍 Current paymaster nonce for sponsor transaction:', currentNonce);

    const hash = await walletClient.sendTransaction({
      to: sponsorRequest.eoaAddress as `0x${string}`, // TO EOA (now delegated to EOADelegation)!
      data: delegationData, // EOADelegation.executeOnSmartWallet() call data
      value: 0n,
      nonce: currentNonce
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
    
    console.log(`🏗️ Creating SmartWallet for: ${eoaAddress.slice(0, 6)}...${eoaAddress.slice(-4)}`);

    // 1. Validate input
    if (!eoaAddress || !privyToken) {
      return { 
        smartWalletAddress: '', 
        isNew: false, 
        error: 'Missing required fields: eoaAddress or privyToken' 
      };
    }

    // 2. Create clients
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

    // 3. Check if SmartWallet already exists
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

    // If wallet exists (not zero address), return it
    if (existingWallet.data && 
        typeof existingWallet.data === 'string' && 
        existingWallet.data !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
      const walletAddress = `0x${existingWallet.data.slice(-40)}`;
      console.log(`✅ Existing SmartWallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`);
      return {
        smartWalletAddress: walletAddress,
        isNew: false
      };
    }

    // 4. Create new SmartWallet
    console.log('🏗️ Creating new SmartWallet...');
    
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

    // Get current nonce to avoid nonce conflicts
    const currentNonce = await publicClient.getTransactionCount({
      address: relayerAccount.address,
      blockTag: 'pending'
    });

    const hash = await walletClient.sendTransaction({
      to: env.SMART_WALLET_FACTORY_ADDRESS as `0x${string}`,
      data: createWalletData,
      value: 0n,
      nonce: currentNonce
    });

    console.log(`📤 Transaction: ${hash.slice(0, 10)}...`);

    // Wait for transaction and get the wallet address from logs
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    // Parse the WalletCreated event to get the new wallet address
    let newWalletAddress = '';
    if (receipt.logs && receipt.logs.length > 0) {
      const walletCreatedLog = receipt.logs.find(log => 
        log.topics.length >= 3 && 
        log.address.toLowerCase() === env.SMART_WALLET_FACTORY_ADDRESS.toLowerCase()
      );
      
      if (walletCreatedLog && walletCreatedLog.topics && walletCreatedLog.topics[2]) {
        newWalletAddress = `0x${walletCreatedLog.topics[2].slice(-40)}`;
        console.log(`✅ New SmartWallet: ${newWalletAddress.slice(0, 6)}...${newWalletAddress.slice(-4)}`);
      }
    }

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

async function handleCreateSubAccount(request: Request, env: Env): Promise<CreateSubAccountResponse> {
  try {
    const subAccountRequest: CreateSubAccountRequest = await request.json();
    
    console.log(`🏗️ Creating sub-account for: ${subAccountRequest.childEOA.slice(0, 6)}...${subAccountRequest.childEOA.slice(-4)}`);

    // 1. Create clients
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

    // 2. Step 1: EIP-7702 Authorization (lines 73-84 from test)
    console.log('🚀 Step 1: Submitting EIP-7702 authorization...');
    
    const authorizationList = [{
      chainId: BigInt(subAccountRequest.authorizationSignature.chainId),
      address: subAccountRequest.authorizationSignature.address as `0x${string}`,
      nonce: BigInt(subAccountRequest.authorizationSignature.nonce),
      r: subAccountRequest.authorizationSignature.r as `0x${string}`,
      s: subAccountRequest.authorizationSignature.s as `0x${string}`,
      yParity: subAccountRequest.authorizationSignature.yParity
    }];

    const authHash = await walletClient.sendTransaction({
      to: subAccountRequest.parentEOA as `0x${string}`,
      data: '0x',
      authorizationList: authorizationList,
      value: 0n
    });

    console.log('✅ EIP-7702 authorization submitted:', authHash);
    
    // Wait for authorization
    await publicClient.waitForTransactionReceipt({ hash: authHash });
    console.log('✅ EIP-7702 authorization confirmed');

    // 3. Step 2: Execute sub-wallet creation (lines 145-149 from test)
    console.log('🚀 Step 2: Creating sub-wallet...');
    
    const hash = await walletClient.sendTransaction({
      to: subAccountRequest.parentEOA as `0x${string}`, // TO PARENT'S EOA (now delegated)
      data: subAccountRequest.executeOnSmartWalletData as `0x${string}`,
      value: 0n
    });

    console.log('✅ Sub-wallet creation submitted:', hash);

    // Wait for transaction and parse subWalletId from logs
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    let subWalletId = 0;
    if (receipt.logs && receipt.logs.length > 0) {
      // Look for SubWalletCreated event
      const subWalletCreatedLog = receipt.logs.find(log => 
        log.topics.length >= 3 && 
        log.address.toLowerCase() === subAccountRequest.smartWalletAddress.toLowerCase()
      );
      
      if (subWalletCreatedLog && subWalletCreatedLog.topics && subWalletCreatedLog.topics[1]) {
        // subWalletId is the first indexed parameter (topic[1])
        subWalletId = parseInt(subWalletCreatedLog.topics[1], 16);
        console.log(`✅ Sub-wallet created with ID: ${subWalletId}`);
      }
    }

    return {
      success: true,
      transactionHash: hash,
      subWalletId: subWalletId
    };

  } catch (error) {
    console.error('❌ Error creating sub-account:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
