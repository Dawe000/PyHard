// Subscription Service
// Handles gasless subscription creation and cancellation using EIP-7702 delegation

import { encodeFunctionData } from 'viem';
import { EOA_DELEGATION_ADDRESS, ARBITRUM_SEPOLIA_CHAIN_ID } from '@/constants/contracts';

const CF_WORKER_URL = "https://paymaster-cf-worker.dawid-pisarczyk.workers.dev";

export interface CreateSubscriptionResult {
  success: boolean;
  transactionHash?: string;
  subscriptionId?: number;
  error?: string;
}

/**
 * Create a subscription gaslessly using EIP-7702 delegation
 * Follows the exact flow from managementService.ts
 */
export async function createSubscriptionGasless(
  eoaAddress: string,
  smartWalletAddress: string,
  vendorAddress: string,
  amount: string, // PYUSD display units
  interval: string, // seconds
  generateAuthSignature: Function,
  walletId: string // Privy wallet ID for API calls
): Promise<CreateSubscriptionResult> {
  try {
    console.log(`📝 Creating subscription: vendor=${vendorAddress.slice(0, 6)}...${vendorAddress.slice(-4)}, amount=${amount}, interval=${interval}`);

    // Step 1: Get current EOA nonce using direct RPC call
    const rpcUrl = "https://sepolia-rollup.arbitrum.io/rpc";
    const nonceResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionCount',
        params: [eoaAddress, 'latest'],
        id: 1
      })
    });
    const nonceData = await nonceResponse.json();
    const currentNonce = parseInt(nonceData.result, 16);
    console.log(`📊 EOA nonce: ${currentNonce}`);

    // Step 2: Get EIP-7702 authorization using REST API approach
    console.log('🔐 Getting EIP-7702 authorization using REST API...');
    
    const CHAIN_ID = 421614; // Arbitrum Sepolia
    
    // Build the request payload for the Privy API
    const input = {
      version: 1 as const,
      url: `https://api.privy.io/v1/wallets/${walletId}/rpc`,
      method: 'POST' as const,
      headers: {
        'privy-app-id': 'cmgtb4vg702vqld0da5wktriq',
      },
      body: {
        method: 'eth_sign7702Authorization',
        params: {
          contract: EOA_DELEGATION_ADDRESS,
          chain_id: CHAIN_ID,
          nonce: currentNonce
        }
      }
    };

    console.log('🔍 Authorization request payload:', JSON.stringify(input, null, 2));

    // Generate Privy authorization signature
    console.log('🔐 Generating Privy authorization signature...');
    const authorizationSignatureResult = await generateAuthSignature(input);
    console.log('🔍 Authorization signature result:', authorizationSignatureResult);

    // Extract the signature string from the result object
    let authorizationSignature: string;
    if (typeof authorizationSignatureResult === 'string') {
      authorizationSignature = authorizationSignatureResult;
    } else if (typeof authorizationSignatureResult === 'object' && authorizationSignatureResult.signature) {
      authorizationSignature = authorizationSignatureResult.signature;
    } else {
      throw new Error(`Unexpected authorization signature format: ${JSON.stringify(authorizationSignatureResult)}`);
    }

    console.log("✅ Privy authorization signature extracted:", authorizationSignature);

    // Step 3: Get access token for the API call
    const { createPrivyClient } = await import('@privy-io/expo');
    const privy = createPrivyClient({
      appId: 'cmgtb4vg702vqld0da5wktriq',
      clientId: 'client-WY6RdMvmLZHLWnPB2aNZAEshGmBTwtGUAx299bCthg7U9'
    });
    const accessToken = await privy.getAccessToken();

    // Step 4: Call Privy API to get EIP-7702 authorization
    console.log("🌐 Calling Privy API to get EIP-7702 authorization...");
    const response = await fetch(input.url, {
      method: input.method,
      headers: {
        ...input.headers,
        'Authorization': `Bearer ${accessToken}`,
        'privy-authorization-signature': authorizationSignature,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input.body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Privy API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    const eip7702Authorization = result.data.authorization;
    console.log('✅ EIP-7702 authorization received:', JSON.stringify(eip7702Authorization, null, 2));

    // Step 5: Encode createSubscription() function call
    const amountWei = Math.floor(parseFloat(amount) * 1000000); // Convert to PYUSD wei (6 decimals)
    
    const createSubscriptionData = encodeFunctionData({
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
      args: [
        vendorAddress as `0x${string}`,
        BigInt(amountWei),
        BigInt(interval)
      ]
    });

    console.log('📝 Encoded createSubscription data:', createSubscriptionData);

    // Step 6: Send to Cloudflare Worker
    const requestBody = {
      eoaAddress,
      smartWalletAddress,
      vendorAddress,
      amount,
      interval,
      authorizationSignature: {
        chainId: eip7702Authorization.chain_id.toString(),
        address: eip7702Authorization.contract,
        nonce: eip7702Authorization.nonce.toString(),
        r: eip7702Authorization.r,
        s: eip7702Authorization.s,
        yParity: eip7702Authorization.y_parity
      },
      eoaNonce: currentNonce
    };

    console.log('📤 Calling CF Worker /create-subscription...');
    const cfResponse = await fetch(`${CF_WORKER_URL}/create-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!cfResponse.ok) {
      const errorText = await cfResponse.text();
      console.error('❌ CF Worker error:', errorText);
      throw new Error(`CF Worker returned ${cfResponse.status}: ${cfResponse.statusText}`);
    }

    const data = await cfResponse.json();
    console.log('📥 CF Worker response:', data);

    if (data.error) {
      throw new Error(data.error);
    }

    return {
      success: true,
      transactionHash: data.transactionHash,
      subscriptionId: data.subscriptionId
    };

  } catch (error) {
    console.error('❌ Error creating subscription:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Cancel a subscription gaslessly using EIP-7702 delegation
 */
export async function cancelSubscriptionGasless(
  eoaAddress: string,
  smartWalletAddress: string,
  subscriptionId: number,
  generateAuthSignature: Function,
  walletId: string
): Promise<CreateSubscriptionResult> {
  try {
    console.log(`🗑️ Cancelling subscription ID: ${subscriptionId}`);

    // Same flow as create, but with cancelSubscription function
    const rpcUrl = "https://sepolia-rollup.arbitrum.io/rpc";
    const nonceResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionCount',
        params: [eoaAddress, 'latest'],
        id: 1
      })
    });
    const nonceData = await nonceResponse.json();
    const currentNonce = parseInt(nonceData.result, 16);

    const input = {
      version: 1 as const,
      url: `https://api.privy.io/v1/wallets/${walletId}/rpc`,
      method: 'POST' as const,
      headers: {
        'privy-app-id': 'cmgtb4vg702vqld0da5wktriq',
      },
      body: {
        method: 'eth_sign7702Authorization',
        params: {
          contract: EOA_DELEGATION_ADDRESS,
          chain_id: 421614,
          nonce: currentNonce
        }
      }
    };

    const authorizationSignatureResult = await generateAuthSignature(input);
    let authorizationSignature: string;
    if (typeof authorizationSignatureResult === 'string') {
      authorizationSignature = authorizationSignatureResult;
    } else if (typeof authorizationSignatureResult === 'object' && authorizationSignatureResult.signature) {
      authorizationSignature = authorizationSignatureResult.signature;
    } else {
      throw new Error(`Unexpected authorization signature format`);
    }

    const { createPrivyClient } = await import('@privy-io/expo');
    const privy = createPrivyClient({
      appId: 'cmgtb4vg702vqld0da5wktriq',
      clientId: 'client-WY6RdMvmLZHLWnPB2aNZAEshGmBTwtGUAx299bCthg7U9'
    });
    const accessToken = await privy.getAccessToken();

    const response = await fetch(input.url, {
      method: input.method,
      headers: {
        ...input.headers,
        'Authorization': `Bearer ${accessToken}`,
        'privy-authorization-signature': authorizationSignature,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input.body)
    });

    const result = await response.json();
    const eip7702Authorization = result.data.authorization;

    const requestBody = {
      eoaAddress,
      smartWalletAddress,
      subscriptionId,
      authorizationSignature: {
        chainId: eip7702Authorization.chain_id.toString(),
        address: eip7702Authorization.contract,
        nonce: eip7702Authorization.nonce.toString(),
        r: eip7702Authorization.r,
        s: eip7702Authorization.s,
        yParity: eip7702Authorization.y_parity
      },
      eoaNonce: currentNonce
    };

    const cfResponse = await fetch(`${CF_WORKER_URL}/cancel-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await cfResponse.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return {
      success: true,
      transactionHash: data.transactionHash
    };

  } catch (error) {
    console.error('❌ Error cancelling subscription:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

