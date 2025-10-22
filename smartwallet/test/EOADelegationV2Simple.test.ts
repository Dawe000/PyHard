import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("EOADelegation V2 Simple Test", async function () {
  it("should test authorized paymaster execution", async function () {
    console.log("🧪 Testing EOADelegation V2 with authorized paymaster...");
    
    const { viem } = await network.connect();
    const wallets = await viem.getWalletClients();
    const publicClient = await viem.getPublicClient();
    
    // Setup accounts
    const paymaster = wallets[0]; // This will be our authorized paymaster
    const user = wallets[1]; // This will be the EOA that delegates
    const smartWallet = wallets[2]; // This will be the SmartWallet
    
    console.log("📍 Paymaster address:", paymaster.account.address);
    console.log("📍 User EOA address:", user.account.address);
    console.log("📍 SmartWallet address:", smartWallet.account.address);
    
    // Deploy EOADelegation V2
    const contractArtifact = await import("../artifacts/contracts/EOADelegation.sol/EOADelegation.json");
    const bytecode = contractArtifact.default.bytecode;
    const abi = contractArtifact.default.abi;
    
    const hash = await paymaster.deployContract({
      abi: abi,
      bytecode: bytecode as `0x${string}`,
    });
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const eoaDelegationAddress = receipt.contractAddress!;
    
    console.log("✅ EOADelegation V2 deployed to:", eoaDelegationAddress);
    
    // Authorize paymaster
    const authorizeTx = await paymaster.writeContract({
      address: eoaDelegationAddress,
      abi: abi,
      functionName: "addAuthorizedPaymaster",
      args: [paymaster.account.address],
    });
    
    await publicClient.waitForTransactionReceipt({ hash: authorizeTx });
    console.log("✅ Paymaster authorized");
    
    // Check if paymaster is authorized
    const isAuthorized = await publicClient.readContract({
      address: eoaDelegationAddress,
      abi: abi,
      functionName: "authorizedPaymasters",
      args: [paymaster.account.address]
    });
    
    console.log("🔍 Paymaster authorized:", isAuthorized);
    assert.equal(isAuthorized, true);
    
    // Test executeOnSmartWallet with authorized paymaster
    const executeData = "0xa9059cbb00000000000000000000000055c7E5124FC14a3CDDE1f09ecBb8676141c5A06c00000000000000000000000000000000000000000000000000000000000f4240"; // transfer(address,uint256)
    const nonce = 0;
    const deadline = Math.floor(Date.now() / 1000) + 600; // 10 minutes from now
    
    console.log("🔍 Execute data:", executeData);
    console.log("🔍 Nonce:", nonce);
    console.log("🔍 Deadline:", deadline);
    console.log("🔍 Calling from:", paymaster.account.address);
    console.log("🔍 Calling to:", eoaDelegationAddress);
    
    try {
      const tx = await paymaster.writeContract({
        address: eoaDelegationAddress,
        abi: abi,
        functionName: "executeOnSmartWallet",
        args: [
          smartWallet.account.address, // SmartWallet
          executeData, // Execute data
          BigInt(nonce), // Nonce
          BigInt(deadline), // Deadline
          "0x" // Empty signature - paymaster is authorized
        ],
      });
      
      console.log("✅ Transaction submitted:", tx);
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log("✅ Transaction confirmed:", receipt.status);
      
      assert.equal(receipt.status, "success");
      
    } catch (error) {
      console.error("❌ Transaction failed:", error);
      console.error("❌ Error details:", error);
      throw error;
    }
  });
});
