# PyHard Mobile Wallet App

A revolutionary mobile wallet application that makes crypto accessible for non-technical users through gasless transactions, QR code payments, social features, and family banking. Built with React Native, Expo, and Privy for seamless wallet management.

## 🚀 Key Features

### 💸 Gasless Transactions
- **Zero Gas Fees**: All transactions are sponsored by the PyHard paymaster
- **PYUSD Native**: Built specifically for PayPal USD (PYUSD) stablecoin
- **Arbitrum Network**: Fast and cheap transactions on Arbitrum Sepolia
- **One-Click Payments**: Send money without worrying about gas fees

### 🚀 Walletless Onboarding
- **No Wallet Required**: Users can start using PyHard without any crypto wallet
- **Email/Social Login**: Sign up with email, Google, or social accounts via Privy
- **Automatic Wallet Creation**: Embedded wallets created seamlessly in the background
- **Familiar UX**: PayPal-style experience that non-technical users understand

### 📱 QR Code Payment System
- **Instant Payments**: Generate QR codes for instant payments
- **Subscription QR Codes**: Create recurring payment QR codes for vendors
- **Social Sharing**: Share payment QR codes via social media
- **Offline Payments**: QR codes work even without internet connection

### 👨‍👩‍👧‍👦 Family Banking & Sub-Wallets
- **Sub-Account Management**: Create and manage sub-accounts for family members
- **Spending Limits**: Set monthly/weekly spending limits for children
- **Allowance System**: Automated allowance distribution
- **Parental Controls**: Monitor and control sub-account spending
- **Real-time Monitoring**: Track spending across all sub-accounts

### 🔐 Social & Contact System
- **Contact Management**: Add and manage contacts for easy payments
- **Social Integration**: Connect with friends and family
- **Quick Payments**: Send money to contacts with one tap
- **Transaction History**: Complete transaction history with social context

### 💳 Subscription Management
- **Vendor Subscriptions**: Manage recurring payments to vendors
- **Subscription Dashboard**: View all active subscriptions
- **Payment History**: Track subscription payment history
- **Easy Cancellation**: Cancel subscriptions with one tap

## 🏗️ Technical Architecture

### Core Technologies
- **React Native + Expo**: Cross-platform mobile development
- **Privy Integration**: Seamless wallet creation and management
- **Arbitrum Sepolia**: Testnet for development and testing
- **PYUSD Token**: PayPal USD stablecoin integration
- **EIP-7702**: Advanced account abstraction for gasless transactions

### Key Components

#### Balance Screen
- **PYUSD Balance**: Real-time balance display with pull-to-refresh
- **ETH Balance**: Gas token balance for network operations
- **Quick Actions**: Send, Receive, Swap, and Buy buttons
- **Address Management**: Copy wallet address with one tap
- **Recent Activity**: Quick access to recent transactions

#### Transactions Screen
- **Transaction History**: Complete transaction history with status indicators
- **Contract Interactions**: Smart contract interaction tracking
- **Transaction Details**: Detailed view of each transaction
- **Export Functionality**: Export transaction data

#### Sub-Accounts Screen
- **Account Management**: Create, fund, and manage sub-accounts
- **Spending Limits**: Set and monitor spending limits
- **Account Types**: Family Allowance and Pocket Money accounts
- **Real-time Status**: Active, paused, or inactive account status
- **Parental Controls**: Comprehensive control over child accounts

#### Profile Screen
- **Wallet Settings**: Manage wallet preferences
- **Security Settings**: Configure security options
- **Subscription Management**: Manage vendor subscriptions
- **Account Information**: View and edit account details

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator or Android Emulator
- Privy account and API keys

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd pyhard-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Privy**
Update `app.json` with your Privy credentials:
```json
{
  "expo": {
    "extra": {
      "privyAppId": "your_app_id_here",
      "privyClientId": "your_client_id_here",
      "passkeyAssociatedDomain": "https://your-domain.com"
    }
  }
}
```

4. **Start development server**
```bash
npm start
```

5. **Run on device/simulator**
```bash
# iOS
npm run ios

# Android
npm run android
```

## 🔧 Configuration

### Network Configuration
- **Chain ID**: 421614 (Arbitrum Sepolia)
- **RPC URL**: https://sepolia-rollup.arbitrum.io/rpc
- **PYUSD Contract**: 0x6c3ea9036406852006290770BEdFcAbA0e23A0e8
- **Token Decimals**: 6

### Privy Configuration
- **Authentication**: Email/social login with Privy
- **Embedded Wallets**: Automatic wallet creation
- **Multi-chain Support**: Ethereum, Solana, Bitcoin support
- **Passkey Support**: iOS passkey authentication

