const hre = require('hardhat');
const { parseEther } = require('viem');

async function main() {
  console.log('📦 Deploying contracts for EIP-7702 testing...');
  
  const { viem } = await hre.network.connect();
  
  // Deploy MockPYUSD
  const pyusd = await viem.deployContract('MockPYUSD', []);
  console.log('PYUSD deployed to:', pyusd.address);
  
  // Deploy EOADelegation
  const eoaDelegation = await viem.deployContract('EOADelegation', []);
  console.log('EOADelegation deployed to:', eoaDelegation.address);
  
  // Deploy EIP7702Paymaster
  const paymaster = await viem.deployContract('EIP7702Paymaster', [], {
    value: parseEther('10')
  });
  console.log('EIP7702Paymaster deployed to:', paymaster.address);
  
  // Deploy SmartWalletFactory
  const factory = await viem.deployContract('SmartWalletFactory', [pyusd.address]);
  console.log('SmartWalletFactory deployed to:', factory.address);
  
  console.log('\n📝 Contract addresses for wrangler.toml:');
  console.log(`EOA_DELEGATION_ADDRESS = "${eoaDelegation.address}"`);
  console.log(`EIP7702_PAYMASTER_ADDRESS = "${paymaster.address}"`);
  console.log(`SMART_WALLET_FACTORY_ADDRESS = "${factory.address}"`);
  
  // Save addresses to file
  const fs = require('fs');
  const addresses = {
    PYUSD_ADDRESS: pyusd.address,
    EOA_DELEGATION_ADDRESS: eoaDelegation.address,
    EIP7702_PAYMASTER_ADDRESS: paymaster.address,
    SMART_WALLET_FACTORY_ADDRESS: factory.address
  };
  
  fs.writeFileSync('./deployed-addresses.json', JSON.stringify(addresses, null, 2));
  console.log('\n✅ Addresses saved to deployed-addresses.json');
}

main().catch(console.error);
