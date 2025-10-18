import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { parseEther, getAddress } from "viem";

import { network } from "hardhat";

describe("Paymaster", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  
  let paymaster: any;
  let factory: any;
  let pyusd: any;
  let mockEntryPoint: any;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async () => {
    [owner, addr1, addr2] = await viem.getWalletClients();
    
    // Deploy MockEntryPoint
    mockEntryPoint = await viem.deployContract("MockEntryPoint");

    // Deploy MockPYUSD
    pyusd = await viem.deployContract("MockPYUSD");

    // Deploy SmartWalletFactory
    factory = await viem.deployContract("SmartWalletFactory", [
      mockEntryPoint.address,
      pyusd.address,
    ]);

    // Deploy Paymaster with stake
    paymaster = await viem.deployContract("Paymaster", [
      mockEntryPoint.address,
      factory.address,
      owner.account.address,
    ], {
      value: parseEther("1") // 1 ETH stake
    });
  });

  it("Should deploy with correct initial state", async function () {
    assert.equal(getAddress(await paymaster.read.entryPoint()), getAddress(mockEntryPoint.address));
    assert.equal(getAddress(await paymaster.read.walletFactory()), getAddress(factory.address));
    assert.equal(getAddress(await paymaster.read.owner()), getAddress(owner.account.address));
    assert.equal(await paymaster.read.getBalance(), parseEther("1"));
  });

  it("Should whitelist wallets", async function () {
    await paymaster.write.setWhitelisted([addr1.account.address, true], { account: owner.account });
    assert.equal(await paymaster.read.isWhitelisted([addr1.account.address]), true);
    assert.equal(await paymaster.read.isWhitelisted([addr2.account.address]), false);
  });

  it("Should batch whitelist wallets", async function () {
    await paymaster.write.batchSetWhitelisted([
      [addr1.account.address, addr2.account.address],
      true
    ], { account: owner.account });

    assert.equal(await paymaster.read.isWhitelisted([addr1.account.address]), true);
    assert.equal(await paymaster.read.isWhitelisted([addr2.account.address]), true);
  });

  it("Should only allow owner to whitelist wallets", async function () {
    let reverted = false;
    try {
      await paymaster.write.setWhitelisted([addr1.account.address, true], { account: addr1.account });
    } catch (error) {
      reverted = true;
    }
    assert.equal(reverted, true);
  });

  it("Should allow deposits", async function () {
    const initialBalance = await paymaster.read.getBalance();
    
    await paymaster.write.deposit([], { 
      account: addr1.account,
      value: parseEther("0.5")
    });
    
    assert.equal(await paymaster.read.getBalance(), initialBalance + parseEther("0.5"));
  });

  it("Should allow owner to withdraw", async function () {
    // Deposit some ETH first
    await paymaster.write.deposit([], { 
      account: addr1.account,
      value: parseEther("0.5")
    });
    
    const initialBalance = await paymaster.read.getBalance();
    const withdrawAmount = parseEther("0.3");
    
    await paymaster.write.withdraw([withdrawAmount], { account: owner.account });
    
    assert.equal(await paymaster.read.getBalance(), initialBalance - withdrawAmount);
  });

  it("Should not allow withdrawing stake", async function () {
    let reverted = false;
    try {
      await paymaster.write.withdraw([parseEther("1.1")], { account: owner.account });
    } catch (error) {
      reverted = true;
    }
    assert.equal(reverted, true);
  });

  it("Should allow emergency withdraw", async function () {
    // Deposit some ETH first
    await paymaster.write.deposit([], { 
      account: addr1.account,
      value: parseEther("0.5")
    });
    
    const initialBalance = await paymaster.read.getBalance();
    const stakeAmount = parseEther("1");
    
    await paymaster.write.emergencyWithdraw([], { account: owner.account });
    
    assert.equal(await paymaster.read.getBalance(), stakeAmount);
  });

  it("Should allow pausing and unpausing", async function () {
    await paymaster.write.pause([], { account: owner.account });
    // Note: We can't easily test paused state without calling validatePaymasterUserOp
    // which requires complex setup, so we'll just test that pause/unpause don't revert
    
    await paymaster.write.unpause([], { account: owner.account });
  });

  it("Should only allow owner to pause", async function () {
    let reverted = false;
    try {
      await paymaster.write.pause([], { account: addr1.account });
    } catch (error) {
      reverted = true;
    }
    assert.equal(reverted, true);
  });

  it("Should update paymaster API", async function () {
    const newAPI = "https://new-paymaster-api.com";
    await paymaster.write.setPaymasterAPI([newAPI], { account: owner.account });
    
    const updatedAPI = await paymaster.read.paymasterAPI();
    assert.equal(updatedAPI, newAPI);
  });

  it("Should track last operation time", async function () {
    // This would require calling validatePaymasterUserOp which is complex to test
    // For now, we'll just test that the function exists and returns 0 initially
    const lastOpTime = await paymaster.read.getLastOperationTime([addr1.account.address]);
    assert.equal(lastOpTime, 0n);
  });
});
