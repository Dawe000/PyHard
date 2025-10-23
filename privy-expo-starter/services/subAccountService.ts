// Sub-Account Service
// Handles gasless sub-account creation using EIP-7702 delegation

import { encodeFunctionData } from 'viem';
import { EOA_DELEGATION_ADDRESS, ARBITRUM_SEPOLIA_CHAIN_ID } from '@/constants/contracts';

const CF_WORKER_URL = "https://paymaster-cf-worker.dawid-pisarczyk.workers.dev";

export interface CreateSubAccountResult {
  success: boolean;
  transactionHash?: string;
  subWalletId?: number;
  error?: string;
}

/**
 * Create a sub-account gaslessly using EIP-7702 delegation
 * Follows the exact flow from EIP7702SubWalletCreation.test.ts
 */
export async function createSubAccountGasless(
  parentEOA: string,
  smartWalletAddress: string,
  childEOA: string,
  monthlyLimit: string, // in PYUSD display units
  generateAuthSignature: Function,
  walletId: string // Privy wallet ID for API calls
): Promise<CreateSubAccountResult> {
  try {
    console.log(`🏗️ Creating sub-account for: ${childEOA.slice(0, 6)}...${childEOA.slice(-4)}`);

    // Step 1: Get current EOA nonce using direct RPC call
    const rpcUrl = "https://sepolia-rollup.arbitrum.io/rpc";
    const nonceResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionCount',
        params: [parentEOA, 'latest'],
        id: 1
      })
    });
    const nonceData = await nonceResponse.json();
    const currentNonce = parseInt(nonceData.result, 16);
    console.log(`📊 EOA nonce: ${currentNonce}`);

    // Step 2: Get EIP-7702 authorization using REST API approach (same as transfer code)
    console.log('🔐 Getting EIP-7702 authorization using REST API...');
    
    const CHAIN_ID = 421614; // Arbitrum Sepolia
    
    // Build the request payload for the Privy API (same pattern as transfer code)
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

    // Extract the signature string from the result object (same as transfer code)
    let authorizationSignature: string;
    if (typeof authorizationSignatureResult === 'string') {
      authorizationSignature = authorizationSignatureResult;
    } else if (typeof authorizationSignatureResult === 'object' && authorizationSignatureResult.signature) {
      authorizationSignature = authorizationSignatureResult.signature;
    } else {
      throw new Error(`Unexpected authorization signature format: ${JSON.stringify(authorizationSignatureResult)}`);
    }

    console.log("✅ Privy authorization signature extracted:", authorizationSignature);

    // Step 3: Get access token for the API call (same as transfer code)
    const { createPrivyClient } = await import('@privy-io/expo');
    const privy = createPrivyClient({
      appId: 'cmgtb4vg702vqld0da5wktriq',
      clientId: 'client-WY6RdMvmLZHLWnPB2aNZAEshGmBTwtGUAx299bCthg7U9'
    });
    const accessToken = await privy.getAccessToken();

    // Step 4: Call Privy API to get EIP-7702 authorization (same as transfer code)
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
    console.log("✅ EIP-7702 authorization received:", JSON.stringify(eip7702Authorization, null, 2));
    
    // Wrap the authorization in the expected structure for CF Worker (same as transfer code)
    const authorization = {
      data: {
        authorization: eip7702Authorization
      }
    };

    // Step 3: Encode createSubWallet data
    const limitInUnits = Math.floor(parseFloat(monthlyLimit) * 1000000); // Convert to PYUSD units (6 decimals)
    const periodInSeconds = 30 * 24 * 60 * 60; // 30 days

    const createSubWalletData = encodeFunctionData({
      abi: [{
        "inputs": [
          {"name": "childEOA", "type": "address"},
          {"name": "limit", "type": "uint256"},
          {"name": "mode", "type": "uint8"},
          {"name": "period", "type": "uint256"}
        ],
        "name": "createSubWallet",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function"
      }],
      functionName: "createSubWallet",
      args: [
        childEOA,
        BigInt(limitInUnits),
        0, // ALLOWANCE mode
        BigInt(periodInSeconds)
      ]
    });

    // Step 4: Encode executeOnSmartWallet data
    const deadline = Math.floor(Date.now() / 1000 + 600); // 10 minutes from now
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
        smartWalletAddress,
        createSubWalletData,
        BigInt(currentNonce),
        BigInt(deadline),
        "0x" // Empty signature - paymaster is authorized
      ]
    });

    // Step 5: Call CF Worker (transform authorization to match CF Worker interface)
    const requestBody = {
      parentEOA,
      smartWalletAddress,
      childEOA,
      monthlyLimit,
      authorizationSignature: {
        chainId: eip7702Authorization.chain_id.toString(),
        address: eip7702Authorization.contract,
        nonce: eip7702Authorization.nonce.toString(),
        r: eip7702Authorization.r,
        s: eip7702Authorization.s,
        yParity: eip7702Authorization.y_parity
      },
      eoaNonce: currentNonce,
      createSubWalletData,
      executeOnSmartWalletData
    };

    console.log('📤 Calling CF Worker /create-subaccount...');
    const cfResponse = await fetch(`${CF_WORKER_URL}/create-subaccount`, {
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

    console.log(`✅ Sub-account created: ${data.transactionHash.slice(0, 10)}...`);

    return {
      success: true,
      transactionHash: data.transactionHash,
      subWalletId: data.subWalletId
    };

  } catch (error: any) {
    console.error('❌ Sub-account creation error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
}
