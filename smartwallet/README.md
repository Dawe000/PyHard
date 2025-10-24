# PyHard Smart Wallet Contracts

A comprehensive smart wallet system built on Ethereum with advanced account abstraction, subscription management, sub-wallet functionality, and EIP-7702 delegation support. This system enables gasless transactions, family banking, and seamless crypto UX for non-technical users.

## 🚀 Key Features

### 💳 Smart Wallet Core
- **Account Abstraction**: Advanced smart wallet functionality
- **EIP-7702 Support**: Next-generation account abstraction with delegation
- **Multi-signature Support**: Enhanced security with multi-sig capabilities
- **Batch Transactions**: Execute multiple operations in one transaction

### 💰 Subscription System
- **Recurring Payments**: Automated recurring payments to vendors
- **Subscription Management**: Create, cancel, and manage subscriptions
- **Payment Execution**: Automatic payment execution when due
- **Vendor Integration**: Seamless integration with vendor systems

### 👨‍👩‍👧‍👦 Sub-Wallet System
- **Family Banking**: Create and manage sub-accounts for family members
- **Spending Limits**: Set and enforce spending limits per sub-wallet
- **Parental Controls**: Complete parental oversight and control
- **Allowance Management**: Automated allowance distribution

## 🏗️ Contract Architecture

### Core Contracts

#### SmartWallet.sol
The main smart wallet contract with core functionality:
- **Account Abstraction**: Advanced smart wallet features
- **Subscription Management**: Handle recurring payments
- **Sub-wallet Management**: Manage family sub-accounts

#### SmartWalletFactory.sol
Factory contract for creating smart wallets:
- **Wallet Creation**: Create new smart wallets
- **Deterministic Addressing**: Predictable wallet addresses
- **Access Control**: Manage wallet creation permissions
- **Event Logging**: Track wallet creation events

#### EOADelegation.sol
EIP-7702 delegation contract for gas sponsorship:
- **EOA Delegation**: Delegate EOA execution to smart contracts
- **Gas Sponsorship**: Enable gas sponsorship for transactions
- **Signature Verification**: Validate user signatures
- **Transaction Relaying**: Relay transactions on behalf of users

#### EIP7702Paymaster.sol
Paymaster contract for gas sponsorship:
- **Gas Sponsorship**: Sponsor gas for user transactions
- **Signature Validation**: Validate user signatures
- **Rate Limiting**: Prevent abuse with rate limiting
- **Whitelist Management**: Manage sponsored wallets

### Interface Contracts

