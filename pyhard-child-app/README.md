# PyHard Child App

A specialized mobile application for children and family members to access their PyHard sub-wallets. This app provides a simplified, secure interface for kids to manage their allowance, make payments, and interact with the PyHard ecosystem under parental supervision.

## 🎯 Purpose & Features

### 👶 Child-Friendly Interface
- **Simplified Design**: Clean, intuitive interface designed for children
- **Large Touch Targets**: Easy-to-use buttons and controls
- **Visual Feedback**: Clear visual indicators for all actions
- **Safe Environment**: Controlled access to financial features

### 💰 Allowance Management
- **Spending Limits**: Enforced spending limits set by parents
- **Balance Display**: Clear display of available funds
- **Transaction History**: View past transactions and spending
- **Spending Alerts**: Notifications when approaching limits

### 📱 QR Code Integration
- **QR Code Scanning**: Scan payment QR codes from vendors

### 🔐 Parental Controls
- **Spending Limits**: Hard limits on daily/weekly spending
- **Transaction Monitoring**: Parents can monitor all transactions
- **Account Pausing**: Parents can pause child accounts instantly
- **Emergency Controls**: Emergency account suspension

## 🏗️ Technical Architecture

### Core Technologies
- **React Native + Expo**: Cross-platform mobile development
- **Viem Integration**: Ethereum interaction library
- **QR Code Support**: React Native QR code generation and scanning
- **AsyncStorage**: Local data persistence
- **UUID Generation**: Unique identifier generation

### Key Components

#### Get Started Screen
- **QR Code Display**: Show QR code for parent scanning
- **Wallet Detection**: Detect when parent wallet is connected
- **Status Updates**: Real-time status updates
- **Error Handling**: Clear error messages and recovery

#### Child Home Screen
- **Balance Display**: Show available funds and spending limits
- **Quick Actions**: Send money and add funds buttons
- **Recent Transactions**: Display recent transaction history
- **Spending Progress**: Visual progress bars for spending limits

#### Send Money Screen
- **Contact Selection**: Choose from saved contacts
- **Amount Input**: Enter payment amount with validation
- **QR Code Generation**: Generate payment QR codes
- **Transaction Confirmation**: Confirm transactions before sending

#### Transaction History Screen
- **Transaction List**: Complete transaction history
- **Transaction Details**: Detailed view of each transaction
- **Filtering Options**: Filter by date, amount, or type
- **Export Functionality**: Export transaction data

#### Contacts Screen
- **Contact Management**: Add and manage contacts
- **Quick Payments**: Send money to contacts easily
- **Contact Search**: Search through contacts
- **Contact Details**: View contact information

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator or Android Emulator
- Parent PyHard wallet for QR code scanning

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd pyhard-child-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm start
```

4. **Run on device/simulator**
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 🔧 Configuration

### App Configuration
- **App Name**: Child App
- **Version**: 1.0.0
- **Orientation**: Portrait only
- **Platform Support**: iOS, Android, Web

### Network Configuration
- **Arbitrum Sepolia**: Testnet for development
- **RPC URL**: https://sepolia-rollup.arbitrum.io/rpc
- **Chain ID**: 421614
- **PYUSD Contract**: 0x6c3ea9036406852006290770BEdFcAbA0e23A0e8

## 📱 App Structure

```
Child App
├── Get Started Screen
│   ├── QR Code Display
│   ├── Wallet Detection
│   └── Status Updates
├── Main Navigation
│   ├── Home Tab
│   │   ├── Balance Display
│   │   ├── Quick Actions
│   │   └── Recent Transactions
│   ├── Send Tab
│   │   ├── Contact Selection
│   │   ├── Amount Input
│   │   └── QR Code Generation
│   ├── History Tab
│   │   ├── Transaction List
│   │   └── Transaction Details
│   └── Contacts Tab
│       ├── Contact Management
│       └── Quick Payments
```

## 🔐 Security Features

### Sub-Wallet Security
- **Spending Limits**: Hard limits enforced by smart contracts
- **Parental Controls**: Complete parental oversight
- **Transaction Validation**: All transactions validated before execution
- **Emergency Controls**: Instant account suspension

### Data Protection
- **Local Storage**: Sensitive data stored locally
- **Encryption**: Data encrypted at rest
- **Secure Communication**: Encrypted communication with parent wallet
- **Privacy Controls**: Limited data collection

## 🎨 User Experience

### Child-Friendly Design
- **Simple Interface**: Minimal, easy-to-understand interface
- **Large Buttons**: Easy-to-tap buttons and controls
- **Clear Typography**: Readable fonts and sizes
- **Visual Feedback**: Clear visual indicators for all actions

### Accessibility Features
- **Large Touch Targets**: Easy to use on all devices
- **High Contrast**: Clear visual contrast
- **Simple Navigation**: Intuitive navigation flow
- **Error Prevention**: Clear error messages and prevention

## 🔄 Integration with PyHard Ecosystem

### Parent Wallet Integration
- **QR Code Scanning**: Parent scans child's QR code
- **Wallet Detection**: Automatic detection of parent wallet
- **Real-time Updates**: Live updates from parent wallet
- **Synchronization**: Sync with parent wallet data

### Smart Wallet Integration
- **Sub-Wallet Creation**: Create child sub-wallets
- **Spending Limits**: Enforce spending limits
- **Transaction Execution**: Execute transactions on behalf of child
- **Account Management**: Manage child accounts

### Paymaster Integration
- **Gas Sponsorship**: All transactions sponsored by paymaster
- **Zero Gas Fees**: Children never pay gas fees
- **Automatic Sponsorship**: Seamless gas sponsorship
- **Rate Limiting**: Built-in abuse prevention

## 🚀 Advanced Features

### Sub-Wallet Management
- **Child EOA Creation**: Create child accounts
- **Spending Limits**: Set and enforce limits
- **Period Management**: Daily, weekly, monthly limits
- **Parental Controls**: Complete parental oversight


### Contact Management
- **Contact Storage**: Store and manage contacts
- **Quick Payments**: Send money to contacts easily
- **Contact Search**: Search through contacts
- **Social Integration**: Connect with friends and family

## 🧪 Testing

### Testnet Configuration
- **Arbitrum Sepolia**: Testnet for development
- **Test PYUSD**: Use testnet PYUSD tokens
- **Test ETH**: Use testnet ETH for gas

### Testing Features
- **QR Code Testing**: Test QR code generation and scanning
- **Transaction Testing**: Test all transaction types
- **Contact Testing**: Test contact management
- **Parental Control Testing**: Test parental controls

## 🔮 Future Enhancements

### Backend Integration
- **API Endpoints**: Connect to backend services
- **Real-time Updates**: WebSocket connections
- **Transaction Broadcasting**: Submit to blockchain
- **Balance Synchronization**: Real-time balance updates

## 🛠️ Development

### Key Files
- `App.tsx`: Main app entry point
- `components/GetStartedScreen.tsx`: Initial setup screen
- `components/ChildHomeScreen.tsx`: Main home screen
- `components/SendMoneyScreen.tsx`: Send money interface
- `components/TransactionHistoryScreen.tsx`: Transaction history
- `components/ContactsScreen.tsx`: Contact management

### Development Commands
```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```
