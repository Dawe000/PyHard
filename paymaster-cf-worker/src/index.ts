// EIP-7702 Gas Sponsorship Worker

import { createPublicClient, createWalletClient, http, encodeFunctionData, keccak256, toHex } from 'viem';
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
  subWalletId?: number;
  recipientAddress?: string;
  amount?: string;
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

interface ManagementFunctionRequest {
  eoaAddress: string;
  smartWalletAddress: string;
  functionData: string;
  authorizationSignature: {
    chainId: string;
    address: string;
    nonce: string;
    r: string;
    s: string;
    yParity: number;
  };
  eoaNonce: number;
}

interface ManagementFunctionResponse {
  transactionHash: string;
  success: boolean;
  gasUsed?: string;
  error?: string;
}

interface CreateSubscriptionRequest {
  eoaAddress: string;
  smartWalletAddress: string;
  vendorAddress: string;
  amount: string; // PYUSD display units
  interval: string; // seconds as string
  authorizationSignature: {
    chainId: string;
    address: string;
    nonce: string;
    r: string;
    s: string;
    yParity: number;
  };
  eoaNonce: number;
}

interface CreateSubscriptionResponse {
  transactionHash: string;
  success: boolean;
  subscriptionId?: number;
  error?: string;
}

interface CancelSubscriptionRequest {
  eoaAddress: string;
  smartWalletAddress: string;
  subscriptionId: number;
  authorizationSignature: {
    chainId: string;
    address: string;
    nonce: string;
    r: string;
    s: string;
    yParity: number;
  };
  eoaNonce: number;
}

interface CancelSubscriptionResponse {
  transactionHash: string;
  success: boolean;
  error?: string;
}

interface ExecutePaymentRequest {
  vendorAddress: string;
  smartWalletAddress: string;
  subscriptionId: number;
}

interface ExecutePaymentResponse {
  transactionHash: string;
  success: boolean;
  amount?: string;
  error?: string;
}

interface SendChildTransactionRequest {
  childEOA: string;
  smartWalletAddress: string;
  subWalletId: number;
  recipientAddress: string;
  amount: string;
  childPrivateKey: string;
}

interface SendChildTransactionResponse {
  transactionHash: string;
  success: boolean;
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