#### ISmartWallet.sol
Main interface for smart wallet functionality:
- **Core Functions**: Essential smart wallet functions
- **Subscription Functions**: Subscription management
- **Sub-wallet Functions**: Sub-wallet management
#### IPaymaster.sol
Paymaster interface for gas sponsorship:
- **Sponsorship Functions**: Gas sponsorship methods
- **Validation Functions**: Transaction validation
- **Rate Limiting**: Rate limiting functionality
- **Whitelist Management**: Whitelist management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Hardhat 3.0+
- Foundry (for testing)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd smartwallet
```

2. **Install dependencies**
```bash
npm install
```

3. **Install Foundry**
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

4. **Compile contracts**
```bash
npx hardhat compile
```

## 🔧 Configuration

### Hardhat Configuration
The project uses Hardhat 3.0 with TypeScript support:

```typescript
// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY!]
    }
  }
};
```

### Environment Variables
Create a `.env` file:
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## 🧪 Testing

### Solidity Tests
Run Solidity unit tests:
```bash
npx hardhat test solidity
```

### TypeScript Tests
Run TypeScript integration tests:
```bash
npx hardhat test nodejs
```

### All Tests
Run all tests:
```bash
npx hardhat test
```

### Test Coverage
Generate test coverage report:
```bash
npx hardhat coverage
```

## 🚀 Deployment

### Local Deployment
Deploy to local Hardhat network:
```bash
npx hardhat ignition deploy ignition/modules/SmartWallet.ts
```

### Sepolia Deployment
Deploy to Sepolia testnet:
```bash
npx hardhat ignition deploy --network sepolia ignition/modules/SmartWallet.ts
```

### Mainnet Deployment
Deploy to mainnet:
```bash
npx hardhat ignition deploy --network mainnet ignition/modules/SmartWallet.ts
```

## 🔐 Security Features

### Access Control
- **Ownership**: Owner-only functions for critical operations
- **Multi-signature**: Multi-sig support for enhanced security
- **Role-based Access**: Different access levels for different functions
- **Emergency Controls**: Emergency pause and recovery functions

### Signature Verification
- **ECDSA Validation**: Validate EOA signatures
- **Nonce Protection**: Prevent replay attacks
- **Deadline Checking**: Ensure requests haven't expired
- **Signature Recovery**: Recover signer address from signature

### Rate Limiting
- **Transaction Limits**: Limit number of transactions per period
- **Gas Limits**: Limit gas usage per transaction
- **Abuse Prevention**: Prevent spam and abuse
- **Configurable Limits**: Adjustable rate limits

## 🔄 EIP-7702 Integration

### Account Abstraction
EIP-7702 enables EOAs to delegate their execution to smart contracts:

```solidity
// EOADelegation.sol
contract EOADelegation {
    function executeOnSmartWallet(
        address smartWallet,
        bytes calldata data,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) external {
        // Validate signature
        // Execute on smart wallet
        // Sponsor gas
    }
}
```

### Delegation Flow
1. **User Signs**: User signs transaction with their EOA
2. **Delegation**: EOA delegates to EOADelegation contract
3. **Paymaster Sponsors**: Paymaster sponsors gas for delegation
4. **Execution**: Transaction executes on SmartWallet
5. **Completion**: User receives confirmation

## 💰 Subscription System

### Subscription Creation
```solidity
function createSubscription(
    address vendor,
    uint256 amount,
    uint256 interval
) external returns (uint256) {
    // Create new subscription
    // Set up recurring payments
    // Return subscription ID
}
```

### Payment Execution
```solidity
function executeSubscriptionPayment(uint256 subscriptionId) external {
    // Check if payment is due
    // Execute payment to vendor
    // Update last payment timestamp
    // Emit payment event
}
```

### Subscription Management
- **Creation**: Create new subscriptions
- **Cancellation**: Cancel existing subscriptions
- **Modification**: Modify subscription parameters
- **Monitoring**: Monitor subscription status

## 👨‍👩‍👧‍👦 Sub-Wallet System

### Sub-Wallet Creation
```solidity
function createSubWallet(
    address childEOA,
    uint256 limit,
    uint8 mode,
    uint256 period
) external returns (uint256) {
    // Create new sub-wallet
    // Set spending limits
    // Configure period settings
    // Return sub-wallet ID
}
```

### Spending Limits
```solidity
function executeSubWalletTransaction(
    uint256 subWalletId,
    address to,
    uint256 amount
) external {
    // Check spending limits
    // Execute transaction
    // Update spent amount
    // Emit transaction event
}
```

### Parental Controls
- **Spending Limits**: Set and enforce spending limits
- **Account Pausing**: Pause sub-wallets instantly
- **Transaction Monitoring**: Monitor all sub-wallet transactions
- **Emergency Controls**: Emergency account suspension

## 🌉 Cross-Chain Bridge

### PYUSD Bridging
```solidity
function bridgePYUSD(uint256 amount, uint32 dstChainId) external payable {
    // Lock PYUSD on source chain
    // Send message to destination chain
    // Emit bridge event
}
```

## 🔧 Development

### Key Files
- `contracts/SmartWallet.sol`: Main smart wallet contract
- `contracts/SmartWalletFactory.sol`: Factory contract
- `contracts/EOADelegation.sol`: EIP-7702 delegation contract
- `contracts/EIP7702Paymaster.sol`: Paymaster contract
- `test/`: Test files
- `scripts/`: Deployment scripts

### Development Commands
```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy contracts
npx hardhat ignition deploy ignition/modules/SmartWallet.ts

# Verify contracts
npx hardhat verify --network sepolia <contract_address>
```

## 📊 Gas Optimization

### Optimizations
- **Batch Operations**: Batch multiple operations
- **Gas Estimation**: Accurate gas estimation
- **Optimized Storage**: Efficient storage patterns
- **Function Optimization**: Optimized function implementations

### Gas Usage
- **Smart Wallet Creation**: ~200,000 gas
- **Subscription Creation**: ~50,000 gas
- **Payment Execution**: ~30,000 gas
- **Sub-wallet Transaction**: ~40,000 gas

## 🔮 Future Enhancements

### Planned Features
- **Advanced Analytics**: Enhanced analytics and monitoring
- **Gas Optimization**: Further gas optimizations
- **Security Audits**: Professional security audits

### Protocol Upgrades
- **EIP-7702**: Full EIP-7702 implementation
- **Account Abstraction**: Enhanced account abstraction
- **Security**: Enhanced security features
