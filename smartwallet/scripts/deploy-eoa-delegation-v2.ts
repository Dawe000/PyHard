import { network } from "hardhat";

async function main() {
  console.log("🚀 Deploying EOADelegation V2 with authorized paymaster support...");

  const { viem } = await network.connect();
  const wallets = await viem.getWalletClients();
  const deployer = wallets[0];
  console.log("📍 Deployer address:", deployer.account.address);

  // Get the contract bytecode and ABI
  const contractArtifact = await import("../artifacts/contracts/EOADelegation.sol/EOADelegation.json");
  const bytecode = contractArtifact.default.bytecode;
  const abi = contractArtifact.default.abi;

  // Deploy the contract
  const hash = await deployer.deployContract({
    abi: abi,
    bytecode: bytecode as `0x${string}`,
  });
  
  console.log("✅ EOADelegation V2 deployment transaction:", hash);
  
  // Wait for deployment
  const publicClient = await viem.getPublicClient();
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const address = receipt.contractAddress;
  console.log("✅ EOADelegation V2 deployed to:", address);
  
  // Get the paymaster address (from our CF Worker)
  const paymasterAddress = "0x53Cd866553b78a32060b70e764D31b0FE3Afe52C";
  
  // Authorize the paymaster
  console.log("🔐 Authorizing paymaster:", paymasterAddress);
  const authorizeTx = await deployer.writeContract({
    address: address!,
    abi: abi,
    functionName: "addAuthorizedPaymaster",
    args: [paymasterAddress as `0x${string}`],
  });
  
  await publicClient.waitForTransactionReceipt({ hash: authorizeTx });
  console.log("✅ Paymaster authorized");
  
  console.log("🎉 Deployment complete!");
  console.log("📝 Update wrangler.toml with new address:", address);
  console.log("📝 New EOA_DELEGATION_ADDRESS =", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
