# PyHard Ecosystem - Complete Documentation

A comprehensive crypto wallet ecosystem that makes blockchain accessible to non-technical users through gasless transactions, QR code payments, social features, and family banking. Built on Arbitrum with PYUSD integration.

## 🚀 Ecosystem Overview

PyHard consists of 6 core components working together to create a seamless crypto experience:

1. **PyHard Mobile App** - Main wallet for users
2. **PyHard Child App** - Sub-wallet app for family members
3. **Paymaster Cloudflare Worker** - Gas sponsorship service
4. **PyHard Vendor SDK** - Integration toolkit for vendors
5. **PyHard Website** - Documentation and demo site
6. **Smart Wallet Contracts** - Core blockchain infrastructure

## 📱 PyHard Mobile App

### Core Features
- **Gasless Transactions**: All transactions sponsored by paymaster
- **PYUSD Native**: Built specifically for PayPal USD stablecoin
- **QR Code Payments**: Generate and scan QR codes for instant payments
- **Social System**: Contact management and social payments
- **Subscription Management**: Manage recurring payments to vendors
- **Sub-Wallet System**: Create and manage family sub-accounts

### Technical Stack
- **React Native + Expo**: Cross-platform mobile development
- **Privy Integration**: Seamless wallet creation and management
- **Arbitrum Sepolia**: Testnet for development
- **EIP-7702**: Advanced account abstraction

### Key Screens
- **Balance Screen**: PYUSD/ETH balance display with quick actions
- **Transactions Screen**: Complete transaction history and contract interactions
- **Sub-Accounts Screen**: Family banking with spending limits and parental controls
- **Profile Screen**: Wallet settings and subscription management

### Setup
```bash
cd pyhard-app
npm install
npm start
```

## 👶 PyHard Child App

### Core Features
- **Child-Friendly Interface**: Simplified design for children
- **Allowance Management**: Track spending limits and balances
- **QR Code Integration**: Scan payment QR codes from vendors
- **Parental Controls**: Complete parental oversight and monitoring
- **Contact Management**: Add and manage contacts for easy payments

### Technical Stack
- **React Native + Expo**: Cross-platform mobile development
- **Viem Integration**: Ethereum interaction library
- **AsyncStorage**: Local data persistence
- **QR Code Support**: Generation and scanning capabilities

### Key Screens
- **Get Started Screen**: QR code display for parent scanning
- **Child Home Screen**: Balance display and quick actions
- **Send Money Screen**: Contact selection and amount input
- **Transaction History Screen**: Complete transaction history
- **Contacts Screen**: Contact management and quick payments

### Setup
```bash
cd pyhard-child-app
npm install
npm start
```

## ⚡ Paymaster Cloudflare Worker

### Core Features
- **Gas Sponsorship**: Sponsors gas for all PYUSD Smart Wallet transactions
- **EIP-7702 Support**: Advanced account abstraction with delegation
- **Signature Verification**: Validates EOA signatures before sponsoring
- **Rate Limiting**: Prevents abuse with intelligent rate limiting

### Technical Stack
- **Cloudflare Workers**: Serverless edge computing
- **TypeScript**: Type-safe development
- **Viem**: Ethereum interaction library
- **ECDSA**: Cryptographic signature verification

### API Endpoints
- **POST /sponsor**: Sponsors user operations with gas fees
- **POST /create-smart-wallet**: Creates new smart wallets
- **GET /health**: Health check endpoint for monitoring

### Setup
```bash
cd paymaster-cf-worker
npm install
npm run dev
```

## 🛠️ PyHard Vendor SDK

### Core Features
- **Payment Integration**: Accept PYUSD stablecoin payments
- **QR Code Generation**: Generate payment and subscription QR codes
- **Subscription Management**: Create and manage recurring payments
- **Real-time Data**: Automatically detect new payments
- **Flexible UI**: Styled and headless component options

