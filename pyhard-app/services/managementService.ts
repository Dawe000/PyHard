// Management Service
// Handles gasless management functions using EIP-7702 delegation

import { encodeFunctionData } from 'viem';
import { EOA_DELEGATION_ADDRESS, ARBITRUM_SEPOLIA_CHAIN_ID } from '@/constants/contracts';

const CF_WORKER_URL = "https://paymaster-cf-worker.dawid-pisarczyk.workers.dev";

export interface ManagementResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

/**
 * Execute a management function gaslessly using EIP-7702 delegation
 * Follows the exact flow from subAccountService.ts
 */
export async function executeManagementFunction(
  eoaAddress: string,
  smartWalletAddress: string,
  functionData: string,
  generateAuthSignature: Function,
  walletId: string // Privy wallet ID for API calls
): Promise<ManagementResult> {
  
  console.log(`🔧 Executing management function for: ${eoaAddress.slice(0, 6)}...${eoaAddress.slice(-4)}`);

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

  // Step 2: Get EIP-7702 authorization using REST API approach (same as sub-account creation)
  console.log('🔐 Getting EIP-7702 authorization using REST API...');
  
  const CHAIN_ID = 421614; // Arbitrum Sepolia
  
  // Build the request payload for the Privy API (same pattern as sub-account creation)
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

  // Extract the signature string from the result object (same as sub-account creation)
  let authorizationSignature: string;
  if (typeof authorizationSignatureResult === 'string') {
    authorizationSignature = authorizationSignatureResult;
  } else if (typeof authorizationSignatureResult === 'object' && authorizationSignatureResult.signature) {
    authorizationSignature = authorizationSignatureResult.signature;
  } else {
    throw new Error(`Unexpected authorization signature format: ${JSON.stringify(authorizationSignatureResult)}`);
  }

  console.log("✅ Privy authorization signature extracted:", authorizationSignature);

  // Step 3: Get access token for the API call (same as sub-account creation)
  const { createPrivyClient } = await import('@privy-io/expo');
  const privy = createPrivyClient({
    appId: 'cmgtb4vg702vqld0da5wktriq',
    clientId: 'client-WY6RdMvmLZHLWnPB2aNZAEshGmBTwtGUAx299bCthg7U9'
  });
  const accessToken = await privy.getAccessToken();

  // Step 4: Call Privy API to get EIP-7702 authorization (same as sub-account creation)
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

  // Step 5: Call CF Worker (same pattern as sub-account creation)
  const requestBody = {
    eoaAddress,
    smartWalletAddress,
    functionData,
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

  console.log('📤 Calling CF Worker /management-function...');
  const cfResponse = await fetch(`${CF_WORKER_URL}/management-function`, {
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
    success: data.success,
    transactionHash: data.transactionHash,
    error: data.error
  };
}
