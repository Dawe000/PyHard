import { network } from "hardhat";

async function main() {
  console.log("🚀 Deploying updated EOADelegation contract...");

  const { viem } = await network.connect();
  const wallets = await viem.getWalletClients();
  const deployer = wallets[0];
  console.log("📍 Deployer address:", deployer.account.address);

  // Check balance
  const publicClient = await viem.getPublicClient();
  const balance = await publicClient.getBalance({
    address: deployer.account.address,
  });
  console.log("💰 Deployer balance:", balance / BigInt(10**18), "ETH");

  // Deploy EOADelegation contract
  console.log("\n📦 Deploying EOADelegation contract...");
  const eoaDelegation = await viem.deployContract("EOADelegation");
  console.log("✅ EOADelegation deployed to:", eoaDelegation.address);
  
  // Get the paymaster address (from our CF Worker)
  const paymasterAddress = "0x53Cd866553b78a32060b70e764D31b0FE3Afe52C";
  
  // Authorize the paymaster
  console.log("🔐 Authorizing paymaster:", paymasterAddress);
  const authTx = await eoaDelegation.write.addAuthorizedPaymaster([paymasterAddress]);
  console.log("✅ Paymaster authorization transaction:", authTx);
  
  // Wait for authorization
  await publicClient.waitForTransactionReceipt({ hash: authTx });
  console.log("✅ Paymaster authorized successfully");
  
  console.log("\n🎉 Deployment complete!");
  console.log("📝 Update your app with:");
  console.log(`EOADelegation_ADDRESS = "${eoaDelegation.address}"`);
  console.log(`AUTHORIZED_PAYMASTER = "${paymasterAddress}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
