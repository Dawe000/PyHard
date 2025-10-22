import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { encodeFunctionData, createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";

describe("EIP-7702 Correct Flow Test", async function () {
  const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";
  
  // Contract addresses from deployment
  const SMART_WALLET_ADDRESS = "0x188CB9276bb75992A6c1Af2443e293431307382a";
  const PYUSD_ADDRESS = "0x637A1259C6afd7E3AdF63993cA7E58BB438aB1B1";
  
  // User account (owner of SmartWallet)
  const userPrivateKey = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
  const userAddress = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
  
  // Paymaster account (has ETH for gas)
  const paymasterPrivateKey = "0x3471db0b3f6db7801ab954a3ba20596a99ae8d4da0b5c8dd1228a118dea3d1a6";
  const paymasterAddress = "0x53cd866553b78a32060b70e764d31b0fe3afe52c";
  
  let userWallet: any;
  let paymasterWallet: any;
  let publicClient: any;
  
  it("Setup wallet clients", async function () {
    // Create user wallet client
    const userAccount = privateKeyToAccount(userPrivateKey as `0x${string}`);
    userWallet = createWalletClient({
      account: userAccount,
      chain: arbitrumSepolia,
      transport: http(RPC_URL)
    });
    
    // Create paymaster wallet client
    const paymasterAccount = privateKeyToAccount(paymasterPrivateKey as `0x${string}`);
    paymasterWallet = createWalletClient({
      account: paymasterAccount,
      chain: arbitrumSepolia,
      transport: http(RPC_URL)
    });
    
    // Create public client
    publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(RPC_URL)
    });
    
    console.log("✅ Wallet clients created");
    console.log("   User EOA:", userAddress);
    console.log("   Paymaster EOA:", paymasterAddress);
    console.log("   SmartWallet:", SMART_WALLET_ADDRESS);
  });

  it("Check initial balances", async function () {
    const smartWalletBalance = await publicClient.readContract({
      address: PYUSD_ADDRESS as `0x${string}`,
      abi: [
        {
          "inputs": [{"name": "account", "type": "address"}],
          "name": "balanceOf",
          "outputs": [{"name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        }
      ],
      functionName: "balanceOf",
      args: [SMART_WALLET_ADDRESS]
    });
    
    const paymasterBalance = await publicClient.readContract({
      address: PYUSD_ADDRESS as `0x${string}`,
      abi: [
        {
          "inputs": [{"name": "account", "type": "address"}],
          "name": "balanceOf",
          "outputs": [{"name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        }
      ],
      functionName: "balanceOf",
      args: [paymasterAddress]
    });
    
    console.log("💰 Initial balances:");
    console.log("   SmartWallet:", (smartWalletBalance / 10n**6n).toString(), "PYUSD");
    console.log("   Paymaster:", (paymasterBalance / 10n**6n).toString(), "PYUSD");
    
    assert(smartWalletBalance > 0n, "SmartWallet should have PYUSD balance");
  });

  it("Transfer PYUSD using CORRECT EIP-7702 flow", async function () {
    const recipient = paymasterAddress;
    const transferAmount = 1n * 10n**6n; // 1 PYUSD (6 decimals)
    
    console.log("🚀 Starting CORRECT EIP-7702 flow...");
    console.log("   From: SmartWallet", SMART_WALLET_ADDRESS);
    console.log("   To: Paymaster", recipient);
    console.log("   Amount: 1 PYUSD");
    console.log("   Key: Submit transaction TO user's EOA, not SmartWallet!");
    
    // Step 1: User signs EIP-7702 authorization
    console.log("🔐 User signing EIP-7702 authorization...");
    const authorization = await userWallet.signAuthorization({
      contractAddress: SMART_WALLET_ADDRESS as `0x${string}`,
      chainId: 421614, // Arbitrum Sepolia
      nonce: 0
    });
    
    console.log("✅ User signed EIP-7702 authorization");
    console.log("   Delegating EOA to SmartWallet");
    
    // Step 2: Prepare PYUSD transfer data (this will be executed by SmartWallet logic)
    const pyusdTransferData = encodeFunctionData({
      abi: [
        {
          "inputs": [
            {"name": "to", "type": "address"},
            {"name": "amount", "type": "uint256"}
          ],
          "name": "transfer",
          "outputs": [{"name": "", "type": "bool"}],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ],
      functionName: "transfer",
      args: [recipient, transferAmount]
    });
    
    console.log("📝 PYUSD transfer data:", pyusdTransferData);
    
    // Step 3: Prepare SmartWallet.execute() call data
    const executeData = encodeFunctionData({
      abi: [
        {
          "inputs": [
            {"name": "target", "type": "address"},
            {"name": "value", "type": "uint256"},
            {"name": "data", "type": "bytes"}
          ],
          "name": "execute",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ],
      functionName: "execute",
      args: [PYUSD_ADDRESS, 0n, pyusdTransferData]
    });
    
    console.log("📝 Execute data:", executeData);
    
    // Step 4: Paymaster submits transaction TO USER'S EOA (not SmartWallet!)
    console.log("💸 Paymaster submitting transaction TO USER'S EOA...");
    console.log("   Key insight: Transaction goes to user EOA, not SmartWallet!");
    console.log("   User's EOA will temporarily have SmartWallet code");
    
    try {
      const hash = await paymasterWallet.sendTransaction({
        to: userAddress as `0x${string}`, // TO USER'S EOA, not SmartWallet!
        data: executeData, // SmartWallet.execute() call data
        authorizationList: [authorization] // EIP-7702 delegation
      });
      
      console.log("✅ Transaction submitted:", hash);
      
      // Wait for transaction
      console.log("⏳ Waiting for transaction confirmation...");
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
      
      // Verify transfer
      console.log("🔍 Verifying transfer...");
      const recipientBalance = await publicClient.readContract({
        address: PYUSD_ADDRESS as `0x${string}`,
        abi: [
          {
            "inputs": [{"name": "account", "type": "address"}],
            "name": "balanceOf",
            "outputs": [{"name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
          }
        ],
        functionName: "balanceOf",
        args: [recipient]
      });
      
      const smartWalletBalance = await publicClient.readContract({
        address: PYUSD_ADDRESS as `0x${string}`,
        abi: [
          {
            "inputs": [{"name": "account", "type": "address"}],
            "name": "balanceOf",
            "outputs": [{"name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
          }
        ],
        functionName: "balanceOf",
        args: [SMART_WALLET_ADDRESS]
      });
      
      console.log("🎉 CORRECT EIP-7702 FLOW SUCCESSFUL!");
      console.log("   ✅ User: Signed authorization (0 gas)");
      console.log("   ✅ Paymaster: Paid gas for transaction");
      console.log("   ✅ Transaction executed as: User EOA with SmartWallet code");
      console.log("   ✅ Key: Transaction sent TO user EOA, not SmartWallet");
      console.log("   ✅ Recipient balance:", (recipientBalance / 10n**6n).toString(), "PYUSD");
      console.log("   ✅ SmartWallet balance:", (smartWalletBalance / 10n**6n).toString(), "PYUSD");
      
      // Verify the transfer worked
      assert(recipientBalance >= transferAmount, "Recipient should have received PYUSD");
      console.log("✅ Transfer verification passed!");
      
    } catch (error) {
      console.log("❌ EIP-7702 correct flow failed:", error.message);
      throw error;
    }
  });
});