### Technical Stack
- **React 18+**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Viem & Wagmi**: Ethereum interaction
- **Reown AppKit**: Wallet connection
- **Tailwind CSS**: Utility-first CSS framework

### Components
- **WalletConnect**: Connect wallet or enter manual address
- **SubscriptionQRGenerator**: Generate subscription QR codes
- **PaymentQRGenerator**: Generate payment QR codes
- **SubscriptionList**: Display and manage subscriptions
- **PaymentHistory**: Show payment history

### Setup
```bash
npm install pyhard-vendor-sdk
```

## 🌐 PyHard Website

### Core Features
- **Comprehensive Documentation**: Complete PyHard Vendor SDK documentation
- **Interactive Demo**: Live demo using the PyHard Vendor SDK
- **API Reference**: Detailed API documentation with examples
- **Integration Guides**: Step-by-step integration guides

### Technical Stack
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **PyHard Vendor SDK**: Local package integration

### Pages
- **Landing Page**: Main value proposition and features
- **Documentation**: Complete SDK documentation
- **Interactive Demo**: Live demo with wallet connection

### Setup
```bash
cd pyhard-website
npm install
npm run dev
```

## 🔗 Smart Wallet Contracts

### Core Features
- **Account Abstraction**: Advanced smart wallet functionality
- **EIP-7702 Support**: Next-generation account abstraction with delegation
- **Subscription System**: Automated recurring payments to vendors
- **Sub-Wallet System**: Family banking with spending limits and parental controls
- **Multi-signature Support**: Enhanced security with multi-sig capabilities

### Technical Stack
- **Solidity**: Smart contract development
- **Hardhat**: Development framework
- **Foundry**: Testing framework
- **OpenZeppelin**: Security libraries

### Core Contracts
- **SmartWallet.sol**: Main smart wallet with core functionality
- **SmartWalletFactory.sol**: Factory for creating smart wallets
- **EOADelegation.sol**: EIP-7702 delegation contract
- **EIP7702Paymaster.sol**: Paymaster contract for gas sponsorship

### Setup
```bash
cd smartwallet
npm install
npx hardhat compile
```

## 🏆 Bounties & Integrations

### PayPal USD (PYUSD) Integration
**Where we used it:**

**Mobile App (`pyhard-app`):**
- **Balance Screen**: Displays PYUSD balance as primary currency with 6-decimal precision
- **Transaction History**: All transactions show PYUSD amounts and transfers
- **Sub-Account Management**: Family allowances and spending limits in PYUSD
- **Quick Actions**: Send/Receive buttons handle PYUSD transfers
- **Contract Integration**: Direct interaction with PYUSD contract at `0x6c3ea9036406852006290770BEdFcAbA0e23A0e8`

**Child App (`pyhard-child-app`):**
- **Balance Display**: Shows available PYUSD allowance from parent
- **Send Money Screen**: Transfers PYUSD to contacts and vendors
- **Transaction History**: Tracks PYUSD spending and receipts
- **QR Code Payments**: Generates QR codes for PYUSD payments

