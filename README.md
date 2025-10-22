# EIP-7702 Gasless PYUSD Transfer System

A complete implementation of gasless PYUSD transfers using EIP-7702 delegation, with React Native mobile app and Cloudflare Worker paymaster.

## 🎯 **What This Does**

- **Gasless Transactions**: Users pay 0 gas for PYUSD transfers
- **EIP-7702 Delegation**: User's EOA temporarily gets SmartWallet code
- **Paymaster Sponsorship**: Cloudflare Worker pays all gas costs
- **Mobile Integration**: React Native app with Privy authentication

## 🏗️ **Architecture**

```
Mobile App (React Native + Privy)
    ↓ Signs EIP-7702 authorization
Cloudflare Worker (Paymaster)
    ↓ Submits transaction to user's EOA
SmartWallet Contract
    ↓ Executes PYUSD transfer
```

## 📁 **Project Structure**

```
├── smartwallet/                    # Smart contracts & tests
│   ├── contracts/
│   │   ├── SmartWallet.sol         # Main smart wallet contract
│   │   └── SmartWalletFactory.sol  # Factory for creating wallets
│   ├── test/
│   │   ├── EIP7702CorrectFlow.test.ts      # Working EIP-7702 test
│   │   └── EIP7702RealDelegation.test.ts   # Comprehensive test
│   ├── scripts/
│   │   ├── deploy-arbitrum-sepolia.ts      # Deploy to Arbitrum Sepolia
│   │   └── create-user-wallet-final.ts     # Create user wallet
│   └── hardhat.config.ts
├── paymaster-cf-worker/             # Cloudflare Worker (Paymaster)
│   ├── src/index.ts                # Main worker logic
│   └── wrangler.toml               # Worker configuration
└── privy-expo-starter/             # React Native mobile app
    ├── components/SendScreen.tsx    # PYUSD transfer UI
    └── services/sendService.ts     # API integration
```

## 🚀 **How It Works**

### 1. **EIP-7702 Delegation Flow**

```typescript
// 1. User signs EIP-7702 authorization
const authorization = await userWallet.signAuthorization({
  contractAddress: SMART_WALLET_ADDRESS,
  chainId: 421614,
  nonce: 0
});

// 2. Paymaster submits transaction TO USER'S EOA (not SmartWallet!)
const hash = await paymasterWallet.sendTransaction({
  to: userAddress,                    // TO USER'S EOA!
  data: executeData,                  // SmartWallet.execute() call
  authorizationList: [authorization]  // EIP-7702 delegation
});
```

### 2. **Key Technical Insight**

- ✅ **Correct**: Submit transaction to **user's EOA** with authorization
- ❌ **Wrong**: Submit transaction to SmartWallet contract

### 3. **What Happens**

1. User's EOA temporarily gets SmartWallet code
2. Transaction executes as user with SmartWallet logic
3. Paymaster pays gas, user pays 0 gas
4. PYUSD transfer completes successfully

## 🧪 **Testing**

### Run SmartWallet Tests

```bash
cd smartwallet
npx hardhat test test/EIP7702CorrectFlow.test.ts --network arbitrumSepolia
```

### Expected Output

```
🎉 CORRECT EIP-7702 FLOW SUCCESSFUL!
   ✅ User: Signed authorization (0 gas)
   ✅ Paymaster: Paid gas for transaction
   ✅ Transaction executed as: User EOA with SmartWallet code
   ✅ Key: Transaction sent TO user EOA, not SmartWallet
   ✅ Recipient balance: 200 PYUSD
   ✅ SmartWallet balance: 100 PYUSD
```

## 🚀 **Deployment**

### 1. Deploy Smart Contracts

```bash
cd smartwallet
npx hardhat run scripts/deploy-arbitrum-sepolia.ts --network arbitrumSepolia
```

### 2. Deploy Cloudflare Worker

```bash
cd paymaster-cf-worker
npx wrangler deploy
```

### 3. Run Mobile App

```bash
cd privy-expo-starter
npm start
```

## 📋 **Contract Addresses (Arbitrum Sepolia)**

- **SmartWalletFactory**: `0xe16ae63bf10ad8e0522f7b79dc21fdc72f9e86d9`
- **SmartWallet**: `0x188CB9276bb75992A6c1Af2443e293431307382a`
- **PYUSD**: `0x637A1259C6afd7E3AdF63993cA7E58BB438aB1B1`

## 🔧 **Configuration**

### Environment Variables

**CF Worker** (`paymaster-cf-worker/wrangler.toml`):
```toml
PAYMASTER_PRIVATE_KEY = "0x..."
PYUSD_ADDRESS = "0x637A1259C6afd7E3AdF63993cA7E58BB438aB1B1"
SMART_WALLET_FACTORY_ADDRESS = "0xe16ae63bf10ad8e0522f7b79dc21fdc72f9e86d9"
```

**Mobile App** (`privy-expo-starter/app.json`):
```json
{
  "expo": {
    "extra": {
      "privyAppId": "cmgtb4vg702vqld0da5wktriq"
    }
  }
}
```

## ✅ **Success Criteria**

- [x] EIP-7702 authorization signing works
- [x] Paymaster can submit transactions with authorization
- [x] PYUSD transfers execute successfully
- [x] User pays 0 gas, paymaster pays all gas
- [x] Multiple transactions work with nonce increment
- [x] Mobile app integration complete
- [x] End-to-end flow working

## 🎉 **Result**

**Complete gasless PYUSD transfer system using EIP-7702 delegation!**

- Users can transfer PYUSD without paying any gas
- Paymaster covers all transaction costs
- Secure EIP-7702 delegation mechanism
- Mobile app with Privy authentication
- Production-ready implementation

## 📚 **Technical Details**

### EIP-7702 Delegation

EIP-7702 allows EOAs to temporarily delegate their execution to smart contract code. In our implementation:

1. **User signs authorization** → delegates EOA to SmartWallet
2. **Paymaster submits transaction** → to user's EOA with authorization
3. **User's EOA gets SmartWallet code** → for the transaction duration
4. **Transaction executes** → as user with SmartWallet logic
5. **Delegation expires** → after transaction completion

### Why This Works

- **No nested calls**: Direct execution on user's EOA
- **Proper authorization**: `onlyOwner` modifier passes
- **Gas sponsorship**: Paymaster covers all costs
- **Security**: Per-transaction authorization with nonce

This is the **correct and only viable approach** for EIP-7702 gasless transactions with SmartWallets.