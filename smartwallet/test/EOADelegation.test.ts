import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { encodeFunctionData, keccak256 } from "viem";
import { network } from "hardhat";

describe("EOADelegation Unit Tests", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  
  let eoaDelegation: any;
  let smartWallet: any;
  let factory: any;
  let pyusd: any;
  let owner: any;
  let user: any;

  it("Should deploy contracts", async function () {
    // Get wallet clients
    const wallets = await viem.getWalletClients();
    owner = wallets[0];
    user = wallets[1];

    // Deploy MockPYUSD
    pyusd = await viem.deployContract("MockPYUSD", []);

    // Deploy EOADelegation
    eoaDelegation = await viem.deployContract("EOADelegation", []);

    // Deploy SmartWalletFactory
    factory = await viem.deployContract("SmartWalletFactory", [
      pyusd.address
    ]);

    assert.ok(eoaDelegation.address);
    assert.ok(factory.address);
    console.log("✅ EOADelegation deployed at:", eoaDelegation.address);
    console.log("✅ Factory deployed at:", factory.address);
  });

  it("Should create SmartWallet for user", async function () {
    // Create SmartWallet for user
    await factory.write.createWallet([user.account.address]);
    const smartWalletAddress = await factory.read.ownerToWallet([user.account.address]);
    
    // Get SmartWallet contract instance
    smartWallet = await viem.getContractAt("SmartWallet", smartWalletAddress);

    // Fund SmartWallet with PYUSD
    await pyusd.write.mint([smartWallet.address, 1000n * 10n**6n]); // 1000 PYUSD

    const balance = await pyusd.read.balanceOf([smartWallet.address]);
    assert.equal(balance, 1000n * 10n**6n);
    
    console.log("✅ SmartWallet created at:", smartWallet.address);
    console.log("   Initial PYUSD balance:", balance.toString());
  });

  it("Should execute operation on SmartWallet with valid signature", async function () {
    // Prepare transfer data
    const recipient = owner.account.address;
    const transferAmount = 50n * 10n**6n; // 50 PYUSD
    
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
    const nonce = await eoaDelegation.read.getNonce([user.account.address]);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now
    const chainId = 31337n; // Hardhat chain ID

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
        args: [smartWallet.address, executeData, nonce, deadline, chainId]
      })
    );

    // Sign with user's private key
    const signature = await user.signMessage({
      message: { raw: messageHash }
    });

    // Execute via EOADelegation
    await eoaDelegation.write.executeOnSmartWallet([
      smartWallet.address,
      executeData,
      nonce,
      deadline,
      signature
    ]);

    // Verify transfer happened
    const recipientBalance = await pyusd.read.balanceOf([recipient]);
    assert.equal(recipientBalance, transferAmount);
    
    console.log("✅ Operation executed successfully");
    console.log("   Recipient balance:", recipientBalance.toString());
  });

  it("Should reject operation with invalid signature", async function () {
    const executeData = encodeFunctionData({
      abi: smartWallet.abi,
      functionName: "execute",
      args: [pyusd.address, 0n, "0x"]
    });

    const nonce = await eoaDelegation.read.getNonce([user.account.address]);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

    // Sign with wrong account (owner instead of user)
    const messageHash = keccak256(
      encodeFunctionData({
        abi: [{ 
          type: "function", 
          name: "encode", 
          inputs: [
            { type: "address" },
            { type: "bytes" },
            { type: "uint256" },
            { type: "uint256" },
            { type: "uint256" }
          ] 
        }],
        functionName: "encode",
        args: [smartWallet.address, executeData, nonce, deadline, 31337n]
      })
    );

    const wrongSignature = await owner.signMessage({
      message: { raw: messageHash }
    });

    // Should revert
    try {
      await eoaDelegation.write.executeOnSmartWallet([
        smartWallet.address,
        executeData,
        nonce,
        deadline,
        wrongSignature
      ]);
      assert.fail("Should have reverted with invalid signature");
    } catch (error: any) {
      assert.ok(error.message.includes("InvalidSignature"));
      console.log("✅ Correctly rejected invalid signature");
    }
  });

  it("Should reject operation with expired deadline", async function () {
    const executeData = encodeFunctionData({
      abi: smartWallet.abi,
      functionName: "execute",
      args: [pyusd.address, 0n, "0x"]
    });

    const nonce = await eoaDelegation.read.getNonce([user.account.address]);
    const expiredDeadline = BigInt(Math.floor(Date.now() / 1000) - 3600); // 1 hour ago

    const messageHash = keccak256(
      encodeFunctionData({
        abi: [{ 
          type: "function", 
          name: "encode", 
          inputs: [
            { type: "address" },
            { type: "bytes" },
            { type: "uint256" },
            { type: "uint256" },
            { type: "uint256" }
          ] 
        }],
        functionName: "encode",
        args: [smartWallet.address, executeData, nonce, expiredDeadline, 31337n]
      })
    );

    const signature = await user.signMessage({
      message: { raw: messageHash }
    });

    // Should revert
    try {
      await eoaDelegation.write.executeOnSmartWallet([
        smartWallet.address,
        executeData,
        nonce,
        expiredDeadline,
        signature
      ]);
      assert.fail("Should have reverted with expired deadline");
    } catch (error: any) {
      assert.ok(error.message.includes("ExpiredDeadline"));
      console.log("✅ Correctly rejected expired deadline");
    }
  });

  it("Should reject operation with invalid nonce", async function () {
    const executeData = encodeFunctionData({
      abi: smartWallet.abi,
      functionName: "execute",
      args: [pyusd.address, 0n, "0x"]
    });

    const wrongNonce = 999n; // Wrong nonce
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

    const messageHash = keccak256(
      encodeFunctionData({
        abi: [{ 
          type: "function", 
          name: "encode", 
          inputs: [
            { type: "address" },
            { type: "bytes" },
            { type: "uint256" },
            { type: "uint256" },
            { type: "uint256" }
          ] 
        }],
        functionName: "encode",
        args: [smartWallet.address, executeData, wrongNonce, deadline, 31337n]
      })
    );

    const signature = await user.signMessage({
      message: { raw: messageHash }
    });

    // Should revert
    try {
      await eoaDelegation.write.executeOnSmartWallet([
        smartWallet.address,
        executeData,
        wrongNonce,
        deadline,
        signature
      ]);
      assert.fail("Should have reverted with invalid nonce");
    } catch (error: any) {
      assert.ok(error.message.includes("InvalidNonce"));
      console.log("✅ Correctly rejected invalid nonce");
    }
  });

  it("Should increment nonce after successful execution", async function () {
    const initialNonce = await eoaDelegation.read.getNonce([user.account.address]);
    
    const executeData = encodeFunctionData({
      abi: smartWallet.abi,
      functionName: "execute",
      args: [pyusd.address, 0n, "0x"]
    });

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

    const messageHash = keccak256(
      encodeFunctionData({
        abi: [{ 
          type: "function", 
          name: "encode", 
          inputs: [
            { type: "address" },
            { type: "bytes" },
            { type: "uint256" },
            { type: "uint256" },
            { type: "uint256" }
          ] 
        }],
        functionName: "encode",
        args: [smartWallet.address, executeData, initialNonce, deadline, 31337n]
      })
    );

    const signature = await user.signMessage({
      message: { raw: messageHash }
    });

    await eoaDelegation.write.executeOnSmartWallet([
      smartWallet.address,
      executeData,
      initialNonce,
      deadline,
      signature
    ]);

    const newNonce = await eoaDelegation.read.getNonce([user.account.address]);
    assert.equal(newNonce, initialNonce + 1n);
    
    console.log("✅ Nonce incremented correctly");
    console.log("   Initial nonce:", initialNonce.toString());
    console.log("   New nonce:", newNonce.toString());
  });
});
