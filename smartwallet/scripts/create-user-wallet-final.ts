import { network } from "hardhat";
import { parseEther, createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";

async function main() {
  console.log("🏗️ Creating user wallet using paymaster to pay gas...");
  
  const { viem } = await network.connect();
  
  // Contract addresses from deployment
  const SMART_WALLET_FACTORY_ADDRESS = "0xe16ae63bf10ad8e0522f7b79dc21fdc72f9e86d9";
  const PYUSD_ADDRESS = "0x637A1259C6afd7E3AdF63993cA7E58BB438aB1B1";
  const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";
  
  // User account (Hardhat account #1)
  const userAddress = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
  const userPrivateKey = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
  
  // Paymaster account (your provided key)
  const paymasterPrivateKey = "0x3471db0b3f6db7801ab954a3ba20596a99ae8d4da0b5c8dd1228a118dea3d1a6";
  const paymasterAddress = "0x53cd866553b78a32060b70e764d31b0fe3afe52c";
  
  console.log("👤 User EOA:", userAddress);
  console.log("🔑 User private key:", userPrivateKey);
  console.log("💰 Paymaster EOA:", paymasterAddress);
  
  // Create wallet client for paymaster (who will pay gas)
  const paymasterAccount = privateKeyToAccount(paymasterPrivateKey as `0x${string}`);
  const paymasterWallet = createWalletClient({
    account: paymasterAccount,
    chain: arbitrumSepolia,
    transport: http(RPC_URL)
  });
  
  // Create public client
  const publicClient = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(RPC_URL)
  });
  
  // Get factory contract
  const factory = await viem.getContractAt("SmartWalletFactory", SMART_WALLET_FACTORY_ADDRESS);
  
  // Create SmartWallet for user (paymaster pays gas)
  console.log("📦 Creating SmartWallet...");
  const createTx = await factory.write.createWallet([userAddress], {
    account: paymasterWallet.account
  });
  console.log("✅ SmartWallet creation transaction:", createTx);
  
  // Wait for transaction to be mined
  const receipt = await publicClient.waitForTransactionReceipt({ hash: createTx });
  console.log("✅ Transaction receipt:", receipt);
  
  // Get the SmartWallet address
  const smartWalletAddress = await factory.read.ownerToWallet([userAddress]);
  console.log("🏦 SmartWallet address:", smartWalletAddress);
  
  console.log("\n🎉 User wallet created!");
  console.log("👤 User EOA:", userAddress);
  console.log("🔑 User private key:", userPrivateKey);
  console.log("🏦 SmartWallet:", smartWalletAddress);
  console.log("💰 PYUSD Token:", PYUSD_ADDRESS);
  
  console.log("\n📋 Send PYUSD to SmartWallet address for testing:");
  console.log("   Address:", smartWalletAddress);
  console.log("   Token:", PYUSD_ADDRESS);
  console.log("   Amount: Any amount (e.g., 100 PYUSD)");
  
  console.log("\n📋 Contract addresses for CF Worker:");
  console.log("   EOA_DELEGATION_ADDRESS = \"0x02d6ab26b2b5448a0b123725926c5b9c2bc6faa6\"");
  console.log("   EIP7702_PAYMASTER_ADDRESS = \"0x937884bf26c66d53aeb6a1a3bf02cdbb4bc0d8ee\"");
  console.log("   SMART_WALLET_FACTORY_ADDRESS = \"0xe16ae63bf10ad8e0522f7b79dc21fdc72f9e86d9\"");
  console.log("   PYUSD_ADDRESS = \"0x637A1259C6afd7E3AdF63993cA7E58BB438aB1B1\"");
  console.log("   RPC_URL = \"https://sepolia-rollup.arbitrum.io/rpc\"");
  
  console.log("\n📋 Account Summary:");
  console.log("   👤 User EOA: 0x70997970c51812dc3a010c7d01b50e0d17dc79c8");
  console.log("   🔑 User private key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d");
  console.log("   💰 Paymaster EOA: 0x53cd866553b78a32060b70e764d31b0fe3afe52c");
  console.log("   🔑 Paymaster private key: 0x3471db0b3f6db7801ab954a3ba20596a99ae8d4da0b5c8dd1228a118dea3d1a6");
  console.log("   🏦 SmartWallet: 0x542ad6273ccad9B1950EeAA7252d38Ca4939935e");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
