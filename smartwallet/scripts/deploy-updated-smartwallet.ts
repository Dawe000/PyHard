import { parseEther } from "viem";
import { network } from "hardhat";

async function main() {
  console.log("🚀 Deploying Updated SmartWallet to Arbitrum Sepolia...");
  
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

  // Use real PYUSD token on Arbitrum Sepolia
  console.log("\n📦 Using real PYUSD token...");
  const pyusdAddress = "0x637A1259C6afd7E3AdF63993cA7E58BB438aB1B1";
  console.log("✅ PYUSD address:", pyusdAddress);

  // Deploy SmartWalletFactory (this will use the updated SmartWallet contract)
  console.log("\n📦 Deploying SmartWalletFactory with updated SmartWallet...");
  const factory = await viem.deployContract("SmartWalletFactory", [pyusdAddress]);
  console.log("✅ SmartWalletFactory deployed to:", factory.address);

  // Create a test SmartWallet instance
  console.log("\n📦 Creating test SmartWallet instance...");
  const userAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Test user EOA
  
  // Call createWallet function on factory
  const createWalletTx = await factory.write.createWallet([userAddress]);
  console.log("✅ SmartWallet creation transaction:", createWalletTx);
  
  // Wait for transaction to be mined
  const receipt = await publicClient.waitForTransactionReceipt({ hash: createWalletTx });
  console.log("✅ SmartWallet created in block:", receipt.blockNumber);
  
  // Get the SmartWallet address from the event
  const smartWalletAddress = await factory.read.getWallet([userAddress]);
  console.log("✅ SmartWallet address:", smartWalletAddress);

  console.log("\n🎉 Deployment Summary:");
  console.log("📍 Deployer:", deployer.account.address);
  console.log("🔗 Network: Arbitrum Sepolia");
  console.log("📦 PYUSD:", pyusdAddress);
  console.log("🏭 SmartWalletFactory:", factory.address);
  console.log("👤 Test SmartWallet:", smartWalletAddress);
  console.log("👤 Test User EOA:", userAddress);

  console.log("\n📋 Update your tests with:");
  console.log(`SMART_WALLET_ADDRESS = "${smartWalletAddress}"`);
  console.log(`SMART_WALLET_FACTORY_ADDRESS = "${factory.address}"`);
  console.log(`PYUSD_ADDRESS = "${pyusdAddress}"`);
  console.log(`USER_ADDRESS = "${userAddress}"`);
  console.log(`RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
