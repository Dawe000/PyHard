import React from 'react';
import { CodeBlock } from '@/components/CodeBlock';
import { CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';

export const runtime = 'edge';

export default function GettingStartedPage() {
  const installationCode = `npm install pyhard-vendor-sdk
# or
yarn add pyhard-vendor-sdk
# or
pnpm add pyhard-vendor-sdk

# View on npm: https://www.npmjs.com/settings/dawe0000/packages`;

  const basicSetupCode = `import { PyHardProvider } from 'pyhard-vendor-sdk';

function App() {
  return (
    <PyHardProvider>
      {/* Your app components */}
    </PyHardProvider>
  );
}`;

  const firstComponentCode = `import { 
  PyHardProvider, 
  WalletConnect, 
  SubscriptionQRGenerator 
} from 'pyhard-vendor-sdk';

function MyApp() {
  return (
    <PyHardProvider>
      <div className="space-y-6">
        <WalletConnect />
        <SubscriptionQRGenerator />
      </div>
    </PyHardProvider>
  );
}`;

  const environmentSetupCode = `# .env.local
NEXT_PUBLIC_PROJECT_ID=your_reown_project_id
NEXT_PUBLIC_PAYMASTER_URL=https://your-paymaster-worker.workers.dev`;

  const walletConnectionCode = `import { useWallet } from 'pyhard-vendor-sdk';

function MyComponent() {
  const { address, isConnected, connectWallet } = useWallet();
  
  if (!isConnected) {
    return (
      <button onClick={connectWallet}>
        Connect Wallet
      </button>
    );
  }
  
  return (
    <div>
      <p>Connected: {address}</p>
      {/* Your subscription components */}
    </div>
  );
}`;

  const subscriptionCode = `import { useSubscriptions } from 'pyhard-vendor-sdk';

function SubscriptionsList() {
  const { subscriptions, loading, executePayment } = useSubscriptions('0x...');
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {subscriptions.map(sub => (
        <div key={sub.subscriptionId}>
          <p>Amount: {sub.amountPerInterval} PYUSD</p>
          <p>Interval: {sub.interval} seconds</p>
          <button onClick={() => executePayment(sub.subscriptionId)}>
            Execute Payment
          </button>
        </div>
      ))}
    </div>
  );
}`;

  const steps = [
    {
      title: 'Install the SDK',
      description: 'Add PyHard Vendor SDK to your project',
      code: installationCode,
      language: 'bash'
    },
    {
      title: 'Set up the Provider',
      description: 'Wrap your app with PyHardProvider',
      code: basicSetupCode,
      language: 'tsx'
    },
    {
      title: 'Add Your First Component',
      description: 'Start with wallet connection and QR generation',
      code: firstComponentCode,
      language: 'tsx'
    },
    {
      title: 'Configure Environment',
      description: 'Set up your environment variables',
      code: environmentSetupCode,
      language: 'bash'
    },
    {
      title: 'Connect Wallets',
      description: 'Use the useWallet hook for wallet management',
      code: walletConnectionCode,
      language: 'tsx'
    },
    {
      title: 'Manage Subscriptions',
      description: 'Use the useSubscriptions hook for subscription management',
      code: subscriptionCode,
      language: 'tsx'
    }
  ];

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-space-grotesk font-bold text-white mb-4">
            Getting Started
          </h1>
          <p className="text-xl text-gray-400">
            Get up and running with PyHard in minutes
          </p>
        </div>

        {/* Prerequisites */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-space-grotesk font-bold text-white mb-6">
              Prerequisites
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-pyhard-accent" />
                <span className="text-gray-300">Node.js 18+ and npm/yarn/pnpm</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-pyhard-accent" />
                <span className="text-gray-300">React 18+ application</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-pyhard-accent" />
                <span className="text-gray-300">Reown AppKit project ID (optional)</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-pyhard-accent" />
                <span className="text-gray-300">Arbitrum Sepolia testnet access</span>
              </div>
            </div>
          </div>
        </section>

        {/* Step-by-step Guide */}
        <section className="mb-12">
          <h2 className="text-3xl font-space-grotesk font-bold text-white mb-8">
            Step-by-Step Setup
          </h2>
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-pyhard-blue to-pyhard-accent rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-300 mb-4">
                      {step.description}
                    </p>
                    <div className="bg-black/20 rounded-lg p-4">
                      <CodeBlock code={step.code} language={step.language} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Test */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-pyhard-blue/20 to-pyhard-accent/20 border border-white/20 rounded-xl p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-space-grotesk font-bold text-white mb-6">
              Test Your Setup
            </h2>
            <p className="text-gray-300 mb-6">
              Once you've completed the setup, test your integration with our interactive demo:
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="/demo" 
                className="inline-flex items-center bg-gradient-to-r from-pyhard-blue to-pyhard-accent hover:from-pyhard-blue/90 hover:to-pyhard-accent/90 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Try the Demo <ArrowRight className="w-4 h-4 ml-2" />
              </a>
              <a 
                href="/docs/api" 
                className="inline-flex items-center border border-white/20 hover:border-white/40 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
              >
                View API Reference <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>
        </section>

        {/* Common Issues */}
        <section className="mb-12">
          <h2 className="text-3xl font-space-grotesk font-bold text-white mb-8">
            Common Issues
          </h2>
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-3">
                Wallet Connection Issues
              </h3>
              <p className="text-gray-300 mb-3">
                If wallet connection isn't working, make sure you have a valid Reown AppKit project ID.
              </p>
              <div className="bg-black/20 rounded-lg p-3">
                <code className="text-sm text-gray-300">
                  NEXT_PUBLIC_PROJECT_ID=your_project_id_here
                </code>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-3">
                Build Errors
              </h3>
              <p className="text-gray-300 mb-3">
                If you encounter React Native dependency errors, make sure your Next.js config includes the proper webpack fallbacks.
              </p>
              <div className="bg-black/20 rounded-lg p-3">
                <code className="text-sm text-gray-300">
                  config.resolve.fallback = {`{ '@react-native-async-storage/async-storage': false }`}
                </code>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-3">
                Network Issues
              </h3>
              <p className="text-gray-300">
                PyHard is configured for Arbitrum Sepolia testnet. Make sure your wallet is connected to the correct network and you have testnet ETH for gas fees.
              </p>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section>
          <div className="bg-gradient-to-br from-pyhard-blue/20 to-pyhard-accent/20 border border-white/20 rounded-xl p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-space-grotesk font-bold text-white mb-4">
              What's Next?
            </h2>
            <p className="text-gray-300 mb-6">
              Now that you have PyHard set up, explore the full documentation to build amazing subscription experiences.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a 
                href="/docs/components" 
                className="inline-flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-lg font-semibold transition-all"
              >
                <span>Components</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a 
                href="/docs/hooks" 
                className="inline-flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-lg font-semibold transition-all"
              >
                <span>Hooks</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
