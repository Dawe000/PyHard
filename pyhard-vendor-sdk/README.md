# PyHard Vendor SDK

A comprehensive React SDK for integrating PyHard subscriptions and payments into vendor applications. This SDK enables vendors to accept PYUSD payments, manage subscriptions, and integrate with the PyHard ecosystem seamlessly.

## 🚀 Key Features

### 💳 Payment Integration
- **PYUSD Payments**: Accept PYUSD stablecoin payments
- **QR Code Generation**: Generate payment and subscription QR codes
- **Wallet Connection**: Integrate with Reown AppKit or manual address input
- **Real-time Processing**: Process payments in real-time

### 📊 Subscription Management
- **Subscription Creation**: Create recurring payment subscriptions
- **Payment Execution**: Execute subscription payments automatically
- **Subscription Tracking**: Track subscription status and history
- **Payment History**: Complete payment history for subscriptions

### 🎨 Flexible UI Components
- **Styled Components**: Ready-to-use styled components
- **Headless Components**: Fully customizable components with render props
- **Tailwind CSS**: Built-in Tailwind CSS styling
- **TypeScript Support**: Full TypeScript support with type definitions

### 🔄 Real-time Data
- **Payment Detection**: Automatically detect new payments
- **Blockchain Polling**: Poll Blockscout for payment events
- **Auto-refresh**: Automatic data updates
- **WebSocket Support**: Real-time updates via WebSocket

## 🏗️ Technical Architecture

### Core Technologies
- **React 18+**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Viem**: Ethereum interaction library
- **Wagmi**: React hooks for Ethereum
- **Reown AppKit**: Wallet connection
- **Tailwind CSS**: Utility-first CSS framework

### Component Architecture
```
PyHardProvider (Context)
├── WalletConnect (Styled/Headless)
├── SubscriptionQRGenerator (Styled/Headless)
├── PaymentQRGenerator (Styled/Headless)
├── SubscriptionList (Styled/Headless)
└── PaymentHistory (Styled/Headless)
```

## 🚀 Getting Started

### Prerequisites
- React 18+
- Node.js 18+
- Tailwind CSS (for styling)
- Viem and Wagmi (for blockchain interaction)

### Installation

1. **Install the SDK**
```bash
npm install pyhard-vendor-sdk
```

2. **Install peer dependencies**
```bash
npm install viem wagmi @reown/appkit @reown/appkit-adapter-wagmi
```

3. **Install Tailwind CSS**
```bash
npm install tailwindcss
```

### Quick Start

1. **Wrap your app with PyHardProvider**
```tsx
import { PyHardProvider } from 'pyhard-vendor-sdk';

function App() {
  return (
    <PyHardProvider>
      <YourApp />
    </PyHardProvider>
  );
}
```

2. **Use styled components**
```tsx
import { 
  WalletConnect, 
  SubscriptionQRGenerator, 
  SubscriptionList 
} from 'pyhard-vendor-sdk';

function VendorDashboard() {
  return (
    <div>
      <WalletConnect />
      <SubscriptionQRGenerator />
      <SubscriptionList vendorAddress="0x..." />
    </div>
  );
}
```

## 🎨 Components

### Styled Components

#### WalletConnect
Connect wallet or enter manual address.

```tsx
<WalletConnect 
  onAddressChange={(address) => console.log('Address changed:', address)}
  className="my-custom-class"
/>
```

#### SubscriptionQRGenerator
Generate subscription QR codes.

```tsx
<SubscriptionQRGenerator 
  onQRGenerated={(qrData) => console.log('QR generated:', qrData)}
/>
```

#### PaymentQRGenerator
Generate payment QR codes.

```tsx
<PaymentQRGenerator 
  onQRGenerated={(qrData) => console.log('QR generated:', qrData)}
/>
```

#### SubscriptionList
Display and manage subscriptions.

```tsx
<SubscriptionList 
  vendorAddress="0x..."
  onPaymentExecuted={(subscriptionId, txHash) => 
    console.log('Payment executed:', subscriptionId, txHash)
  }
/>
```

#### PaymentHistory
Show payment history for a subscription.

```tsx
<PaymentHistory 
  smartWalletAddress="0x..."
  subscriptionId={1}
/>
```

### Headless Components

All styled components have headless equivalents that use render props:

```tsx
<SubscriptionQRGenerator>
  {({ amount, setAmount, interval, setInterval, generateQR, qrData, isValid }) => (
    <div>
      <input 
        value={amount} 
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
      />
      <select 
        value={interval} 
        onChange={(e) => setInterval(e.target.value)}
      >
        <option value="86400">Daily</option>
        <option value="604800">Weekly</option>
        <option value="2592000">Monthly</option>
      </select>
      <button onClick={generateQR} disabled={!isValid}>
        Generate QR
      </button>
      {qrData && <QRCode value={qrData} />}
    </div>
  )}
</SubscriptionQRGenerator>
```

## 🔧 Hooks

### useWallet
Manage wallet connection state.

```tsx
const { 
  address, 
  isConnected, 
  connectWallet, 
  disconnect,
  setManualAddress,
  isManualMode 
} = useWallet();
```

### useSubscriptions
Fetch and manage subscriptions.

```tsx
const { 
  subscriptions, 
  loading, 
  error, 
  executePayment,
  isPaymentDue,
  refetch 
} = useSubscriptions(vendorAddress);
```

### usePaymentHistory
Fetch payment history.

```tsx
const { 
  payments, 
  loading, 
  error, 
  refetch 
} = usePaymentHistory(smartWalletAddress, subscriptionId);
```

