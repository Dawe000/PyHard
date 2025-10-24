import React from 'react';
import { CodeBlock } from '@/components/CodeBlock';
import { CheckCircle2, ArrowRight, Zap, RefreshCw, Eye } from 'lucide-react';


export default function HooksPage() {
  const useWalletCode = `import { useWallet } from 'pyhard-vendor-sdk';

function MyComponent() {
  const { 
    address, 
    isConnected, 
    isManual, 
    manualAddress, 
    setManualAddress,
    connectWallet,
    toggleMode,
    isValidAddress 
  } = useWallet();
  
  return (
    <div>
      {isConnected ? (
        <p>Connected: {address}</p>
      ) : (
        <button onClick={connectWallet}>
          Connect Wallet
        </button>
      )}
    </div>
  );
}`;

  const useSubscriptionsCode = `import { useSubscriptions } from 'pyhard-vendor-sdk';

function SubscriptionsManager() {
  const { 
    subscriptions, 
    loading, 
    error, 
    refetch,
    executePayment 
  } = useSubscriptions('0x...'); // vendor address
  
  const handlePayment = async (subscriptionId: number) => {
    try {
      const txHash = await executePayment(subscriptionId);
      console.log('Payment executed:', txHash);
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };
  
  if (loading) return <div>Loading subscriptions...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {subscriptions.map(sub => (
        <div key={sub.subscriptionId}>
          <p>Amount: {sub.amountPerInterval} PYUSD</p>
          <button onClick={() => handlePayment(sub.subscriptionId)}>
            Execute Payment
          </button>
        </div>
      ))}
    </div>
  );
}`;

  const usePaymentHistoryCode = `import { usePaymentHistory } from 'pyhard-vendor-sdk';

function PaymentHistory({ smartWalletAddress, subscriptionId }) {
  const { 
    payments, 
    loading, 
    error, 
    refetch 
  } = usePaymentHistory(smartWalletAddress, subscriptionId);
  
  if (loading) return <div>Loading payment history...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {payments.map(payment => (
        <div key={payment.transactionHash}>
          <p>Amount: {payment.amount} PYUSD</p>
          <p>Date: {new Date(payment.timestamp).toLocaleDateString()}</p>
          <p>TX: {payment.transactionHash}</p>
        </div>
      ))}
    </div>
  );
}`;

  const usePaymentDetectionCode = `import { usePaymentDetection } from 'pyhard-vendor-sdk';

function PaymentMonitor({ smartWalletAddress, subscriptionId }) {
  const { 
    hasNewPayment, 
    latestPayment, 
    isPolling 
  } = usePaymentDetection(smartWalletAddress, subscriptionId);
  
  useEffect(() => {
    if (hasNewPayment && latestPayment) {
      // Show notification or update UI
      console.log('New payment detected:', latestPayment);
    }
  }, [hasNewPayment, latestPayment]);
  
  return (
    <div>
      {isPolling && <span>Monitoring for payments...</span>}
      {hasNewPayment && <span>New payment received!</span>}
    </div>
  );
}`;

  const hooks = [
    {
      name: 'useWallet',
      description: 'Manages wallet connection state and provides wallet interaction methods',
      features: ['Reown AppKit integration', 'Manual address input', 'Connection state', 'Address validation'],
      code: useWalletCode,
      returns: [
        { name: 'address', type: 'string | null', description: 'Connected wallet address' },
        { name: 'isConnected', type: 'boolean', description: 'Whether a wallet is connected' },
        { name: 'isManual', type: 'boolean', description: 'Whether using manual address input' },
        { name: 'manualAddress', type: 'string', description: 'Manually entered address' },
        { name: 'setManualAddress', type: '(address: string) => void', description: 'Set manual address' },
        { name: 'connectWallet', type: '() => void', description: 'Trigger wallet connection' },
        { name: 'toggleMode', type: '() => void', description: 'Toggle between wallet and manual mode' },
        { name: 'isValidAddress', type: 'boolean', description: 'Whether current address is valid' }
      ]
    },
    {
      name: 'useSubscriptions',
      description: 'Fetches and manages subscriptions for a vendor address',
      features: ['Automatic polling', 'Payment execution', 'Real-time updates', 'Error handling'],
      code: useSubscriptionsCode,
      parameters: [
        { name: 'vendorAddress', type: 'string', required: true, description: 'Vendor wallet address' }
      ],
      returns: [
        { name: 'subscriptions', type: 'Subscription[]', description: 'Array of subscriptions' },
        { name: 'loading', type: 'boolean', description: 'Loading state' },
        { name: 'error', type: 'Error | null', description: 'Error state' },
        { name: 'refetch', type: '() => void', description: 'Manually refresh subscriptions' },
        { name: 'executePayment', type: '(subscriptionId: number) => Promise<string>', description: 'Execute payment for subscription' }
      ]
    },
    {
      name: 'usePaymentHistory',
      description: 'Fetches payment history for a specific subscription',
      features: ['Payment listing', 'Transaction details', 'Automatic refresh', 'Error handling'],
      code: usePaymentHistoryCode,
      parameters: [
        { name: 'smartWalletAddress', type: 'string', required: true, description: 'Smart wallet address' },
        { name: 'subscriptionId', type: 'number', required: true, description: 'Subscription ID' }
      ],
      returns: [
        { name: 'payments', type: 'PaymentHistory[]', description: 'Array of payment records' },
        { name: 'loading', type: 'boolean', description: 'Loading state' },
        { name: 'error', type: 'Error | null', description: 'Error state' },
        { name: 'refetch', type: '() => void', description: 'Manually refresh payment history' }
      ]
    },
    {
      name: 'usePaymentDetection',
      description: 'Polls for new payments and provides real-time updates',
      features: ['Real-time polling', 'New payment detection', 'Latest payment tracking', 'Automatic updates'],
      code: usePaymentDetectionCode,
      parameters: [
        { name: 'smartWalletAddress', type: 'string', required: true, description: 'Smart wallet address' },
        { name: 'subscriptionId', type: 'number', required: true, description: 'Subscription ID' }
      ],
      returns: [
        { name: 'hasNewPayment', type: 'boolean', description: 'Whether a new payment was detected' },
        { name: 'latestPayment', type: 'PaymentHistory | null', description: 'Latest payment details' },
        { name: 'isPolling', type: 'boolean', description: 'Whether currently polling for updates' }
      ]
    }
  ];

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-space-grotesk font-bold text-white mb-4">
            Hooks
          </h1>
          <p className="text-xl text-gray-400">
            Custom hooks for wallet, subscriptions, and payment management
          </p>
        </div>

        {/* Hook Categories */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-pyhard-blue/20 to-pyhard-accent/20 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="w-6 h-6 text-pyhard-blue" />
                <h2 className="text-lg font-semibold text-white">Wallet Management</h2>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Connect wallets, manage addresses, and handle authentication states.
              </p>
              <div className="space-y-1 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                  <span>useWallet</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pyhard-blue/20 to-pyhard-accent/20 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-4">
                <RefreshCw className="w-6 h-6 text-pyhard-accent" />
                <h2 className="text-lg font-semibold text-white">Subscription Management</h2>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Fetch subscriptions, execute payments, and manage subscription states.
              </p>
              <div className="space-y-1 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                  <span>useSubscriptions</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pyhard-blue/20 to-pyhard-accent/20 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-4">
                <Eye className="w-6 h-6 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Payment Tracking</h2>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Monitor payments, track history, and detect new transactions.
              </p>
              <div className="space-y-1 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                  <span>usePaymentHistory</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                  <span>usePaymentDetection</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Individual Hooks */}
        <section className="mb-12">
          <h2 className="text-3xl font-space-grotesk font-bold text-white mb-8">
            Hook Reference
          </h2>
          <div className="space-y-8">
            {hooks.map((hook, index) => (
              <div key={index} className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    {hook.name}
                  </h3>
                  <p className="text-gray-300 mb-4">
                    {hook.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {hook.features.map((feature, featureIndex) => (
                      <span 
                        key={featureIndex}
                        className="px-3 py-1 bg-pyhard-blue/20 text-pyhard-blue text-sm rounded-full border border-pyhard-blue/30"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {hook.parameters && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3">Parameters</h4>
                    <div className="space-y-2">
                      {hook.parameters.map((param, paramIndex) => (
                        <div key={paramIndex} className="flex items-start space-x-3 text-sm">
                          <code className="text-pyhard-blue font-mono bg-black/20 px-2 py-1 rounded">
                            {param.name}
                          </code>
                          <span className="text-gray-400">({param.type})</span>
                          {param.required && (
                            <span className="text-red-400 text-xs">required</span>
                          )}
                          <span className="text-gray-300">- {param.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3">Returns</h4>
                  <div className="space-y-2">
                    {hook.returns.map((returnItem, returnIndex) => (
                      <div key={returnIndex} className="flex items-start space-x-3 text-sm">
                        <code className="text-pyhard-blue font-mono bg-black/20 px-2 py-1 rounded">
                          {returnItem.name}
                        </code>
                        <span className="text-gray-400">({returnItem.type})</span>
                        <span className="text-gray-300">- {returnItem.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-black/20 rounded-lg p-4">
                  <CodeBlock code={hook.code} language="tsx" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Best Practices */}
        <section className="mb-12">
          <h2 className="text-3xl font-space-grotesk font-bold text-white mb-8">
            Best Practices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-3">
                🔄 Error Handling
              </h3>
              <p className="text-gray-300 text-sm mb-3">
                Always handle errors from hooks, especially for network operations like payment execution.
              </p>
              <div className="bg-black/20 rounded-lg p-3">
                <code className="text-sm text-gray-300">
                  {`const { error, executePayment } = useSubscriptions(address);
if (error) return <div>Error: {error.message}</div>;`}
                </code>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-3">
                ⚡ Performance
              </h3>
              <p className="text-gray-300 text-sm mb-3">
                Use loading states to provide feedback and prevent multiple simultaneous operations.
              </p>
              <div className="bg-black/20 rounded-lg p-3">
                <code className="text-sm text-gray-300">
                  {`const { loading, executePayment } = useSubscriptions(address);
<button disabled={loading} onClick={handlePayment}>
  {loading ? 'Processing...' : 'Execute Payment'}
</button>`}
                </code>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-3">
                🔄 Real-time Updates
              </h3>
              <p className="text-gray-300 text-sm mb-3">
                Combine usePaymentDetection with useSubscriptions for real-time subscription updates.
              </p>
              <div className="bg-black/20 rounded-lg p-3">
                <code className="text-sm text-gray-300">
                  {`const { hasNewPayment } = usePaymentDetection(address, id);
const { refetch } = useSubscriptions(address);
useEffect(() => { if (hasNewPayment) refetch(); }, [hasNewPayment]);`}
                </code>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-3">
                🎯 Conditional Rendering
              </h3>
              <p className="text-gray-300 text-sm mb-3">
                Use loading and error states to provide appropriate UI feedback to users.
              </p>
              <div className="bg-black/20 rounded-lg p-3">
                <code className="text-sm text-gray-300">
                  {`if (loading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
return <SubscriptionList subscriptions={subscriptions} />;`}
                </code>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section>
          <div className="bg-gradient-to-br from-pyhard-blue/20 to-pyhard-accent/20 border border-white/20 rounded-xl p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-space-grotesk font-bold text-white mb-4">
              Ready to Build?
            </h2>
            <p className="text-gray-300 mb-6">
              Now that you understand the hooks, explore examples to see how they work together in real applications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="/docs/examples" 
                className="inline-flex items-center justify-center space-x-2 bg-pyhard-blue hover:bg-pyhard-blue/80 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                <span>View Examples</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a 
                href="/demo" 
                className="inline-flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-lg font-semibold transition-all"
              >
                <span>Try Demo</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