**Vendor SDK (`pyhard-vendor-sdk`):**
- **Payment Processing**: Accepts PYUSD payments from customers
- **Subscription Management**: Recurring PYUSD payments to vendors
- **QR Code Generation**: Creates PYUSD payment and subscription QR codes for instant payments
- **Payment Detection**: Monitors PYUSD payment events via Blockscout
- **NPM Package**: Available at [https://www.npmjs.com/package/pyhard-vendor-sdk](https://www.npmjs.com/package/pyhard-vendor-sdk)

**Smart Contracts (`smartwallet`):**
- **SmartWallet.sol**: Core contract holds and manages PYUSD tokens
- **Subscription System**: Automated PYUSD transfers to vendors
- **Sub-Wallet System**: PYUSD allowances and spending limits
- **Transfer Functions**: `transferPYUSD()` for direct PYUSD transfers

**Paymaster (`paymaster-cf-worker`):**
- **Gas Sponsorship**: Sponsors gas for PYUSD transactions
- **Transaction Validation**: Validates PYUSD transfer operations
- **PYUSD Integration**: References PYUSD contract in transaction execution

**Ecosystem Integration:**
- **Vendor Onboarding**: Complete ecosystem for vendors to accept PYUSD payments
- **QR Code System**: Generate payment and subscription QR codes for instant transactions
- **Subscription Management**: Automated recurring payments to vendors
- **Payment Processing**: Real-time payment processing with gasless transactions
- **Vendor SDK**: Easy integration for vendors via [PyHard Vendor SDK](https://www.npmjs.com/package/pyhard-vendor-sdk)

### Hardhat Integration
**Where we used it:**

**Smart Contract Development (`smartwallet`):**
- **Contract Compilation**: Compiles all Solidity contracts with optimization
- **Testing Framework**: Unit tests for SmartWallet, Factory, and Paymaster contracts
- **Deployment Scripts**: Automated deployment to Arbitrum Sepolia testnet
- **TypeScript Integration**: Type-safe contract interactions with Viem
- **Plugin Integration**: OpenZeppelin contracts, Foundry testing, and security tools

**Development Workflow:**
- **Local Testing**: `npx hardhat test` for contract testing
- **Network Configuration**: Sepolia RPC integration for testnet deployment
- **Gas Optimization**: Contract optimization for efficient gas usage
- **Security Auditing**: Integration with security analysis tools

### Blockscout Integration
**Where we used it:**

**Vendor SDK (`pyhard-vendor-sdk`):**
- **Payment Detection**: `usePaymentDetection` hook polls Blockscout API for new PYUSD payments
- **Transaction Monitoring**: Real-time monitoring of subscription payments
- **Event Filtering**: Filters for `PaymentExecuted` events from smart contracts
- **Payment History**: `usePaymentHistory` hook fetches transaction data from Blockscout
- **API Endpoints**: RESTful calls to Blockscout API for transaction data

**Mobile App (`pyhard-app`):**
- **Transaction Updates**: Pulls latest transaction data from Blockscout
- **Balance Synchronization**: Updates PYUSD balances from blockchain state
- **Payment Confirmation**: Confirms transaction status via Blockscout
- **History Display**: Shows transaction history from Blockscout data

**Child App (`pyhard-child-app`):**
- **Transaction Tracking**: Monitors child wallet transactions via Blockscout
- **Spending Monitoring**: Tracks PYUSD spending against limits
- **Parent Notifications**: Real-time updates for parent oversight

**Paymaster (`paymaster-cf-worker`):**
- **Transaction Verification**: Verifies transaction success via Blockscout
- **Gas Usage Tracking**: Monitors gas consumption for sponsored transactions
- **Error Handling**: Checks transaction status for failed operations

## 🔄 System Architecture

### Data Flow
```
User Transaction → Smart Wallet → Paymaster API → Gas Sponsorship
                ↓
Vendor SDK → QR Code Generation → Payment Processing → Blockscout Monitoring
```

### Component Integration
- **Mobile App** ↔ **Smart Contracts**: Direct interaction via EIP-7702
- **Child App** ↔ **Parent Wallet**: QR code-based connection
- **Vendor SDK** ↔ **Paymaster**: Gas sponsorship for transactions
- **Website** ↔ **Vendor SDK**: Live demo integration
- **All Components** ↔ **Blockscout**: Transaction monitoring

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Git
- Expo CLI (for mobile apps)
- Hardhat (for smart contracts)
- Cloudflare account (for paymaster)

### Quick Start
1. **Clone the repository**
```bash
git clone <repository-url>
cd ethglobalonline2025
```

2. **Install dependencies for each component**
```bash
# Mobile app
cd pyhard-app && npm install

# Child app
cd pyhard-child-app && npm install

# Paymaster
cd paymaster-cf-worker && npm install

# Vendor SDK
cd pyhard-vendor-sdk && npm install

# Website
cd pyhard-website && npm install

# Smart contracts
cd smartwallet && npm install
```

3. **Configure environment variables**
- Set up Privy credentials for mobile apps
- Configure Cloudflare for paymaster
- Set up RPC endpoints for blockchain interaction

4. **Start development**
```bash
# Mobile apps
npm start

# Paymaster
npm run dev

# Website
npm run dev

# Smart contracts
npx hardhat compile
```

## 🔐 Security Features

### Wallet Security
- **Privy Integration**: Secure wallet management
- **Private Key Protection**: Keys stored securely by Privy
- **Biometric Authentication**: Fingerprint/Face ID support
- **Transaction Signing**: Secure transaction signing process

### Smart Contract Security
- **Access Control**: Owner-only functions for critical operations
- **Signature Verification**: ECDSA validation for all transactions
- **Nonce Protection**: Prevents replay attacks
- **Rate Limiting**: Prevents abuse and spam

### Sub-Wallet Security
- **Spending Limits**: Hard limits enforced by smart contracts
- **Parental Controls**: Complete parental oversight
- **Transaction Monitoring**: Real-time monitoring of all transactions
- **Emergency Controls**: Instant account suspension

## 🧪 Testing

### Testnet Configuration
- **Arbitrum Sepolia**: Primary testnet for development
- **Test PYUSD**: Use testnet PYUSD tokens
- **Test ETH**: Use testnet ETH for gas
- **Mock Data**: Test with mock transaction data

### Testing Strategy
- **Unit Tests**: Individual component testing
- **Integration Tests**: Cross-component testing
- **End-to-End Tests**: Complete workflow testing
- **Security Tests**: Security vulnerability testing

## 🔮 Future Enhancements

### Planned Features
- **Mainnet Deployment**: Production deployment on mainnet
- **Advanced Analytics**: Enhanced analytics and reporting
- **Push Notifications**: Real-time transaction alerts
- **Internationalization**: Multi-language support

### Technical Improvements
- **Gas Optimization**: Further gas optimizations
- **Performance**: Enhanced performance and scalability
- **Security Audits**: Professional security audits
- **Protocol Upgrades**: Latest protocol integrations

## 📊 Ecosystem Benefits

### For Users
- **Zero Gas Fees**: Never pay gas fees for transactions
- **Simple Interface**: PayPal-style UX for easy adoption
- **Family Banking**: Complete family financial management
- **Social Features**: Easy payments to contacts and friends

### For Vendors
- **Easy Integration**: Simple SDK integration
- **Recurring Payments**: Automated subscription management
- **Real-time Processing**: Instant payment processing
- **Analytics**: Comprehensive payment analytics

### For Developers
- **Open Source**: Complete open source ecosystem
- **Well Documented**: Comprehensive documentation
- **Type Safe**: Full TypeScript support
- **Modular**: Use individual components as needed

## 🛠️ Development

### Key Technologies
- **Frontend**: React Native, Next.js, TypeScript
- **Backend**: Cloudflare Workers, Node.js
- **Blockchain**: Solidity, Hardhat, Viem
- **Infrastructure**: Arbitrum, PYUSD, Blockscout

### Development Workflow
1. **Smart Contracts**: Develop and test contracts
2. **Paymaster**: Deploy and configure paymaster
3. **Mobile Apps**: Develop and test mobile applications
4. **Vendor SDK**: Develop and test SDK components
5. **Website**: Develop documentation and demo
6. **Integration**: Test complete ecosystem integration

## 📞 Support

For issues or questions:
1. Check the documentation for each component
2. Verify configuration and environment variables
3. Check network connectivity and RPC endpoints
4. Review console logs for debugging information
5. Contact the development team

---

**Note**: This is a comprehensive crypto wallet ecosystem designed to make blockchain accessible to non-technical users. All components work together to provide a seamless, gasless, and user-friendly crypto experience.
