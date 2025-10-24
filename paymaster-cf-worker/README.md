# PyHard Paymaster - Cloudflare Worker

A high-performance Cloudflare Worker that provides gas sponsorship for PyHard Smart Wallet transactions. This paymaster enables gasless transactions for PYUSD Smart Wallets, making crypto accessible to non-technical users by eliminating gas fees.

## 🚀 Key Features

### 💸 Gas Sponsorship
- **Zero Gas Fees**: Sponsors gas for all PYUSD Smart Wallet transactions
- **EIP-7702 Support**: Advanced account abstraction with EIP-7702 delegation
- **Automatic Sponsorship**: Seamless gas sponsorship without user intervention

### 🔐 Security & Validation
- **Signature Verification**: Validates EOA signatures before sponsoring
- **Nonce Protection**: Prevents replay attacks with nonce validation

### ⚡ Performance & Reliability
- **Cloudflare Edge**: Global edge deployment for low latency
- **High Availability**: 99.9% uptime with Cloudflare infrastructure
- **Auto-scaling**: Automatically scales with demand
- **Health Monitoring**: Built-in health checks and monitoring

### 🌐 API Integration
- **RESTful API**: Clean REST API for integration
- **CORS Support**: Cross-origin requests supported
- **JSON Responses**: Standardized JSON response format
- **Error Handling**: Comprehensive error handling and logging

## 🏗️ Technical Architecture

### Core Technologies
- **Cloudflare Workers**: Serverless edge computing
- **TypeScript**: Type-safe development
- **Viem**: Ethereum interaction library
- **ECDSA**: Cryptographic signature verification
- **EIP-7702**: Next-generation account abstraction

### Architecture Flow
```
User Transaction → Smart Wallet → Paymaster API (CF Worker) → Gas Sponsorship
```

The paymaster validates and sponsors transactions that are:
1. **Signed by User's EOA**: Security maintained through signature verification
2. **From Whitelisted Wallets**: Only approved wallets are sponsored
3. **Within Rate Limits**: Prevents abuse with rate limiting
4. **Valid ERC-4337 Operations**: Ensures transaction validity

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Cloudflare account
- Wrangler CLI (`npm install -g wrangler`)
- Private key for paymaster account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd paymaster-cf-worker
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file or set in Cloudflare:
```env
PAYMASTER_PRIVATE_KEY=your_paymaster_private_key
WALLET_FACTORY_ADDRESS=0x...
ENTRY_POINT_ADDRESS=0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
SUPPORTED_CHAINS=["1","42161","8453"]
RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
PYUSD_ADDRESS=0x6c3ea9036406852006290770BEdFcAbA0e23A0e8
```

4. **Deploy to Cloudflare**
```bash
# Development
npm run dev

# Production
npm run deploy
```

## 🔧 Configuration

### Environment Variables
- **PAYMASTER_PRIVATE_KEY**: Private key for paymaster account
- **WALLET_FACTORY_ADDRESS**: Smart wallet factory contract address
- **ENTRY_POINT_ADDRESS**: ERC-4337 entry point address
- **SUPPORTED_CHAINS**: JSON array of supported chain IDs
- **RPC_URL**: RPC endpoint for blockchain interaction
- **PYUSD_ADDRESS**: PYUSD token contract address

### Network Configuration
- **Ethereum Mainnet**: Chain ID 1
- **Arbitrum One**: Chain ID 42161
- **Base Mainnet**: Chain ID 8453
- **Arbitrum Sepolia**: Chain ID 421614 (testnet)

## 📡 API Endpoints

### POST /sponsor
Sponsors a user operation with gas fees.

**Request:**
```json
{
  "eoaAddress": "0x...",
  "smartWalletAddress": "0x...",
  "functionData": "0x...",
  "value": "0",
  "nonce": "0x0",
  "deadline": "1234567890",
  "signature": "0x...",
  "chainId": "421614",
  "subWalletId": 1,
  "recipientAddress": "0x...",
  "amount": "1000000"
}
```

**Response:**
```json
{
  "transactionHash": "0x...",
  "success": true,
  "gasUsed": "21000"
}
```

### POST /create-smart-wallet
Creates a new smart wallet for a user.

**Request:**
```json
{
  "ownerAddress": "0x...",
  "chainId": "421614"
}
```

**Response:**
```json
{
  "smartWalletAddress": "0x...",
  "transactionHash": "0x...",
  "success": true
}
```

