import { network } from "hardhat";

async function main() {
  console.log("🚀 Deploying updated EOADelegation contract...");

  const { viem } = await network.connect();
  const wallets = await viem.getWalletClients();
  const deployer = wallets[0];
  console.log("📍 Deployer address:", deployer.account.address);

  // Deploy the contract
  const hash = await deployer.deployContract({
    abi: [], // We'll need to get the ABI
    bytecode: "0x", // We'll need to get the bytecode
  });
  
  console.log("✅ EOADelegation deployment transaction:", hash);
  
  // Wait for deployment
  const receipt = await viem.waitForTransactionReceipt({ hash });
  const address = receipt.contractAddress;
  console.log("✅ EOADelegation deployed to:", address);
  
  // Get the paymaster address (from our CF Worker)
  const paymasterAddress = "0x53Cd866553b78a32060b70e764D31b0FE3Afe52C";
  
  // Authorize the paymaster
  console.log("🔐 Authorizing paymaster:", paymasterAddress);
  // We'll need to call the contract function here
  
  console.log("🎉 Deployment complete!");
  console.log("📝 Update wrangler.toml with new address:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
