# Blockscout Integration Usage

## API Base URLs
**Primary API: `https://arbitrum-sepolia.blockscout.com/api`**
**V2 API: `https://arbitrum-sepolia.blockscout.com/api/v2`**

### Mobile App (`pyhard-app`)
- **`services/blockscoutService.ts:4`** - BLOCKSCOUT_API_BASE constant
- **`services/blockscoutService.ts:48`** - ETH balance API call
- **`services/blockscoutService.ts:82`** - Token balance API call
- **`services/blockscoutService.ts:118`** - Transaction list API call
- **`services/blockscoutService.ts:153`** - Token transfers API call
- **`services/blockscoutService.ts:201`** - V2 API for PYUSD transfers
- **`services/blockscoutService.ts:235`** - Internal transactions API call
- **`services/blockscoutService.ts:264`** - Transaction details API call
- **`services/blockscoutService.ts:292`** - Transaction status API call
- **`services/blockscoutService.ts:346`** - Transaction explorer URL
- **`services/blockscoutService.ts:353`** - Address explorer URL
- **`services/blockscoutService.ts:365`** - Polling for new transactions
- **`components/BalanceScreen.tsx:165`** - Balance fetching via Blockscout
- **`components/SubAccountsScreen.tsx:332`** - PYUSD transfers from Blockscout

### Child App (`pyhard-child-app`)
- **`services/transactionHistoryService.ts:16`** - BLOCKSCOUT_API_BASE for V2 API
- **`services/transactionHistoryService.ts:32`** - Token transfers API call
- **`services/transactionHistoryService.ts:51`** - Transaction details API call
- **`services/subWalletDetection.ts:48`** - Event logs API for wallet creation
- **`services/subWalletDetection.ts:79`** - Event logs API for sub-wallet creation

### Vendor SDK (`pyhard-vendor-sdk`)
- **`src/constants.ts:22`** - BLOCKSCOUT_API_URL constant
- **`src/utils/blockscout.ts:18`** - Subscription fetching from Blockscout
- **`src/utils/formatting.ts:96`** - Transaction explorer URL
- **`src/utils/formatting.ts:103`** - Address explorer URL

### Paymaster (`paymaster-cf-worker`)
- **`src/index.ts:1224`** - BLOCKSCOUT_API for transaction verification
- **`src/index.ts:1297`** - BLOCKSCOUT_API for payment detection

### Website (`pyhard-website`)
- **`README.md:211`** - Environment variable for Blockscout URL
- **`data/docs.json:433`** - Blockscout URL in configuration interface
- **`data/docs.json:922`** - Blockscout URL in PyHardConfig interface
