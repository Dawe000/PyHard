# Hardhat Integration Usage

## Configuration Files
- **`smartwallet/hardhat.config.ts:1-63`** - Main Hardhat configuration with Viem plugin
- **`smartwallet/hardhat.config.ts:6-7`** - Viem toolbox plugin integration
- **`smartwallet/hardhat.config.ts:8-30`** - Solidity compiler configuration
- **`smartwallet/hardhat.config.ts:31-60`** - Network configurations (hardhat, sepolia, arbitrumSepolia)

## Deployment Scripts
- **`smartwallet/scripts/deploy-arbitrum-sepolia.ts:1-61`** - Main deployment script
- **`smartwallet/scripts/deploy-updated-smartwallet.ts:1-59`** - Updated SmartWallet deployment
- **`smartwallet/scripts/deploy-fixed-smartwallet.ts:1-31`** - Fixed SmartWallet deployment
- **`smartwallet/scripts/deploy-updated-eoa-delegation.ts:1-39`** - EOA Delegation deployment
- **`smartwallet/scripts/deploy-eoa-delegation-v2.ts:1-48`** - EOA Delegation V2 deployment
- **`smartwallet/scripts/create-user-wallet-final.ts:1-84`** - User wallet creation script

## Hardhat Commands Usage
- **`smartwallet/README.md:99`** - `npx hardhat compile`
- **`smartwallet/README.md:144`** - `npx hardhat test solidity`
- **`smartwallet/README.md:150`** - `npx hardhat test nodejs`
- **`smartwallet/README.md:156`** - `npx hardhat test`
- **`smartwallet/README.md:162`** - `npx hardhat coverage`
- **`smartwallet/README.md:170`** - `npx hardhat ignition deploy ignition/modules/SmartWallet.ts`
- **`smartwallet/README.md:176`** - `npx hardhat ignition deploy --network sepolia`
- **`smartwallet/README.md:182`** - `npx hardhat ignition deploy --network mainnet`
- **`smartwallet/README.md:325`** - `npx hardhat verify --network sepolia`

## Network Configuration
- **`smartwallet/hardhat.config.ts:32-38`** - Hardhat local network with EIP-7702 support
- **`smartwallet/hardhat.config.ts:47-52`** - Sepolia testnet configuration
- **`smartwallet/hardhat.config.ts:53-59`** - Arbitrum Sepolia configuration

## Contract Deployment
- **`smartwallet/scripts/deploy-arbitrum-sepolia.ts:7-8`** - Network connection via Hardhat
- **`smartwallet/scripts/deploy-arbitrum-sepolia.ts:25-27`** - EOADelegation deployment
- **`smartwallet/scripts/deploy-arbitrum-sepolia.ts:30-32`** - EIP7702Paymaster deployment
- **`smartwallet/scripts/deploy-arbitrum-sepolia.ts:35-37`** - SmartWalletFactory deployment
- **`smartwallet/scripts/deploy-updated-smartwallet.ts:7-8`** - Network connection
- **`smartwallet/scripts/deploy-updated-smartwallet.ts:26`** - SmartWalletFactory deployment
- **`smartwallet/scripts/deploy-updated-smartwallet.ts:34`** - createWallet function call

## Testing Framework
- **`smartwallet/ignition/modules/Counter.ts:1`** - Hardhat Ignition module
- **`smartwallet/package.json`** - Hardhat dependencies and scripts
