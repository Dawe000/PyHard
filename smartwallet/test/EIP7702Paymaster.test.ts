import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseEther } from "viem";
import { network } from "hardhat";

describe("EIP7702Paymaster Unit Tests", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  
  let paymaster: any;
  let owner: any;
  let relayer: any;
  let eoa: any;

  it("Should deploy EIP7702Paymaster contract", async function () {
    // Get wallet clients
    const wallets = await viem.getWalletClients();
    owner = wallets[0];
    relayer = wallets[1];
    eoa = wallets[2];

    // Deploy EIP7702Paymaster with initial funding
    paymaster = await viem.deployContract("EIP7702Paymaster", [], {
      value: parseEther("10") // Fund with 10 ETH
    });

    assert.ok(paymaster.address);
    const balance = await publicClient.getBalance({ address: paymaster.address });
    assert.ok(balance >= parseEther("10"));
    console.log("✅ EIP7702Paymaster deployed at:", paymaster.address);
    console.log("   Initial balance:", balance.toString());
  });

  it("Should whitelist an EOA", async function () {
    await paymaster.write.setEOAWhitelisted([eoa.account.address, true]);
    
    const isWhitelisted = await paymaster.read.whitelistedEOAs([eoa.account.address]);
    assert.equal(isWhitelisted, true);
    
    console.log("✅ EOA whitelisted successfully");
  });

  it("Should remove EOA from whitelist", async function () {
    // First whitelist
    await paymaster.write.setEOAWhitelisted([eoa.account.address, true]);
    assert.equal(await paymaster.read.whitelistedEOAs([eoa.account.address]), true);
    
    // Then remove
    await paymaster.write.setEOAWhitelisted([eoa.account.address, false]);
    assert.equal(await paymaster.read.whitelistedEOAs([eoa.account.address]), false);
    
    console.log("✅ EOA removed from whitelist successfully");
  });

  it("Should batch whitelist multiple EOAs", async function () {
    const wallets = await viem.getWalletClients();
    const eoas = [wallets[3].account.address, wallets[4].account.address, wallets[5].account.address];
    
    await paymaster.write.batchSetEOAWhitelisted([eoas, true]);
    
    for (const eoaAddress of eoas) {
      const isWhitelisted = await paymaster.read.whitelistedEOAs([eoaAddress]);
      assert.equal(isWhitelisted, true);
    }
    
    console.log("✅ Batch whitelisted", eoas.length, "EOAs");
  });

  it("Should add authorized relayer", async function () {
    await paymaster.write.addRelayer([relayer.account.address]);
    
    const isAuthorized = await paymaster.read.authorizedRelayers([relayer.account.address]);
    assert.equal(isAuthorized, true);
    
    console.log("✅ Relayer authorized successfully");
  });

  it("Should remove authorized relayer", async function () {
    // First add
    await paymaster.write.addRelayer([relayer.account.address]);
    assert.equal(await paymaster.read.authorizedRelayers([relayer.account.address]), true);
    
    // Then remove
    await paymaster.write.removeRelayer([relayer.account.address]);
    assert.equal(await paymaster.read.authorizedRelayers([relayer.account.address]), false);
    
    console.log("✅ Relayer removed successfully");
  });

  it("Should accept deposits", async function () {
    const initialBalance = await publicClient.getBalance({ address: paymaster.address });
    
    await paymaster.write.deposit([], { value: parseEther("5") });
    
    const newBalance = await publicClient.getBalance({ address: paymaster.address });
    assert.ok(newBalance > initialBalance);
    
    console.log("✅ Deposit accepted");
    console.log("   Initial balance:", initialBalance.toString());
    console.log("   New balance:", newBalance.toString());
  });

  it("Should allow owner to withdraw funds", async function () {
    const paymasterBalance = await publicClient.getBalance({ address: paymaster.address });
    
    // Withdraw 1 ETH
    await paymaster.write.withdraw([parseEther("1"), owner.account.address]);
    
    const newPaymasterBalance = await publicClient.getBalance({ address: paymaster.address });
    
    assert.ok(newPaymasterBalance < paymasterBalance);
    
    console.log("✅ Withdrawal successful");
    console.log("   Withdrawn amount: 1 ETH");
  });

  it("Should update rate limits", async function () {
    const newMaxGasPerDay = 2000000n;
    const newMinTimeBetweenTx = 30n;
    
    await paymaster.write.updateRateLimits([newMaxGasPerDay, newMinTimeBetweenTx]);
    
    const maxGasPerDay = await paymaster.read.maxGasPerDay();
    const minTimeBetweenTx = await paymaster.read.minTimeBetweenTx();
    
    assert.equal(maxGasPerDay, newMaxGasPerDay);
    assert.equal(minTimeBetweenTx, newMinTimeBetweenTx);
    
    console.log("✅ Rate limits updated");
    console.log("   Max gas per day:", maxGasPerDay.toString());
    console.log("   Min time between tx:", minTimeBetweenTx.toString());
  });

  it("Should pause and unpause", async function () {
    await paymaster.write.pause();
    
    // Try to sponsor transaction while paused (should fail)
    await paymaster.write.addRelayer([relayer.account.address]);
    await paymaster.write.setEOAWhitelisted([eoa.account.address, true]);
    
    try {
      await paymaster.write.sponsorTransaction(
        [eoa.account.address, owner.account.address, 100000n, 1000000000n],
        { account: relayer.account }
      );
      assert.fail("Should have reverted while paused");
    } catch (error: any) {
      assert.ok(error.message.includes("EnforcedPause"));
      console.log("✅ Correctly rejected transaction while paused");
    }
    
    // Unpause
    await paymaster.write.unpause();
    console.log("✅ Unpaused successfully");
  });

  it("Should pre-approve valid transaction", async function () {
    await paymaster.write.setEOAWhitelisted([eoa.account.address, true]);
    
    const [approved, reason] = await paymaster.read.preApproveTransaction([
      eoa.account.address,
      100000n // estimated gas
    ]);
    
    assert.equal(approved, true);
    assert.equal(reason, "");
    
    console.log("✅ Transaction pre-approved");
  });

  it("Should reject pre-approval for non-whitelisted EOA", async function () {
    const wallets = await viem.getWalletClients();
    const nonWhitelistedEOA = wallets[10].account.address;
    
    const [approved, reason] = await paymaster.read.preApproveTransaction([
      nonWhitelistedEOA,
      100000n
    ]);
    
    assert.equal(approved, false);
    assert.equal(reason, "EOA not whitelisted");
    
    console.log("✅ Correctly rejected non-whitelisted EOA");
  });

  it("Should get paymaster balance", async function () {
    const balance = await paymaster.read.getBalance();
    assert.ok(balance > 0n);
    
    console.log("✅ Paymaster balance:", balance.toString());
  });

  it("Should only allow owner to perform admin functions", async function () {
    // Try to whitelist as non-owner
    try {
      await paymaster.write.setEOAWhitelisted(
        [eoa.account.address, true],
        { account: relayer.account }
      );
      assert.fail("Should have reverted");
    } catch (error: any) {
      assert.ok(error.message.includes("OwnableUnauthorizedAccount"));
      console.log("✅ Correctly rejected non-owner admin action");
    }
  });
});
