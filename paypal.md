# PayPal USD (PYUSD) Integration Usage

## Contract Address Usage
**PYUSD Contract Address: `0x637A1259C6afd7E3AdF63993cA7E58BB438aB1B1`**

### Mobile App (`pyhard-app`)
- **`constants/contracts.ts:13`** - PYUSD_ADDRESS constant definition
- **`services/blockscoutService.ts:5`** - PYUSD_CONTRACT_ADDRESS for balance checking
- **`components/BalanceScreen.tsx:40`** - PYUSD_CONTRACT_ADDRESS for balance display
- **`services/sendService.ts:180`** - PYUSD_CONTRACT_ADDRESS for transfer operations
- **`services/transactionHistoryService.ts:7`** - PYUSD_TOKEN_ADDRESS for transaction history

### Child App (`pyhard-child-app`)
- **`services/transactionHistoryService.ts:17`** - PYUSD_TOKEN_ADDRESS for child transaction monitoring

### Vendor SDK (`pyhard-vendor-sdk`)
- **`src/constants.ts:6`** - PYUSD_ADDRESS for payment processing

### Paymaster (`paymaster-cf-worker`)
- **`wrangler.toml:12`** - PYUSD_ADDRESS environment variable
- **`src/index.ts:389`** - PYUSD contract address in transaction execution

### Smart Contracts (`smartwallet`)
- **`scripts/deploy-arbitrum-sepolia.ts:21`** - PYUSD address for factory deployment
- **`scripts/deploy-updated-smartwallet.ts:21`** - PYUSD address for factory deployment
- **`scripts/deploy-fixed-smartwallet.ts:21`** - PYUSD address in deployment script
- **`scripts/create-user-wallet-final.ts:13`** - PYUSD_ADDRESS for wallet creation
- **`scripts/create-user-wallet-final.ts:75`** - PYUSD_ADDRESS in console output

## PYUSD Transfer Function Usage
- **`paymaster-cf-worker/src/index.ts:372`** - transfer function selector `0xa9059cbb`
- **`paymaster-cf-worker/src/index.ts:374-393`** - PYUSD transfer execution logic
- **`pyhard-app/services/sendService.ts:80-81`** - PYUSD transfer encoding with 6 decimals
