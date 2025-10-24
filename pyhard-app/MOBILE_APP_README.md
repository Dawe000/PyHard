# PYUSD Mobile Wallet App

A PayPal-style mobile wallet application built with React Native and Expo, integrated with Privy for wallet management and Arbitrum Sepolia testnet.

## Features

### 🏦 Balance Page
- **PYUSD Balance Display**: Shows current PYUSD balance in a prominent card
- **ETH Balance**: Displays ETH balance for gas fees
- **Quick Actions**: Send, Receive, Swap, and Buy buttons (non-functional for now)
- **Pull-to-Refresh**: Refresh balances by pulling down
- **Address Management**: Copy wallet address with one tap

### 📊 Transactions Page
- **Transaction History**: View past transactions with status indicators
- **Contract Interactions**: Separate tab for smart contract interactions
- **Transaction Details**: Tap transactions to see details
- **Export Feature**: Placeholder for transaction export functionality

### 👥 Sub-Accounts Page
- **Family Banking**: Manage sub-accounts for family members
- **Account Types**: 
  - Family Allowance (monthly spending limits)
  - Pocket Money (weekly allowances)
- **Spending Limits**: Set and monitor spending limits per account
- **Account Management**: Create, fund, and manage sub-accounts
- **Real-time Status**: Active, paused, or inactive account status

## Technical Implementation

### 🔗 Privy Integration
- **Authentication**: Seamless login with email/social accounts
- **Embedded Wallets**: Automatic wallet creation for new users
- **Arbitrum Sepolia**: Configured for Arbitrum testnet
- **Network Detection**: Automatic network switching and validation

### 🎨 PayPal-Style UI
- **Modern Design**: Clean, professional interface similar to PayPal
- **Blue Color Scheme**: Primary color #0070BA matching PayPal branding
- **Card-based Layout**: Information organized in clean cards
- **Intuitive Navigation**: Bottom tab navigation for easy access
- **Responsive Design**: Optimized for mobile devices

### 📱 Navigation Structure
```
Main App
├── Balance Tab (Default)
│   ├── PYUSD Balance Card
│   ├── ETH Balance Card
│   ├── Quick Actions
│   └── Recent Activity
├── Transactions Tab
│   ├── Transactions List
│   └── Contracts List
└── Sub-Accounts Tab
    ├── Account Cards
    └── Create Account Modal
```

## Configuration

### Arbitrum Sepolia Setup
- **Chain ID**: 421614
- **RPC URL**: https://sepolia-rollup.arbitrum.io/rpc
- **PYUSD Contract**: 0x6c3ea9036406852006290770BEdFcAbA0e23A0e8
- **Token Decimals**: 6

### Privy Configuration
- **App ID**: Configured in app.json
- **Client ID**: Configured in app.json
- **Default Chain**: Arbitrum Sepolia
- **Supported Chains**: [Arbitrum Sepolia]

## Development

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator (for testing)

### Running the App
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Key Components

#### BalanceScreen.tsx
- Main balance display with PYUSD and ETH balances
- Quick action buttons for common operations
- Pull-to-refresh functionality
- Address copying and display

#### TransactionsScreen.tsx
- Transaction history with filtering
- Contract interaction tracking
- Tab-based navigation between transactions and contracts
- Export functionality placeholder

#### SubAccountsScreen.tsx
- Sub-account management interface
- Create new sub-accounts with different types
- Spending limit tracking
- Account status management

#### MainNavigation.tsx
- Bottom tab navigation
- Screen routing and state management
- Consistent navigation across the app

## Future Enhancements

### Planned Features
- **Real Transaction Processing**: Connect to actual blockchain transactions
- **Smart Contract Integration**: Interact with deployed smart contracts
- **Push Notifications**: Transaction and balance alerts
- **Biometric Authentication**: Fingerprint/Face ID login
- **Multi-language Support**: Internationalization
- **Dark Mode**: Theme switching capability

### Backend Integration
- **API Endpoints**: Connect to backend services
- **Real-time Updates**: WebSocket connections for live data
- **Transaction Broadcasting**: Submit transactions to blockchain
- **Balance Synchronization**: Real-time balance updates

## Security Considerations

- **Private Key Management**: Handled securely by Privy
- **Network Validation**: Automatic network switching
- **Transaction Signing**: Secure transaction signing process
- **Address Verification**: Display and copy wallet addresses safely

## Testing

The app is designed to work on Arbitrum Sepolia testnet:
- Use testnet ETH for gas fees
- Test PYUSD transactions on testnet
- Verify all functionality before mainnet deployment

## Support

For issues or questions:
1. Check the console logs for debugging information
2. Verify network connection to Arbitrum Sepolia
3. Ensure Privy configuration is correct
4. Check wallet balance for gas fees

---

**Note**: This is a demonstration app with placeholder functionality. Transaction buttons and advanced features are not yet connected to the blockchain backend.