### usePaymentDetection
Poll for new payments.

```tsx
const { 
  latestPayment, 
  isPolling, 
  startPolling, 
  stopPolling 
} = usePaymentDetection(
  smartWalletAddress, 
  subscriptionId, 
  (payment) => console.log('New payment:', payment)
);
```

## 🔄 Payment Detection

The SDK automatically detects new payments by polling Blockscout for events:

```tsx
function PaymentNotification() {
  const { latestPayment } = usePaymentDetection(
    smartWalletAddress,
    subscriptionId,
    (payment) => {
      // Show notification
      toast.success(`Payment received: ${formatAmount(payment.amount)}`);
    }
  );

  return (
    <div>
      {latestPayment && (
        <div>Latest payment: {formatAmount(latestPayment.amount)}</div>
      )}
    </div>
  );
}
```

## 🔧 Configuration

### PyHardProvider Configuration
```tsx
<PyHardProvider 
  config={{
    rpcUrl: 'https://custom-rpc.com',
    blockscoutUrl: 'https://custom-blockscout.com/api',
    paymasterUrl: 'https://custom-paymaster.com'
  }}
>
  <YourApp />
</PyHardProvider>
```

### Manual Wallet Address
For vendors who don't want to use wallet connection:

```tsx
function ManualVendor() {
  const { setManualAddress, address } = useWallet();
  
  useEffect(() => {
    setManualAddress('0x...'); // Set vendor address manually
  }, []);

  return (
    <div>
      <p>Vendor: {address}</p>
      <SubscriptionQRGenerator />
    </div>
  );
}
```

## 🎨 Styling

### Tailwind CSS
The SDK uses Tailwind CSS for styling. Include Tailwind in your project:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Custom Styling
You can customize styling in several ways:

1. **Override Tailwind classes**
2. **Use headless components with your own styling**
3. **Use CSS modules or styled-components**

## 📱 Complete Example

### Vendor Dashboard
```tsx
import { 
  PyHardProvider,
  WalletConnect,
  SubscriptionQRGenerator,
  SubscriptionList,
  useWallet
} from 'pyhard-vendor-sdk';

function VendorDashboard() {
  const { address } = useWallet();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Vendor Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <WalletConnect />
          <SubscriptionQRGenerator />
        </div>
        
        <div>
          {address && <SubscriptionList vendorAddress={address} />}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <PyHardProvider>
      <VendorDashboard />
    </PyHardProvider>
  );
}
```

### Custom Payment Form
```tsx
import { PaymentQRGenerator } from 'pyhard-vendor-sdk';

function CustomPaymentForm() {
  return (
    <PaymentQRGenerator>
      {({ amount, setAmount, recipientAddress, setRecipientAddress, generateQR, qrData, isValid }) => (
        <form onSubmit={(e) => { e.preventDefault(); generateQR(); }}>
          <div>
            <label>Amount (PYUSD)</label>
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10.00"
            />
          </div>
          
          <div>
            <label>Recipient Address</label>
            <input 
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="0x..."
            />
          </div>
          
          <button type="submit" disabled={!isValid}>
            Generate Payment QR
          </button>
          
          {qrData && (
            <div>
              <h3>Payment QR Code</h3>
              <QRCode value={qrData} />
            </div>
          )}
        </form>
      )}
    </PaymentQRGenerator>
  );
}
```

## 🔐 Security Features

### Signature Verification
- **ECDSA Validation**: Validates user signatures
- **Nonce Protection**: Prevents replay attacks
- **Deadline Checking**: Ensures requests haven't expired
- **Address Verification**: Verifies wallet addresses

### Data Protection
- **Local Storage**: Sensitive data stored locally
- **Encryption**: Data encrypted at rest
- **Secure Communication**: Encrypted communication with blockchain
- **Privacy Controls**: Limited data collection

## 🧪 Testing

### Testnet Configuration
- **Arbitrum Sepolia**: Testnet for development
- **Test PYUSD**: Use testnet PYUSD tokens
- **Test ETH**: Use testnet ETH for gas
- **Mock Data**: Test with mock transaction data

### Testing Features
- **Component Testing**: Test all components
- **Hook Testing**: Test all hooks
- **Integration Testing**: Test complete workflows
- **Payment Testing**: Test payment processing

## 🚀 Advanced Features

### Subscription Management
- **Recurring Payments**: Automated recurring payments
- **Payment Scheduling**: Schedule payments for specific times
- **Payment Retry**: Retry failed payments automatically
- **Payment Notifications**: Notify users of payment status

### Analytics Integration
- **Payment Analytics**: Track payment metrics
- **User Analytics**: Track user behavior
- **Revenue Analytics**: Track revenue metrics
- **Custom Events**: Track custom events

## 🔮 Future Enhancements

### Planned Features
- **Multi-chain Support**: Support for additional chains
- **Advanced Analytics**: Enhanced analytics dashboard
- **Payment Methods**: Support for additional payment methods
- **Internationalization**: Multi-language support

### Performance Improvements
- **Caching**: Enhanced caching strategies
- **Optimization**: Performance optimizations
- **Bundle Size**: Reduced bundle size
- **Loading States**: Improved loading states

## 🛠️ Development

### Key Files
- `src/index.ts`: Main SDK entry point
- `src/components/`: React components
- `src/hooks/`: React hooks
- `src/types.ts`: TypeScript type definitions
- `src/utils/`: Utility functions

### Development Commands
```bash
# Build the SDK
npm run build

# Watch for changes
npm run dev

# Clean build
npm run clean
```
