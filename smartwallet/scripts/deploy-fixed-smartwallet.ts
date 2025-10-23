import { network } from "hardhat";

async function main() {
  console.log("🚀 Deploying fixed SmartWallet contract with proper EIP-7702 support...");

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

  // Deploy SmartWallet contract
  console.log("\n📦 Deploying SmartWallet contract...");
  const smartWallet = await viem.deployContract("SmartWallet", [
    "0x637A1259C6afd7E3AdF63993cA7E58BB438aB1B1", // PYUSD address
    "0xb8e6187beaa5e11aec0e777b95d031b0f6742462", // Factory address
    deployer.account.address // Owner
  ]);
  console.log("✅ SmartWallet deployed to:", smartWallet.address);

  console.log("\n🎉 Deployment complete!");
  console.log("📝 Update your app with:");
  console.log(`SMART_WALLET_ADDRESS = "${smartWallet.address}"`);
  console.log("📝 This SmartWallet now properly supports EIP-7702 delegation for child accounts");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
