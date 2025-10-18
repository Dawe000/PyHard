// Import crypto functions for real signature verification
import { secp256k1 } from '@noble/curves/secp256k1';
import { keccak256, recoverAddress, encodeFunctionData } from 'viem';
import { privateKeyToAddress } from 'viem/accounts';

// Types
interface UserOperation {
  sender: string;
  nonce: string;
  initCode: string;
  callData: string;
  callGasLimit: string;
  verificationGasLimit: string;
  preVerificationGas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  paymasterAndData: string;
  signature: string;
}

interface SponsorRequest {
  userOp: UserOperation;
  userOpHash: string;
  maxCost: string;
  entryPoint: string;
  chainId: string;
}

interface SponsorResponse {
  paymasterAndData: string;
  context: string;
  sigValidationData: string;
}

interface Env {
  PAYMASTER_KV: KVNamespace;
  PAYMASTER_PRIVATE_KEY: string; // Paymaster wallet private key for gas sponsorship
  WALLET_FACTORY_ADDRESS: string;
  ENTRY_POINT_ADDRESS: string;
  SUPPORTED_CHAINS: string; // JSON array of supported chain IDs
}

// ERC-4337 constants
const ENTRY_POINT_V6 = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';
const PAYMASTER_STAKE = 1000000000000000000n; // 1 ETH

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
      if (url.pathname === '/sponsor' && request.method === 'POST') {
        const response = await handleSponsorRequest(request, env);
        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (url.pathname === '/health' && request.method === 'GET') {
        return new Response(JSON.stringify({ status: 'healthy', timestamp: Date.now() }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

async function handleSponsorRequest(request: Request, env: Env): Promise<SponsorResponse> {
  const sponsorRequest: SponsorRequest = await request.json();
  
  // Validate request
  await validateSponsorRequest(sponsorRequest, env);
  
  // Verify signature
  await verifyUserOpSignature(sponsorRequest.userOp, sponsorRequest.userOpHash);
  
  // Check if wallet is whitelisted (created by our factory)
  await verifyWalletWhitelist(sponsorRequest.userOp.sender, env);
  
  // Estimate gas and validate costs
  const gasEstimate = await estimateGas(sponsorRequest.userOp);
  
  // Generate paymaster signature
  const paymasterAndData = await generatePaymasterSignature(
    sponsorRequest.userOp,
    sponsorRequest.userOpHash,
    gasEstimate,
    env
  );
  
  return {
    paymasterAndData,
    context: '0x', // Empty context for now
    sigValidationData: '0x' // No additional validation data needed
  };
}

async function validateSponsorRequest(request: SponsorRequest, env: Env): Promise<void> {
  if (!request.userOp || !request.userOpHash || !request.maxCost) {
    throw new Error('Invalid request: missing required fields');
  }
  
  // Simplified validation for local testing
  console.log('Validating sponsor request:', request);
  
  // For local testing, we'll accept any chain and entry point
  console.log('Request validation passed (simplified)');
}

async function verifyUserOpSignature(userOp: UserOperation, userOpHash: string): Promise<void> {
  // Simplified signature verification for local testing
  console.log('Verifying signature for userOp:', userOp.sender);
  console.log('UserOp hash:', userOpHash);
  
  // For local testing, we'll just validate that signature exists
  if (!userOp.signature || userOp.signature.length < 130) {
    throw new Error('Invalid signature: signature too short');
  }
  
  console.log('Signature verification passed (simplified)');
}

async function verifyWalletWhitelist(walletAddress: string, env: Env): Promise<void> {
  // Check if wallet was created by our factory
  // For now, we'll accept all wallets - you can implement factory verification later
  // const isWhitelisted = await checkFactoryWallet(walletAddress, env.WALLET_FACTORY_ADDRESS);
  // if (!isWhitelisted) {
  //   throw new Error('Wallet not whitelisted');
  // }
  
  console.log(`Verifying wallet: ${walletAddress}`);
}

async function estimateGas(userOp: UserOperation): Promise<bigint> {
  // Simple gas estimation - you can make this more sophisticated
  const baseGas = 21000n;
  const verificationGas = BigInt(userOp.verificationGasLimit);
  const executionGas = BigInt(userOp.callGasLimit);
  
  return baseGas + verificationGas + executionGas;
}

async function generatePaymasterSignature(
  userOp: UserOperation,
  userOpHash: string,
  gasEstimate: bigint,
  env: Env
): Promise<string> {
  // Get paymaster wallet address from private key
  const paymasterAddress = privateKeyToAddress(env.PAYMASTER_PRIVATE_KEY as `0x${string}`);
  
  console.log(`🔑 Paymaster Address: ${paymasterAddress}`);
  console.log(`💰 Gas Estimate: ${gasEstimate.toString()}`);
  
  // Create signature data for paymaster validation
  // This is a simplified version - in production you'd follow ERC-4337 spec exactly
  const signatureData = keccak256(
    encodeFunctionData({
      abi: [{ type: "function", name: "hash", inputs: [
        { type: "address", name: "sender" },
        { type: "uint256", name: "nonce" },
        { type: "bytes32", name: "hash" },
        { type: "uint256", name: "gasEstimate" }
      ] }],
      functionName: "hash",
      args: [userOp.sender, BigInt(userOp.nonce), userOpHash as `0x${string}`, gasEstimate]
    })
  );
  
  // Sign the data with paymaster private key
  const signature = secp256k1.sign(signatureData.slice(2), env.PAYMASTER_PRIVATE_KEY.slice(2));
  const signatureBytes = signature.toCompactRawBytes();
  
  console.log(`✍️  Signature created: ${signatureBytes.slice(0, 10)}...`);
  
  // Return paymaster address + signature
  return paymasterAddress.slice(2) + signatureBytes.slice(2);
}

// Helper function to check if wallet was created by factory (implement later)
async function checkFactoryWallet(walletAddress: string, factoryAddress: string): Promise<boolean> {
  // Implementation would query the factory contract to check if wallet was created by it
  return true; // Placeholder
}
