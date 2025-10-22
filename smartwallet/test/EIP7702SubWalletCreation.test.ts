import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { createWalletClient, createPublicClient, http, getContract, encodeFunctionData } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";

describe("EIP-7702 Sub-Wallet Creation", function () {
  const SMART_WALLET_ADDRESS = "0x41dCFB0303034844adA29C06747227c95551e913";
  const EOADelegation_ADDRESS = "0x58b15c7291c316E0B3C8af875de54F07e0E4b05d";
  
  let userWallet: any;
  let paymasterWallet: any;
  let publicClient: any;

  before(async function () {
    const userPrivateKey = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
    const paymasterPrivateKey = "0x3471db0b3f6db7801ab954a3ba20596a99ae8d4da0b5c8dd1228a118dea3d1a6";
    
    publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http("https://sepolia-rollup.arbitrum.io/rpc")
    });
    
    paymasterWallet = createWalletClient({
      account: privateKeyToAccount(paymasterPrivateKey as `0x${string}`),
      chain: arbitrumSepolia,
      transport: http("https://sepolia-rollup.arbitrum.io/rpc")
    });
    
    userWallet = createWalletClient({
      account: privateKeyToAccount(userPrivateKey as `0x${string}`),
      chain: arbitrumSepolia,
      transport: http("https://sepolia-rollup.arbitrum.io/rpc")
    });
  });

  it("Create sub-wallet using EIP-7702 delegation", async function () {
    console.log("🔍 Testing EIP-7702 delegation with correct executeOnSmartWallet approach...");
    console.log("   User EOA:", userWallet.account.address);
    console.log("   SmartWallet:", SMART_WALLET_ADDRESS);
    console.log("   EOADelegation:", EOADelegation_ADDRESS);
    
    // Step 1: Get current EOA nonce
    const currentNonce = await publicClient.getTransactionCount({
      address: userWallet.account.address as `0x${string}`,
      blockTag: 'latest'
    });
    console.log("✅ Current EOA nonce:", currentNonce);
    
    // Step 2: User signs EIP-7702 authorization
    console.log("🔐 User signing EIP-7702 authorization...");
    const authorization = await userWallet.signAuthorization({
      contractAddress: EOADelegation_ADDRESS as `0x${string}`,
      chainId: 421614,
      nonce: currentNonce
    });
    
    console.log("✅ User signed EIP-7702 authorization");
    
    // Step 3: Format authorization list
    const authorizationList = [{
      chainId: authorization.chainId,
      address: EOADelegation_ADDRESS as `0x${string}`,
      nonce: authorization.nonce,
      r: authorization.r as `0x${string}`,
      s: authorization.s as `0x${string}`,
      yParity: authorization.yParity
    }];
    
    // Step 4: First transaction - EIP-7702 authorization
    console.log("🚀 Step 1: Submitting EIP-7702 authorization...");
    
    const authHash = await paymasterWallet.sendTransaction({
      to: userWallet.account.address as `0x${string}`,
      data: '0x',
      authorizationList: authorizationList,
      value: 0n
    });
    
    console.log("✅ EIP-7702 authorization submitted:", authHash);
    
    // Wait for authorization
    await publicClient.waitForTransactionReceipt({ hash: authHash });
    console.log("✅ EIP-7702 authorization confirmed");
    
    // Step 5: Prepare SmartWallet function call data
    console.log("🔍 Preparing SmartWallet function call data...");
    
    // Prepare createSubWallet data
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
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Child EOA
        BigInt("50000000"), // 50 PYUSD (6 decimals)
        0, // ALLOWANCE mode
        BigInt(30 * 24 * 60 * 60) // 30 days
      ]
    });
    
    console.log("📝 createSubWallet data:", createSubWalletData);
    
    // Step 6: Prepare EOADelegation.executeOnSmartWallet() call data
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
        SMART_WALLET_ADDRESS, // SmartWallet address
        createSubWalletData, // SmartWallet function call data
        BigInt(currentNonce), // Nonce
        BigInt(Math.floor(Date.now() / 1000 + 600)), // Deadline
        "0x" // Empty signature - paymaster is authorized
      ]
    });
    
    console.log("📝 executeOnSmartWallet data:", executeOnSmartWalletData);
    
    // Step 7: Call the delegated EOA with executeOnSmartWallet data
    console.log("🔍 Calling delegated EOA with executeOnSmartWallet data...");
    
    try {
      const hash = await paymasterWallet.sendTransaction({
        to: userWallet.account.address as `0x${string}`, // TO USER'S EOA (delegated to EOADelegation)
        data: executeOnSmartWalletData, // EOADelegation.executeOnSmartWallet() call data
        value: 0n
      });
      
      console.log("✅ Transaction submitted:", hash);
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("📊 Transaction status:", receipt.status);
      console.log("📊 Gas used:", receipt.gasUsed?.toString());
      
      if (receipt.logs && receipt.logs.length > 0) {
        console.log("📋 Transaction logs:", receipt.logs.length);
        receipt.logs.forEach((log, index) => {
          console.log(`   Log ${index + 1}:`, {
            address: log.address,
            topics: log.topics,
            data: log.data
          });
        });
        console.log("✅ EIP-7702 delegation is working - logs found!");
      } else {
        console.log("⚠️ No logs found in transaction");
        console.log("❌ EIP-7702 delegation is NOT working - no code execution");
      }
      
      // Check if sub-wallet was created
      const smartWalletContract = getContract({
        address: SMART_WALLET_ADDRESS as `0x${string}`,
        abi: [
          {
            "inputs": [],
            "name": "getSubWalletCount",
            "outputs": [{"name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
          }
        ],
        client: publicClient
      });
      
      const subWalletCount = await smartWalletContract.read.getSubWalletCount();
      console.log("📊 Sub-wallet count after transaction:", subWalletCount.toString());
      
      if (subWalletCount > 2n) {
        console.log("🎉 Sub-wallet creation successful!");
        console.log("   ✅ New sub-wallets created:", (subWalletCount - 2n).toString());
      } else {
        console.log("❌ No new sub-wallets created");
      }
      
    } catch (error) {
      console.log("❌ Error calling executeOnSmartWallet:", error);
    }
  });
});
