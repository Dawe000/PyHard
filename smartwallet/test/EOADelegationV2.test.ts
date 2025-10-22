import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseEther } from "viem";
import { network } from "hardhat";

describe("EOADelegation V2 - EIP-7702 Test", async function () {
  let eoaDelegation: any;
  let paymaster: any;
  let user: any;
  let smartWallet: any;
  let publicClient: any;
  let walletClient: any;

  it("should setup and test EOADelegation V2", async function () {
    const { viem } = await network.connect();
    const wallets = await viem.getWalletClients();
    
    // Setup accounts
    paymaster = wallets[0]; // This will be our authorized paymaster
    user = wallets[1]; // This will be the EOA that delegates
    smartWallet = wallets[2]; // This will be the SmartWallet
    
    publicClient = await viem.getPublicClient();
    walletClient = await viem.getWalletClient();
    
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
    eoaDelegation = {
      address: receipt.contractAddress!,
      abi: abi
    };
    
    console.log("✅ EOADelegation V2 deployed to:", eoaDelegation.address);
    
    // Authorize paymaster
    const authorizeTx = await paymaster.writeContract({
      address: eoaDelegation.address,
      abi: eoaDelegation.abi,
      functionName: "addAuthorizedPaymaster",
      args: [paymaster.account.address],
    });
    
    await publicClient.waitForTransactionReceipt({ hash: authorizeTx });
    console.log("✅ Paymaster authorized");
  });

  it("should allow authorized paymaster to execute without signature", async () => {
    console.log("\n🧪 Testing authorized paymaster execution...");
    
    // Check if paymaster is authorized
    const isAuthorized = await publicClient.readContract({
      address: eoaDelegation.address,
      abi: eoaDelegation.abi,
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
    
    try {
      const tx = await paymaster.writeContract({
        address: eoaDelegation.address,
        abi: eoaDelegation.abi,
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
      throw error;
    }
  });

  it("should test EIP-7702 delegation flow", async () => {
    console.log("\n🧪 Testing EIP-7702 delegation flow...");
    
    // This test simulates what happens when the EOA delegates to EOADelegation
    // and then the paymaster calls the EOA (which executes EOADelegation code)
    
    // First, simulate EIP-7702 authorization (this would normally be done by the user)
    const authorizationList = [{
      chainId: BigInt(31337), // Hardhat chain ID
      address: eoaDelegation.address as `0x${string}`,
      nonce: BigInt(0),
      r: "0x0000000000000000000000000000000000000000000000000000000000000000",
      s: "0x0000000000000000000000000000000000000000000000000000000000000000",
      yParity: 0
    }];
    
    console.log("🔍 Authorization list:", authorizationList);
    
    // Simulate calling the EOA with EIP-7702 authorization
    // This would normally be done by the paymaster calling the user's EOA
    try {
      const tx = await paymaster.sendTransaction({
        to: user.account.address, // TO USER'S EOA
        data: "0x", // Empty data for EIP-7702 authorization
        authorizationList: authorizationList,
        value: 0n
      });
      
      console.log("✅ EIP-7702 authorization submitted:", tx);
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log("✅ EIP-7702 authorization confirmed:", receipt.status);
      
      // Now simulate calling executeOnSmartWallet on the EOA (which should execute EOADelegation code)
      const executeData = "0xa9059cbb00000000000000000000000055c7E5124FC14a3CDDE1f09ecBb8676141c5A06c00000000000000000000000000000000000000000000000000000000000f4240";
      
      const delegationData = await import("viem");
      const { encodeFunctionData } = delegationData;
      
      const callData = encodeFunctionData({
        abi: eoaDelegation.abi,
        functionName: "executeOnSmartWallet",
        args: [
          smartWallet.account.address,
          executeData,
          BigInt(0),
          BigInt(Math.floor(Date.now() / 1000) + 600),
          "0x"
        ]
      });
      
      console.log("🔍 Calling EOA with delegation data:", callData);
      
      const executeTx = await paymaster.sendTransaction({
        to: user.account.address, // TO EOA (now delegated to EOADelegation)
        data: callData,
        value: 0n
      });
      
      console.log("✅ Execute transaction submitted:", executeTx);
      
      const executeReceipt = await publicClient.waitForTransactionReceipt({ hash: executeTx });
      console.log("✅ Execute transaction confirmed:", executeReceipt.status);
      
      assert.equal(executeReceipt.status, "success");
      
    } catch (error) {
      console.error("❌ EIP-7702 flow failed:", error);
      throw error;
    }
  });
});
