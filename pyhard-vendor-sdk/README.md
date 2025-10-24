# PyHard Vendor SDK

A React SDK for integrating PyHard subscriptions and payments into vendor applications. Supports both styled (ready-to-use) and headless (fully customizable) components.

## Features

- 🔗 **Wallet Connection**: Reown AppKit integration or manual address input
- 📱 **QR Code Generation**: Create subscription and payment QR codes
- 💰 **Payment Management**: Execute subscription payments when due
- 📊 **Real-time Data**: Poll Blockscout for payment events
- 🎨 **Dual Components**: Styled and headless component options
- 🔒 **Type Safety**: Full TypeScript support
- ⚡ **Auto-refresh**: Automatic data updates

## Installation

```bash
npm install pyhard-vendor-sdk
```

## Quick Start

### 1. Wrap your app with PyHardProvider

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

### 2. Use styled components

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

### 3. Use headless components for custom UI

```tsx
import { SubscriptionQRGenerator } from 'pyhard-vendor-sdk';

function CustomSubscriptionForm() {
  return (
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
  );
}
```

## Components

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

- `SubscriptionQRGenerator` (headless)
- `PaymentQRGenerator` (headless)
- `SubscriptionList` (headless)
- `PaymentHistory` (headless)

## Hooks

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

## Payment Detection

The SDK automatically detects new payments by polling Blockscout for events. You can use the `usePaymentDetection` hook to get notified when new payments are made:

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

## Manual Wallet Address

For vendors who don't want to use wallet connection, you can use manual address input:

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

## Configuration

Configure the SDK with custom settings:

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

## Styling

The SDK uses Tailwind CSS for styling. Make sure to include Tailwind in your project:

```bash
npm install tailwindcss
```

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

For custom styling, you can:

1. Override Tailwind classes
2. Use headless components with your own styling
3. Use CSS modules or styled-components

## TypeScript

The SDK is fully typed. Import types as needed:

```tsx
import { 
  Subscription, 
  PaymentHistory, 
  PyHardConfig 
} from 'pyhard-vendor-sdk';
```

## Examples

### Complete Vendor Dashboard

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

## License

MIT
