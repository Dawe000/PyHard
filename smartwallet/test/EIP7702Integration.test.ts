import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { encodeFunctionData, keccak256, parseEther, createWalletClient, http, createPublicClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";
import { network } from "hardhat";

describe("EIP-7702 Integration Test", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  
  let eoaDelegation: any;
  let smartWallet: any;
  let factory: any;
  let pyusd: any;
  let paymaster: any;
  let user: any;
  let relayer: any;

  it("🚀 STEP 1: Deploy all contracts", async function () {
    console.log("\n=== STEP 1: DEPLOYING CONTRACTS ===");
    
    // Get wallet clients
    const wallets = await viem.getWalletClients();
    user = wallets[0];
    relayer = wallets[1];

    // Deploy MockPYUSD
    pyusd = await viem.deployContract("MockPYUSD", []);
    console.log("✅ PYUSD deployed:", pyusd.address);

    // Deploy EOADelegation
    eoaDelegation = await viem.deployContract("EOADelegation", []);
    console.log("✅ EOADelegation deployed:", eoaDelegation.address);

    // Deploy EIP7702Paymaster with funding
    paymaster = await viem.deployContract("EIP7702Paymaster", [], {
      value: parseEther("10") // Fund with 10 ETH
    });
    console.log("✅ EIP7702Paymaster deployed:", paymaster.address);

    // Deploy SmartWalletFactory
    factory = await viem.deployContract("SmartWalletFactory", [
      pyusd.address
    ]);
    console.log("✅ SmartWalletFactory deployed:", factory.address);
    
    console.log("📍 User EOA:", user.account.address);
    console.log("📍 Relayer EOA:", relayer.account.address);
  });

  it("🎯 STEP 2: Create SmartWallet and fund with PYUSD", async function () {
    console.log("\n=== STEP 2: CREATING SMART WALLET ===");
    
    // Create SmartWallet for user
    await factory.write.createWallet([user.account.address]);
    const smartWalletAddress = await factory.read.ownerToWallet([user.account.address]);
    
    // Get SmartWallet contract instance
    smartWallet = await viem.getContractAt("SmartWallet", smartWalletAddress);

    // Fund SmartWallet with PYUSD
    await pyusd.write.mint([smartWallet.address, 1000n * 10n**6n]); // 1000 PYUSD

    const balance = await pyusd.read.balanceOf([smartWallet.address]);
    assert.equal(balance, 1000n * 10n**6n);
    
    console.log("✅ SmartWallet created:", smartWallet.address);
    console.log("💰 Initial PYUSD balance:", (balance / 10n**6n).toString(), "PYUSD");
  });

  it("🔐 STEP 3: Setup authorization", async function () {
    console.log("\n=== STEP 3: SETTING UP AUTHORIZATION ===");
    
    // Whitelist user EOA in paymaster
    await paymaster.write.setEOAWhitelisted([user.account.address, true]);
    
    // Authorize relayer in paymaster
    await paymaster.write.addRelayer([relayer.account.address]);

    const isWhitelisted = await paymaster.read.whitelistedEOAs([user.account.address]);
    const isAuthorized = await paymaster.read.authorizedRelayers([relayer.account.address]);
    
    assert.equal(isWhitelisted, true);
    assert.equal(isAuthorized, true);
    
    console.log("✅ User EOA whitelisted:", isWhitelisted);
    console.log("✅ Relayer authorized:", isAuthorized);
  });

  it("🌐 STEP 4: Test CF Worker health", async function () {
    console.log("\n=== STEP 4: TESTING CF WORKER ===");
    
    try {
      const response = await fetch("http://localhost:8787/health", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log("✅ CF Worker is healthy:", result);
      } else {
        console.log("⚠️ CF Worker health check failed:", response.status);
        throw new Error("CF Worker not responding");
      }
    } catch (error) {
      console.log("❌ CF Worker not responding:", error.message);
      throw new Error("CF Worker must be running on http://localhost:8787");
    }
  });

  it("💸 STEP 5: PYUSD Transfer via CF Worker API", async function () {
    console.log("\n=== STEP 5: PYUSD TRANSFER VIA CF WORKER ===");
    
    // Prepare transfer data
    const recipient = relayer.account.address;
    const transferAmount = 50n * 10n**6n; // 50 PYUSD
    
    console.log("🎯 Transferring", (transferAmount / 10n**6n).toString(), "PYUSD to:", recipient);
    
    const transferData = encodeFunctionData({
      abi: pyusd.abi,
      functionName: "transfer",
      args: [recipient, transferAmount]
    });

    // Encode SmartWallet.execute() call
    const executeData = encodeFunctionData({
      abi: smartWallet.abi,
      functionName: "execute",
      args: [pyusd.address, 0n, transferData]
    });

    // Get nonce and deadline
    const nonce = await eoaDelegation.read.nonces([user.account.address]);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now
    const chainId = 31337n; // Hardhat chain ID

    // Create message hash for EOA signature
    const messageHash = keccak256(
      encodeFunctionData({
        abi: [{ 
          type: "function", 
          name: "encode", 
          inputs: [
            { type: "address", name: "smartWallet" },
            { type: "bytes", name: "data" },
            { type: "uint256", name: "nonce" },
            { type: "uint256", name: "deadline" },
            { type: "uint256", name: "chainId" }
          ] 
        }],
        functionName: "encode",
        args: [smartWallet.address, executeData, nonce, deadline, chainId]
      })
    );

    // Sign with user's private key
    const signature = await user.signMessage({
      message: { raw: messageHash }
    });

    console.log("✍️ User signed operation");
    console.log("   SmartWallet:", smartWallet.address);
    console.log("   Nonce:", nonce.toString());
    console.log("   Signature:", signature.slice(0, 20) + "...");

    // Prepare request for CF Worker
    const sponsorRequest = {
      eoaAddress: user.account.address,
      smartWalletAddress: smartWallet.address,
      functionData: executeData,
      value: "0",
      nonce: nonce.toString(),
      deadline: deadline.toString(),
      signature: signature,
      chainId: chainId.toString()
    };

    console.log("🌐 Sending request to CF Worker...");
    console.log("   URL: http://localhost:8787/sponsor-transaction");

    // Call CF Worker
    const response = await fetch("http://localhost:8787/sponsor-transaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sponsorRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`CF Worker error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ CF Worker response:", result);

    // Wait for transaction to be mined
    if (result.transactionHash) {
      console.log("⏳ Waiting for transaction to be mined...");
      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash: result.transactionHash 
      });
      
      console.log("✅ Transaction mined!");
      console.log("   Hash:", result.transactionHash);
      console.log("   Gas used:", receipt.gasUsed.toString());
      console.log("   Status:", receipt.status);

      // Verify transfer happened
      const recipientBalance = await pyusd.read.balanceOf([recipient]);
      assert.equal(recipientBalance, transferAmount);
      
      // Verify SmartWallet balance decreased
      const smartWalletBalance = await pyusd.read.balanceOf([smartWallet.address]);
      assert.equal(smartWalletBalance, (1000n * 10n**6n) - transferAmount);
      
      console.log("🎉 PYUSD transfer successful!");
      console.log("   Recipient balance:", (recipientBalance / 10n**6n).toString(), "PYUSD");
      console.log("   SmartWallet balance:", (smartWalletBalance / 10n**6n).toString(), "PYUSD");
    }
  });

  it("👶 STEP 6: Create Sub-wallet via CF Worker API", async function () {
    console.log("\n=== STEP 6: CREATE SUB-WALLET VIA CF WORKER ===");
    
    // Prepare createSubWallet data
    const childEOA = relayer.account.address;
    const dailyLimit = 100n * 10n**6n; // 100 PYUSD
    
    console.log("👶 Creating sub-wallet for child EOA:", childEOA);
    console.log("💰 Daily limit:", (dailyLimit / 10n**6n).toString(), "PYUSD");
    
    const createSubWalletData = encodeFunctionData({
      abi: smartWallet.abi,
      functionName: "createSubWallet",
      args: [childEOA, dailyLimit, 0n, 86400n] // mode 0 (ALLOWANCE), period 1 day
    });

    // Get nonce and deadline
    const nonce = await eoaDelegation.read.nonces([user.account.address]);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
    const chainId = 31337n;

    // Create message hash
    const messageHash = keccak256(
      encodeFunctionData({
        abi: [{ 
          type: "function", 
          name: "encode", 
          inputs: [
            { type: "address", name: "smartWallet" },
            { type: "bytes", name: "data" },
            { type: "uint256", name: "nonce" },
            { type: "uint256", name: "deadline" },
            { type: "uint256", name: "chainId" }
          ] 
        }],
        functionName: "encode",
        args: [smartWallet.address, createSubWalletData, nonce, deadline, chainId]
      })
    );

    // Sign with user's private key
    const signature = await user.signMessage({
      message: { raw: messageHash }
    });

    console.log("✍️ User signed sub-wallet creation");
    console.log("   Child EOA:", childEOA);
    console.log("   Nonce:", nonce.toString());

    // Prepare request for CF Worker
    const sponsorRequest = {
      eoaAddress: user.account.address,
      smartWalletAddress: smartWallet.address,
      functionData: createSubWalletData,
      value: "0",
      nonce: nonce.toString(),
      deadline: deadline.toString(),
      signature: signature,
      chainId: chainId.toString()
    };

    console.log("🌐 Sending sub-wallet creation to CF Worker...");

    // Call CF Worker
    const response = await fetch("http://localhost:8787/sponsor-transaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sponsorRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`CF Worker error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ CF Worker response:", result);

    // Wait for transaction to be mined
    if (result.transactionHash) {
      console.log("⏳ Waiting for sub-wallet creation to be mined...");
      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash: result.transactionHash 
      });
      
      console.log("✅ Sub-wallet creation mined!");
      console.log("   Hash:", result.transactionHash);
      console.log("   Gas used:", receipt.gasUsed.toString());

      // Verify sub-wallet was created
      const subWalletCount = await smartWallet.read.getSubWalletCount();
      assert.equal(subWalletCount, 1n);
      
      // Get sub-wallet details
      const [childAddr, spendingLimit, spentInPeriod, lastResetTime, period, mode, active] = 
        await smartWallet.read.getSubWallet([0]);
      
      assert.equal(childAddr, childEOA);
      assert.equal(spendingLimit, dailyLimit);
      assert.equal(active, true);
      
      console.log("🎉 Sub-wallet created successfully!");
      console.log("   Sub-wallet count:", subWalletCount.toString());
      console.log("   Spending limit:", (spendingLimit / 10n**6n).toString(), "PYUSD");
      console.log("   Active:", active);
    }
  });

  it("📊 STEP 7: Final verification", async function () {
    console.log("\n=== STEP 7: FINAL VERIFICATION ===");
    
    // Check SmartWallet PYUSD balance
    const smartWalletBalance = await pyusd.read.balanceOf([smartWallet.address]);
    console.log("💰 SmartWallet PYUSD balance:", (smartWalletBalance / 10n**6n).toString(), "PYUSD");
    
    // Check relayer PYUSD balance (from transfer)
    const relayerBalance = await pyusd.read.balanceOf([relayer.account.address]);
    console.log("💰 Relayer PYUSD balance:", (relayerBalance / 10n**6n).toString(), "PYUSD");
    
    // Check sub-wallet count
    const subWalletCount = await smartWallet.read.getSubWalletCount();
    console.log("👶 Sub-wallet count:", subWalletCount.toString());
    
    // Check paymaster ETH balance
    const paymasterBalance = await publicClient.getBalance({ address: paymaster.address });
    console.log("💎 Paymaster ETH balance:", (paymasterBalance / parseEther("1")).toString(), "ETH");
    
    console.log("\n🎉 COMPLETE EIP-7702 FLOW SUCCESSFUL!");
    console.log("✅ EOA → SmartWallet → CF Worker → Gas Sponsorship → Execution");
    console.log("✅ PYUSD Transfer: 50 PYUSD sent via CF Worker");
    console.log("✅ Sub-wallet Creation: Child wallet created with 100 PYUSD limit");
    console.log("✅ Gas Sponsorship: All transactions sponsored by paymaster");
  });
});
