import React from 'react';
import { CodeBlock } from '@/components/CodeBlock';
import { ArrowRight, CheckCircle2, ExternalLink } from 'lucide-react';
import { DocsLayout } from '@/components/DocsLayout';


export default function APIDocsPage() {
  const installationCode = `npm install pyhard-vendor-sdk
# or
yarn add pyhard-vendor-sdk
# or
pnpm add pyhard-vendor-sdk

# View on npm: https://www.npmjs.com/settings/dawe0000/packages`;

  const basicUsageCode = `import { PyHardProvider, WalletConnect, SubscriptionQRGenerator } from 'pyhard-vendor-sdk';

function App() {
  return (
    <PyHardProvider>
      <WalletConnect />
      <SubscriptionQRGenerator />
    </PyHardProvider>
  );
}`;

  const hooksCode = `import { useWallet, useSubscriptions } from 'pyhard-vendor-sdk';

function MyComponent() {
  const { address, isConnected, connectWallet } = useWallet();
  const { subscriptions, loading, refetch } = useSubscriptions(address);
  
  return (
    <div>
      {isConnected ? (
        <p>Connected: {address}</p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}`;

  const componentsCode = `import { 
  WalletConnect,
  SubscriptionQRGenerator,
  PaymentQRGenerator,
  SubscriptionList,
  PaymentHistory
} from 'pyhard-vendor-sdk';

// Wallet connection with manual input toggle
<WalletConnect 
  onAddressChange={(address) => console.log('Address changed:', address)}
  showManualInput={true} // Optional, defaults to true
/>

// QR code generators
<SubscriptionQRGenerator 
  onQRGenerated={(qrData) => console.log('QR generated:', qrData)}
/>

<PaymentQRGenerator 
  onQRGenerated={(qrData) => console.log('Payment QR:', qrData)}
/>

// Subscription management
<SubscriptionList 
  vendorAddress="0x..."
  onPaymentExecuted={(subscriptionId, txHash) => {
    console.log('Payment executed:', subscriptionId, txHash);
  }}
/>

// Payment history
<PaymentHistory 
  smartWalletAddress="0x..."
  subscriptionId={1}
/>`;

  const typesCode = `interface Subscription {
  subscriptionId: number;
  smartWallet: string;
  vendor: string;
  amountPerInterval: string;
  interval: string;
  lastPayment: string;
  active: boolean;
}

interface PaymentHistory {
  transactionHash: string;
  amount: string;
  timestamp: string;
  blockNumber: string;
}

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isManual: boolean;
}`;

  const utilsCode = `import { 
  createSubscriptionQR, 
  createPaymentQR,
  formatAmount,
  formatAddress,
  formatInterval 
} from 'pyhard-vendor-sdk';

// Create QR codes
const subscriptionQR = createSubscriptionQR(
  '0x...', // vendor address
  '10.00', // amount in PYUSD
  '2592000' // interval in seconds (30 days)
);

const paymentQR = createPaymentQR(
  '0x...', // recipient address
  '5.00' // amount in PYUSD
);

// Format data
const formattedAmount = formatAmount('1000000000000000000'); // "1.00 PYUSD"
const formattedAddress = formatAddress('0x1234...5678'); // "0x1234...5678"
const formattedInterval = formatInterval(2592000); // "30 days"`;

  return (
    <DocsLayout title="API Documentation" description="Complete reference for the PyHard Vendor SDK">

        {/* Installation */}
        <section className="mb-12">
          <h2 className="text-3xl font-space-grotesk font-bold text-white mb-6">
            Installation
          </h2>
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
            <CodeBlock code={installationCode} language="bash" />
          </div>
        </section>

        {/* Quick Start */}
        <section className="mb-12">
          <h2 className="text-3xl font-space-grotesk font-bold text-white mb-6">
            Quick Start
          </h2>
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
            <CodeBlock code={basicUsageCode} language="tsx" />
          </div>
        </section>

        {/* Hooks */}
        <section className="mb-12">
          <h2 className="text-3xl font-space-grotesk font-bold text-white mb-6">
            Hooks
          </h2>
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-4">useWallet</h3>
              <p className="text-gray-300 mb-4">
                Manages wallet connection state and provides wallet interaction methods.
              </p>
              <CodeBlock code={hooksCode} language="tsx" />
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-4">useSubscriptions</h3>
              <p className="text-gray-300 mb-4">
                Fetches and manages subscriptions for a vendor address.
              </p>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                  <span>Automatic polling for new subscriptions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                  <span>Payment execution functionality</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                  <span>Real-time subscription status updates</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Components */}
        <section className="mb-12">
          <h2 className="text-3xl font-space-grotesk font-bold text-white mb-6">
            Components
          </h2>
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
            <CodeBlock code={componentsCode} language="tsx" />
          </div>
        </section>

        {/* Types */}
        <section className="mb-12">
          <h2 className="text-3xl font-space-grotesk font-bold text-white mb-6">
            TypeScript Types
          </h2>
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
            <CodeBlock code={typesCode} language="typescript" />
          </div>
        </section>

        {/* Utilities */}
        <section className="mb-12">
          <h2 className="text-3xl font-space-grotesk font-bold text-white mb-6">
            Utilities
          </h2>
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
            <CodeBlock code={utilsCode} language="typescript" />
          </div>
        </section>

        {/* Configuration */}
        <section className="mb-12">
          <h2 className="text-3xl font-space-grotesk font-bold text-white mb-6">
            Configuration
          </h2>
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Environment Variables</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div><code className="bg-white/10 px-2 py-1 rounded">NEXT_PUBLIC_PROJECT_ID</code> - Reown AppKit project ID</div>
                  <div><code className="bg-white/10 px-2 py-1 rounded">NEXT_PUBLIC_PAYMASTER_URL</code> - Paymaster worker URL</div>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Network Configuration</h4>
                <div className="text-sm text-gray-300">
                  <p>PyHard is configured for <strong>Arbitrum Sepolia</strong> testnet by default.</p>
                  <p>Contract addresses are hardcoded in the SDK for security and reliability.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Examples */}
        <section className="mb-12">
          <h2 className="text-3xl font-space-grotesk font-bold text-white mb-6">
            Examples
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-pyhard-blue/20 to-pyhard-accent/20 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-3">Basic Integration</h3>
              <p className="text-gray-300 text-sm mb-4">
                Simple wallet connection and QR generation
              </p>
              <a 
                href="/demo" 
                className="inline-flex items-center text-pyhard-blue hover:text-pyhard-accent transition-colors duration-200"
              >
                View Demo <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="bg-gradient-to-br from-pyhard-blue/20 to-pyhard-accent/20 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-3">Full Implementation</h3>
              <p className="text-gray-300 text-sm mb-4">
                Complete subscription management system
              </p>
              <a 
                href="https://github.com/Dawe000/PyHard" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-pyhard-blue hover:text-pyhard-accent transition-colors duration-200"
              >
                View on GitHub <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </section>
    </DocsLayout>
  );
}
