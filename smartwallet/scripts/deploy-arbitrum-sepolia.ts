import { parseEther } from "viem";
import { network } from "hardhat";

async function main() {
  console.log("🚀 Deploying to Arbitrum Sepolia...");
  
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

  // Deploy EOADelegation
  console.log("\n📦 Deploying EOADelegation...");
  const eoaDelegation = await viem.deployContract("EOADelegation", []);
  console.log("✅ EOADelegation deployed to:", eoaDelegation.address);

  // Deploy EIP7702Paymaster
  console.log("\n📦 Deploying EIP7702Paymaster...");
  const paymaster = await viem.deployContract("EIP7702Paymaster", []);
  console.log("✅ EIP7702Paymaster deployed to:", paymaster.address);

  // Deploy SmartWalletFactory
  console.log("\n📦 Deploying SmartWalletFactory...");
  const factory = await viem.deployContract("SmartWalletFactory", [pyusdAddress]);
  console.log("✅ SmartWalletFactory deployed to:", factory.address);

  // Fund paymaster with ETH for gas sponsorship
  console.log("\n💰 Funding paymaster with ETH...");
  const fundTx = await deployer.sendTransaction({
    to: paymaster.address,
    value: parseEther("1"), // 1 ETH for gas sponsorship
  });
  console.log("✅ Paymaster funded:", fundTx);

  console.log("\n🎉 Deployment Summary:");
  console.log("📍 Deployer:", deployer.account.address);
  console.log("🔗 Network: Arbitrum Sepolia");
  console.log("📦 PYUSD:", pyusdAddress);
  console.log("🎯 EOADelegation:", eoaDelegation.address);
  console.log("⛽ EIP7702Paymaster:", paymaster.address);
  console.log("🏭 SmartWalletFactory:", factory.address);

  console.log("\n📋 Update your CF Worker wrangler.toml with:");
  console.log(`EIP7702_PAYMASTER_ADDRESS = "${paymaster.address}"`);
  console.log(`EOA_DELEGATION_ADDRESS = "${eoaDelegation.address}"`);
  console.log(`SMART_WALLET_FACTORY_ADDRESS = "${factory.address}"`);
  console.log(`PYUSD_ADDRESS = "${pyusdAddress}"`);
  console.log(`RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
