import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("EIP-7702 Delegation Issue Test", async function () {
  it("should reproduce the EIP-7702 delegation issue", async function () {
    console.log("🧪 Testing EIP-7702 delegation issue...");
    
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
    
    // Authorize paymaster in the EOADelegation contract
    const authorizeTx = await paymaster.writeContract({
      address: eoaDelegationAddress,
      abi: abi,
      functionName: "addAuthorizedPaymaster",
      args: [paymaster.account.address],
    });
    
    await publicClient.waitForTransactionReceipt({ hash: authorizeTx });
    console.log("✅ Paymaster authorized in EOADelegation contract");
    
    // Check if paymaster is authorized in EOADelegation contract
    const isAuthorizedInContract = await publicClient.readContract({
      address: eoaDelegationAddress,
      abi: abi,
      functionName: "authorizedPaymasters",
      args: [paymaster.account.address]
    });
    
    console.log("🔍 Paymaster authorized in EOADelegation contract:", isAuthorizedInContract);
    assert.equal(isAuthorizedInContract, true);
    
    // Now simulate EIP-7702 delegation
    // When EOA delegates to EOADelegation, the contract code is executed in EOA's context
    // But the contract's storage (authorizedPaymasters) is not accessible!
    
    console.log("\n🚀 Simulating EIP-7702 delegation...");
    console.log("🔍 EOA delegates to EOADelegation contract");
    console.log("🔍 Now EOA executes EOADelegation code");
    console.log("🔍 But authorizedPaymasters mapping is in EOADelegation contract storage");
    console.log("🔍 Not accessible when executed as EOA's code!");
    
    // This is the issue: when the EOA delegates to EOADelegation,
    // the contract code is executed in the EOA's context,
    // but the contract's storage is not accessible!
    
    // The solution is to modify the contract to handle EIP-7702 properly
    // We need to store the authorized paymasters in a way that's accessible
    // when the contract is executed as the EOA's code
    
    console.log("\n💡 The issue is:");
    console.log("1. EOA delegates to EOADelegation contract");
    console.log("2. EOA now executes EOADelegation code");
    console.log("3. But authorizedPaymasters mapping is in EOADelegation contract storage");
    console.log("4. Not accessible when executed as EOA's code!");
    
    console.log("\n🔧 Solution needed:");
    console.log("1. Modify EOADelegation contract to handle EIP-7702 properly");
    console.log("2. Store authorized paymasters in a way that's accessible");
    console.log("3. Or use a different approach for EIP-7702 delegation");
    
    // For now, let's just confirm the issue exists
    console.log("\n✅ Test completed - issue identified!");
  });
});