      // Child transaction endpoint
      if (url.pathname === '/send-child-transaction' && request.method === 'POST') {
        const response = await handleSendChildTransaction(request, env);
        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Management functions endpoint
      if (url.pathname === '/management-function' && request.method === 'POST') {
        const response = await handleManagementFunction(request, env);
        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

  // Subscription endpoints
  if (url.pathname === '/create-subscription' && request.method === 'POST') {
    const response = await handleCreateSubscription(request, env);
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (url.pathname === '/cancel-subscription' && request.method === 'POST') {
    const response = await handleCancelSubscription(request, env);
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (url.pathname === '/execute-payment' && request.method === 'POST') {
    const response = await handleExecutePayment(request, env);
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (url.pathname.startsWith('/subscriptions/') && request.method === 'GET') {
    const smartWalletAddress = url.pathname.split('/')[2];
    const response = await handleGetSubscriptions(smartWalletAddress, env);
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
    
    // Prepare SmartWallet function call data
    let executeData: `0x${string}`;
    
    // Check if this is a child app request (has subWalletId) or main app request
    if (sponsorRequest.subWalletId && sponsorRequest.recipientAddress && sponsorRequest.amount) {
      // Child app: Use executeSubWalletTransaction()
      console.log('👶 Child app request - using executeSubWalletTransaction()');
      executeData = encodeFunctionData({
        abi: [{
          type: 'function',
          name: 'executeSubWalletTransaction',
          inputs: [
            { type: 'uint256', name: 'subWalletId' },
            { type: 'address', name: 'to' },
            { type: 'uint256', name: 'amount' }
          ]
        }],
        functionName: 'executeSubWalletTransaction',
        args: [
          BigInt(sponsorRequest.subWalletId), // Sub-wallet ID
          sponsorRequest.recipientAddress as `0x${string}`, // Recipient address
          BigInt(Math.floor(parseFloat(sponsorRequest.amount) * 1000000)) // Convert to PYUSD wei (6 decimals)
        ]
      });
    } else {
      // Check if this is a PYUSD transfer (has transfer function selector) or SmartWallet function
      const functionData = sponsorRequest.functionData as `0x${string}`;
      const transferSelector = '0xa9059cbb'; // transfer(address,uint256) function selector
      
      if (functionData.startsWith(transferSelector)) {
        // PYUSD transfer: Use execute() with PYUSD contract
        console.log('👤 Main app PYUSD transfer - using execute() with PYUSD contract');
        executeData = encodeFunctionData({
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
            functionData // PYUSD transfer data
          ]
        });
      } else {
        // SmartWallet management function: Call directly
        console.log('🔧 SmartWallet management function - calling directly');
        executeData = functionData;
      }
    }

    // Submit transaction TO USER'S EOA (not SmartWallet!) with EIP-7702 authorization
    console.log('🚀 Submitting transaction TO USER EOA with EIP-7702 authorization...');
    
    // Parse the signature JSON string (it might already be an object)
    const signature = typeof sponsorRequest.signature === 'string' 
      ? JSON.parse(sponsorRequest.signature) 
      : sponsorRequest.signature;
    
    // Format the authorization list properly for viem
    const authorizationList = [{
      chainId: Number(signature.chain_id),
      address: signature.contract as `0x${string}`,
      nonce: Number(signature.nonce),
      r: signature.r as `0x${string}`,
      s: signature.s as `0x${string}`,
      yParity: Number(signature.y_parity)
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
    console.log('🔍 Nonce:', signature.nonce);
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
        BigInt(signature.nonce), // Nonce
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
      chainId: Number(subAccountRequest.authorizationSignature.chainId),
      address: subAccountRequest.authorizationSignature.address as `0x${string}`,
      nonce: Number(subAccountRequest.authorizationSignature.nonce),
      r: subAccountRequest.authorizationSignature.r as `0x${string}`,
      s: subAccountRequest.authorizationSignature.s as `0x${string}`,
      yParity: Number(subAccountRequest.authorizationSignature.yParity)
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

/**
 * Handle child transaction requests
 * Uses EIP-7702 delegation to execute transactions from child's sub-wallet
 */
async function handleSendChildTransaction(
  request: Request,
  env: Env
): Promise<SendChildTransactionResponse> {
  try {
    const childTransactionRequest: SendChildTransactionRequest = await request.json();
    
    console.log('🚀 Processing child transaction:', {
      childEOA: childTransactionRequest.childEOA,
      smartWalletAddress: childTransactionRequest.smartWalletAddress,
      subWalletId: childTransactionRequest.subWalletId,
      recipientAddress: childTransactionRequest.recipientAddress,
      amount: childTransactionRequest.amount
    });

    // Create viem clients
    const publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http('https://sepolia-rollup.arbitrum.io/rpc')
    });

    const relayerAccount = privateKeyToAccount(env.PAYMASTER_PRIVATE_KEY as `0x${string}`);
    const walletClient = createWalletClient({
      account: relayerAccount,
      chain: arbitrumSepolia,
      transport: http('https://sepolia-rollup.arbitrum.io/rpc')
    });

    // Get current nonce for the child EOA
    const currentNonce = await publicClient.getTransactionCount({ 
      address: childTransactionRequest.childEOA as `0x${string}`, 
      blockTag: 'pending' 
    });

    // Step 1: Child signs EIP-7702 authorization
    // This would normally be done by the child app, but for now we'll simulate it
    // In a real implementation, the child app would sign this and send it to us
    const eip7702Authorization = {
      chainId: BigInt(421614), // Arbitrum Sepolia
      address: childTransactionRequest.childEOA as `0x${string}`,
      nonce: BigInt(currentNonce),
      r: '0x0000000000000000000000000000000000000000000000000000000000000000',
      s: '0x0000000000000000000000000000000000000000000000000000000000000000',
      yParity: 0
    };

    // Step 2: Send EIP-7702 authorization transaction
    const eip7702Hash = await walletClient.sendTransaction({
      to: childTransactionRequest.childEOA as `0x${string}`,
      data: `0x0000000000000000000000000000000000000000000000000000000000000000`, // EIP-7702 authorization
      value: 0n,
      nonce: currentNonce
    });

    console.log('✅ EIP-7702 authorization sent:', eip7702Hash);

    // Step 3: Prepare the sub-wallet transaction
    // This will call SmartWallet.executeSubWalletTransaction(subWalletId, recipient, amount)
    const executeSubWalletTransactionData = encodeFunctionData({
      abi: [{
        "inputs": [
          {"internalType": "uint256", "name": "subWalletId", "type": "uint256"},
          {"internalType": "address", "name": "to", "type": "address"},
          {"internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "executeSubWalletTransaction",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }],
      functionName: 'executeSubWalletTransaction',
      args: [
        BigInt(childTransactionRequest.subWalletId),
        childTransactionRequest.recipientAddress as `0x${string}`,
        BigInt(Math.floor(parseFloat(childTransactionRequest.amount) * 1000000)) // Convert PYUSD to wei (6 decimals)
      ]
    });

    // Step 4: Send the delegated transaction
    const transactionHash = await walletClient.sendTransaction({
      to: childTransactionRequest.childEOA as `0x${string}`, // TO CHILD'S EOA (now delegated)
      data: executeSubWalletTransactionData,
      value: 0n,
      nonce: currentNonce + 1
    });

    console.log('✅ Child transaction submitted:', transactionHash);

    return {
      success: true,
      transactionHash: transactionHash
    };

  } catch (error) {
    console.error('❌ Error processing child transaction:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      transactionHash: '',
      success: false,
      error: errorMessage
    };
  }
}

async function handleManagementFunction(request: Request, env: Env): Promise<ManagementFunctionResponse> {
  try {
    const managementRequest: ManagementFunctionRequest = await request.json();
    
    console.log(`🔧 Executing management function for: ${managementRequest.eoaAddress.slice(0, 6)}...${managementRequest.eoaAddress.slice(-4)}`);

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

    // 2. Step 1: EIP-7702 Authorization
    console.log('🚀 Step 1: Submitting EIP-7702 authorization...');
    
    const authorizationList = [{
      chainId: Number(managementRequest.authorizationSignature.chainId),
      address: managementRequest.authorizationSignature.address as `0x${string}`,
      nonce: Number(managementRequest.authorizationSignature.nonce),
      r: managementRequest.authorizationSignature.r as `0x${string}`,
      s: managementRequest.authorizationSignature.s as `0x${string}`,
      yParity: Number(managementRequest.authorizationSignature.yParity)
    }];

    const authHash = await walletClient.sendTransaction({
      to: managementRequest.eoaAddress as `0x${string}`,
      data: '0x',
      authorizationList: authorizationList,
      value: 0n
    });

    console.log('✅ EIP-7702 authorization submitted:', authHash);
    
    // Wait for authorization
    await publicClient.waitForTransactionReceipt({ hash: authHash });
    console.log('✅ EIP-7702 authorization confirmed');

    // 3. Step 2: Execute management function (wrap in EOADelegation.executeOnSmartWallet)
    console.log('🚀 Step 2: Executing management function...');
    
    // Create EOADelegation.executeOnSmartWallet call data (same pattern as sub-account creation)
    const executeOnSmartWalletData = encodeFunctionData({
      abi: [{
        "inputs": [
          {"name": "smartWallet", "type": "address"},
          {"name": "data", "type": "bytes"},
          {"name": "nonce", "type": "uint256"},
          {"name": "deadline", "type": "uint256"},
          {"name": "signature", "type": "bytes"}
        ],
        "name": "executeOnSmartWallet",
        "outputs": [{"name": "", "type": "bytes"}],
        "stateMutability": "nonpayable",
        "type": "function"
      }],
      functionName: "executeOnSmartWallet",
      args: [
        managementRequest.smartWalletAddress as `0x${string}`,
        managementRequest.functionData as `0x${string}`,
        BigInt(managementRequest.eoaNonce),
        BigInt(Math.floor(Date.now() / 1000 + 600)), // 10 minutes from now
        "0x" // Empty signature - paymaster is authorized
      ]
    });
    
    const hash = await walletClient.sendTransaction({
      to: managementRequest.eoaAddress as `0x${string}`, // TO EOA (now delegated)
      data: executeOnSmartWalletData,
      value: 0n
      // Don't specify nonce - let viem handle it automatically
    });

    console.log('✅ Management function executed:', hash);

    return {
      transactionHash: hash,
      success: true,
      gasUsed: '0'
    };

  } catch (error) {
    console.error('❌ Error processing management function:', error);
    return {
      transactionHash: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Subscription handlers
async function handleCreateSubscription(request: Request, env: Env): Promise<CreateSubscriptionResponse> {
  try {
    const subRequest: CreateSubscriptionRequest = await request.json();
    
    console.log(`📝 Creating subscription for: ${subRequest.eoaAddress.slice(0, 6)}...${subRequest.eoaAddress.slice(-4)} to vendor ${subRequest.vendorAddress.slice(0, 6)}...${subRequest.vendorAddress.slice(-4)}`);

    // Create clients
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

    // Step 1: EIP-7702 Authorization
    console.log('🚀 Step 1: Submitting EIP-7702 authorization...');
    
    const authorizationList = [{
      chainId: Number(subRequest.authorizationSignature.chainId),
      address: subRequest.authorizationSignature.address as `0x${string}`,
      nonce: Number(subRequest.authorizationSignature.nonce),
      r: subRequest.authorizationSignature.r as `0x${string}`,
      s: subRequest.authorizationSignature.s as `0x${string}`,
      yParity: Number(subRequest.authorizationSignature.yParity)
    }];

    const authHash = await walletClient.sendTransaction({
      to: subRequest.eoaAddress as `0x${string}`,
      data: '0x',
      authorizationList: authorizationList,
      value: 0n
    });

    console.log('✅ EIP-7702 authorization submitted:', authHash);
    
    // Wait for authorization
    await publicClient.waitForTransactionReceipt({ hash: authHash });
    console.log('✅ EIP-7702 authorization confirmed');

    // Step 2: Encode createSubscription() call
    console.log('🚀 Step 2: Creating subscription...');
    
    const amountWei = BigInt(Math.floor(parseFloat(subRequest.amount) * 1000000)); // Convert PYUSD to wei (6 decimals)
    const intervalSeconds = BigInt(subRequest.interval);
    
    const createSubData = encodeFunctionData({
      abi: [{
        type: 'function',
        name: 'createSubscription',
        inputs: [
          { type: 'address', name: 'vendor' },
          { type: 'uint256', name: 'amount' },
          { type: 'uint256', name: 'interval' }
        ],
        outputs: [{ type: 'uint256' }]
      }],
      functionName: 'createSubscription',
      args: [subRequest.vendorAddress as `0x${string}`, amountWei, intervalSeconds]
    });
    
    // Wrap in executeOnSmartWallet()
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
        ],
        outputs: [{ type: 'bytes' }]
      }],
      functionName: 'executeOnSmartWallet',
      args: [
        subRequest.smartWalletAddress as `0x${string}`,
        createSubData,
        BigInt(subRequest.eoaNonce),
        BigInt(Math.floor(Date.now() / 1000 + 600)), // 10 minutes from now
        '0x' // Empty signature - paymaster is authorized
      ]
    });
    
    // Submit transaction
    const hash = await walletClient.sendTransaction({
      to: subRequest.eoaAddress as `0x${string}`,
      data: executeData,
      value: 0n
    });

    console.log('✅ Subscription creation submitted:', hash);

    // Wait for receipt and parse subscription ID from logs
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    let subscriptionId = 0;
    
    // Parse SubscriptionCreated event
    const SUBSCRIPTION_CREATED_EVENT = keccak256(toHex('SubscriptionCreated(uint256,address,uint256,uint256)'));
    
    for (const log of receipt.logs) {
      if (log.topics[0] === SUBSCRIPTION_CREATED_EVENT) {
        subscriptionId = parseInt(log.topics[1], 16);
        break;
      }
    }
    
    console.log('✅ Subscription created with ID:', subscriptionId);

    return {
      transactionHash: hash,
      success: true,
      subscriptionId
    };

  } catch (error) {
    console.error('❌ Error creating subscription:', error);
    return {
      transactionHash: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function handleCancelSubscription(request: Request, env: Env): Promise<CancelSubscriptionResponse> {
  try {
    const cancelRequest: CancelSubscriptionRequest = await request.json();
    
    console.log(`📝 Cancelling subscription ${cancelRequest.subscriptionId} for: ${cancelRequest.eoaAddress.slice(0, 6)}...${cancelRequest.eoaAddress.slice(-4)}`);

    // Create clients
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

    // Step 1: EIP-7702 Authorization
    console.log('🚀 Step 1: Submitting EIP-7702 authorization...');
    
    const authorizationList = [{
      chainId: Number(cancelRequest.authorizationSignature.chainId),
      address: cancelRequest.authorizationSignature.address as `0x${string}`,
      nonce: Number(cancelRequest.authorizationSignature.nonce),
      r: cancelRequest.authorizationSignature.r as `0x${string}`,
      s: cancelRequest.authorizationSignature.s as `0x${string}`,
      yParity: Number(cancelRequest.authorizationSignature.yParity)
    }];

    const authHash = await walletClient.sendTransaction({
      to: cancelRequest.eoaAddress as `0x${string}`,
      data: '0x',
      authorizationList: authorizationList,
      value: 0n
    });

    console.log('✅ EIP-7702 authorization submitted:', authHash);
    
    // Wait for authorization
    await publicClient.waitForTransactionReceipt({ hash: authHash });
    console.log('✅ EIP-7702 authorization confirmed');

    // Step 2: Encode cancelSubscription() call
    console.log('🚀 Step 2: Cancelling subscription...');
    
    const cancelSubData = encodeFunctionData({
      abi: [{
        type: 'function',
        name: 'cancelSubscription',
        inputs: [{ type: 'uint256', name: 'subscriptionId' }],
        outputs: []
      }],
      functionName: 'cancelSubscription',
      args: [BigInt(cancelRequest.subscriptionId)]
    });
    
    // Wrap in executeOnSmartWallet()
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
        ],
        outputs: [{ type: 'bytes' }]
      }],
      functionName: 'executeOnSmartWallet',
      args: [
        cancelRequest.smartWalletAddress as `0x${string}`,
        cancelSubData,
        BigInt(cancelRequest.eoaNonce),
        BigInt(Math.floor(Date.now() / 1000 + 600)), // 10 minutes from now
        '0x' // Empty signature - paymaster is authorized
      ]
    });
    
    // Submit transaction
    const hash = await walletClient.sendTransaction({
      to: cancelRequest.eoaAddress as `0x${string}`,
      data: executeData,
      value: 0n
    });

    console.log('✅ Subscription cancellation submitted:', hash);

    return {
      transactionHash: hash,
      success: true
    };

  } catch (error) {
    console.error('❌ Error cancelling subscription:', error);
    return {
      transactionHash: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function handleGetSubscriptions(smartWalletAddress: string, env: Env): Promise<{ subscriptions: any[] }> {
  try {
    console.log(`📝 Fetching subscriptions for smart wallet: ${smartWalletAddress}`);

    const publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(env.RPC_URL)
    });

    // Query Blockscout for SubscriptionCreated events from this smart wallet
    const BLOCKSCOUT_API = "https://arbitrum-sepolia.blockscout.com/api";
    const SUBSCRIPTION_CREATED_EVENT = keccak256(toHex('SubscriptionCreated(uint256,address,uint256,uint256)'));
    
    const eventUrl = `${BLOCKSCOUT_API}?module=logs&action=getLogs&fromBlock=0&toBlock=latest&address=${smartWalletAddress}&topic0=${SUBSCRIPTION_CREATED_EVENT}`;
    
    const response = await fetch(eventUrl);
    const data = await response.json();

    if (data.status !== '1' || !data.result) {
      return { subscriptions: [] };
    }

    const subscriptions = [];
    
    for (const event of data.result) {
      const subscriptionId = parseInt(event.topics[1], 16);
      
      try {
        // Query smart wallet to get current subscription state
        const result = await publicClient.readContract({
          address: smartWalletAddress as `0x${string}`,
          abi: [{
            type: 'function',
            name: 'getSubscription',
            inputs: [{ type: 'uint256', name: 'subscriptionId' }],
            outputs: [
              { type: 'address', name: 'vendor' },
              { type: 'uint256', name: 'amountPerInterval' },
              { type: 'uint256', name: 'interval' },
              { type: 'uint256', name: 'lastPayment' },
              { type: 'bool', name: 'active' }
            ],
            stateMutability: 'view'
          }],
          functionName: 'getSubscription',
          args: [BigInt(subscriptionId)]
        }) as [string, bigint, bigint, bigint, boolean];

        // Only include active subscriptions
        if (result[4]) {
          subscriptions.push({
            subscriptionId,
            vendor: result[0],
            amountPerInterval: result[1].toString(),
            interval: result[2].toString(),
            lastPayment: result[3].toString(),
            active: result[4]
          });
        }
      } catch (error) {
        console.error(`Error querying subscription ${subscriptionId}:`, error);
        // Continue with other subscriptions
      }
    }

    return { subscriptions };

  } catch (error) {
    console.error('❌ Error fetching subscriptions:', error);
    return { subscriptions: [] };
  }
}