### GET /health
Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": 1234567890,
  "version": "1.0.0"
}
```

## 🔐 Security Features

### Signature Verification
- **ECDSA Validation**: Validates EOA signatures before sponsoring
- **Nonce Protection**: Prevents replay attacks with nonce validation
- **Deadline Checking**: Ensures requests haven't expired
- **Signature Recovery**: Recovers signer address from signature

### Whitelist Management
- **Factory Validation**: Only wallets created by factory are whitelisted
- **Address Verification**: Verifies wallet addresses before sponsoring
- **Dynamic Whitelist**: Supports dynamic whitelist updates
- **Access Control**: Role-based access control for whitelist management

### Rate Limiting
- **Per-Wallet Limits**: Rate limiting per wallet address
- **Time Windows**: Sliding window rate limiting
- **Abuse Prevention**: Prevents spam and abuse
- **Configurable Limits**: Adjustable rate limits

## ⚡ Performance Features

### Cloudflare Edge
- **Global Distribution**: Deployed to Cloudflare's global edge network
- **Low Latency**: Sub-100ms response times globally
- **Auto-scaling**: Automatically scales with demand
- **High Availability**: 99.9% uptime guarantee

### Caching
- **Response Caching**: Caches frequent responses
- **Smart Caching**: Intelligent cache invalidation
- **Edge Caching**: Leverages Cloudflare's edge cache
- **Cache Headers**: Proper cache control headers

## 🔄 EIP-7702 Integration

### Account Abstraction
- **EOA Delegation**: EOAs delegate to smart contracts
- **Gas Sponsorship**: Paymaster sponsors gas for delegated calls
- **Transaction Relaying**: Relays transactions on behalf of users
- **Signature Verification**: Validates user signatures

### Delegation Flow
1. **User Signs**: User signs transaction with their EOA
2. **Delegation**: EOA delegates to EOADelegation contract
3. **Paymaster Sponsors**: Paymaster sponsors gas for delegation
4. **Execution**: Transaction executes on SmartWallet
5. **Completion**: User receives confirmation

## 🧪 Testing

### Local Development
```bash
# Start local development server
npm run dev

# Test health endpoint
curl http://localhost:8787/health

# Test sponsorship endpoint
curl -X POST http://localhost:8787/sponsor \
  -H "Content-Type: application/json" \
  -d '{"eoaAddress": "0x...", "smartWalletAddress": "0x...", ...}'
```

### Testnet Configuration
- **Arbitrum Sepolia**: Testnet for development
- **Test PYUSD**: Use testnet PYUSD tokens
- **Test ETH**: Use testnet ETH for gas
- **Mock Data**: Test with mock transaction data

## 📊 Monitoring & Analytics

### Health Monitoring
- **Health Checks**: Regular health check endpoints
- **Uptime Monitoring**: Monitor service availability
- **Error Tracking**: Track and log errors
- **Performance Metrics**: Monitor response times

### Analytics
- **Transaction Volume**: Track sponsored transactions
- **Gas Usage**: Monitor gas consumption
- **Error Rates**: Track error rates and types
- **User Metrics**: Monitor user activity

## 🚀 Deployment

### Cloudflare Workers
1. **Install Wrangler**: `npm install -g wrangler`
2. **Login**: `wrangler login`
3. **Deploy**: `npm run deploy`

### Environment Setup
Set these in Cloudflare Workers dashboard:
- `PAYMASTER_PRIVATE_KEY`: Paymaster private key
- `WALLET_FACTORY_ADDRESS`: Smart wallet factory address
- `ENTRY_POINT_ADDRESS`: ERC-4337 entry point address
- `SUPPORTED_CHAINS`: JSON array of supported chain IDs
- `RPC_URL`: RPC endpoint for blockchain interaction
- `PYUSD_ADDRESS`: PYUSD token contract address

## 🔮 Future Enhancements

### Planned Features
- **Advanced Rate Limiting**: Sliding window rate limiting
- **Analytics Dashboard**: Web dashboard for monitoring
- **Multi-chain Support**: Support for additional chains
- **Advanced Signature Verification**: Support for additional signature types
- **Gas Price Optimization**: Dynamic gas price optimization

### Performance Improvements
- **Transaction Batching**: Batch multiple transactions
- **Gas Estimation**: Improved gas estimation
- **Caching Optimization**: Enhanced caching strategies
- **Edge Computing**: Leverage more edge computing features

## 🛠️ Development

### Key Files
- `src/index.ts`: Main worker entry point
- `src/types.ts`: TypeScript type definitions
- `wrangler.toml`: Cloudflare Workers configuration
- `package.json`: Dependencies and scripts

### Development Commands
```bash
# Start development server
npm run dev

# Deploy to production
npm run deploy

# Build TypeScript
npm run build
```