## 📱 App Structure

```
Main App
├── Balance Tab (Default)
│   ├── PYUSD Balance Card
│   ├── ETH Balance Card
│   ├── Quick Actions (Send, Receive, Swap, Buy)
│   └── Recent Activity
├── Transactions Tab
│   ├── Transaction History
│   ├── Contract Interactions
│   └── Export Functionality
├── Sub-Accounts Tab
│   ├── Account Management
│   ├── Spending Limits
│   └── Parental Controls
└── Profile Tab
    ├── Wallet Settings
    ├── Security Settings
    └── Subscription Management
```

## 🔐 Security Features

### Wallet Security
- **Privy Integration**: Secure wallet management
- **Private Key Protection**: Keys stored securely by Privy
- **Biometric Authentication**: Fingerprint/Face ID support
- **Transaction Signing**: Secure transaction signing process

### Sub-Account Security
- **Spending Limits**: Hard limits on sub-account spending
- **Parental Controls**: Complete control over child accounts
- **Transaction Monitoring**: Real-time monitoring of all transactions
- **Emergency Controls**: Pause or revoke sub-accounts instantly

## 🎨 User Experience

### PayPal-Style Design
- **Familiar Interface**: PayPal-inspired design for easy adoption
- **Blue Color Scheme**: Professional blue theme (#0070BA)
- **Card-based Layout**: Clean, organized information display
- **Intuitive Navigation**: Bottom tab navigation
- **Responsive Design**: Optimized for all mobile devices

### Accessibility Features
- **Large Touch Targets**: Easy to use on all devices
- **Clear Typography**: Readable fonts and sizes
- **Color Contrast**: High contrast for accessibility
- **Voice Over Support**: Screen reader compatibility

## 🔄 Integration with PyHard Ecosystem

### Paymaster Integration
- **Gas Sponsorship**: All transactions sponsored by PyHard paymaster
- **Zero Gas Fees**: Users never pay gas fees
- **Automatic Sponsorship**: Seamless gas sponsorship
- **Rate Limiting**: Built-in abuse prevention

### Smart Wallet Integration
- **Account Abstraction**: Advanced smart wallet features
- **EIP-7702 Support**: Next-generation account abstraction
- **Multi-signature Support**: Enhanced security options
- **Batch Transactions**: Multiple operations in one transaction

### Vendor SDK Integration
- **QR Code Generation**: Generate payment QR codes
- **Subscription Management**: Manage vendor subscriptions
- **Payment Processing**: Process payments automatically
- **Real-time Updates**: Live payment status updates

## 🚀 Advanced Features

### Sub-Wallet System
- **Child EOA Creation**: Create child accounts for family members
- **Spending Limits**: Set and enforce spending limits
- **Period Management**: Daily, weekly, monthly limits
- **Parental Controls**: Complete control over child spending

### Social Features
- **Contact Management**: Add and manage contacts
- **Social Payments**: Send money to contacts easily
- **Transaction Sharing**: Share transaction details
- **Social Integration**: Connect with friends and family

### Subscription System
- **Vendor Subscriptions**: Recurring payments to vendors
- **Subscription Dashboard**: Manage all subscriptions
- **Payment History**: Track subscription payments
- **Easy Management**: Simple subscription management

## 🧪 Testing

### Testnet Configuration
- **Arbitrum Sepolia**: Testnet for development
- **Test PYUSD**: Use testnet PYUSD tokens
- **Test ETH**: Use testnet ETH for gas
- **Mock Data**: Test with mock transaction data

### Testing Features
- **Transaction Testing**: Test all transaction types
- **Sub-account Testing**: Test sub-account creation and management
- **QR Code Testing**: Test QR code generation and scanning
- **Subscription Testing**: Test subscription management

## 🔮 Future Enhancements

### Planned Features
- **Real Transaction Processing**: Connect to mainnet
- **Push Notifications**: Transaction and balance alerts
- **Multi-language Support**: Internationalization
- **Dark Mode**: Theme switching capability
- **Advanced Analytics**: Spending analytics and insights

### Backend Integration
- **API Endpoints**: Connect to backend services
- **Real-time Updates**: WebSocket connections
- **Transaction Broadcasting**: Submit to blockchain
- **Balance Synchronization**: Real-time balance updates

## 🛠️ Development

### Key Files
- `app/index.tsx`: Main app entry point
- `components/MainNavigation.tsx`: Navigation component
- `components/BalanceScreen.tsx`: Balance display
- `components/TransactionsScreen.tsx`: Transaction history
- `components/SubAccountsScreen.tsx`: Sub-account management
- `components/ProfileScreen.tsx`: User profile

### Development Commands
```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Lint code
npm run lint
```


