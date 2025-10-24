import React from 'react';
import { CodeBlock } from '@/components/CodeBlock';
import { CheckCircle2, ArrowRight, ExternalLink, Copy } from 'lucide-react';

export const runtime = 'edge';

export default function ExamplesPage() {
  const basicExampleCode = `import { 
  PyHardProvider, 
  WalletConnect, 
  SubscriptionQRGenerator 
} from 'pyhard-vendor-sdk';

function BasicExample() {
  return (
    <PyHardProvider>
      <div className="max-w-md mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">My Subscription App</h1>
        
        <WalletConnect />
        
        <SubscriptionQRGenerator 
          onQRGenerated={(qrData) => {
            console.log('QR Generated:', qrData);
          }}
        />
      </div>
    </PyHardProvider>
  );
}`;

  const completeExampleCode = `import { 
  PyHardProvider, 
  WalletConnect, 
  SubscriptionQRGenerator,
  PaymentQRGenerator,
  SubscriptionList,
  PaymentHistory,
  useWallet,
  useSubscriptions 
} from 'pyhard-vendor-sdk';

function CompleteExample() {
  const { address, isConnected } = useWallet();
  const { subscriptions, loading, executePayment } = useSubscriptions(address);
  
  return (
    <PyHardProvider>
      <div className="max-w-6xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">PyHard Vendor Dashboard</h1>
          <WalletConnect />
        </header>
        
        {isConnected && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* QR Generators */}
            <div className="space-y-6">
              <SubscriptionQRGenerator />
              <PaymentQRGenerator />
            </div>
            
            {/* Subscriptions */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Active Subscriptions</h2>
              <SubscriptionList 
                vendorAddress={address}
                onPaymentExecuted={(id, txHash) => {
                  console.log('Payment executed:', id, txHash);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </PyHardProvider>
  );
}`;

  const customStylingCode = `import { 
  SubscriptionQRGenerator as HeadlessSubscriptionQRGenerator 
} from 'pyhard-vendor-sdk';

function CustomSubscriptionForm() {
  return (
    <HeadlessSubscriptionQRGenerator>
      {({ 
        amount, 
        setAmount, 
        interval, 
        setInterval, 
        generateQR, 
        qrData, 
        isGenerating 
      }) => (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Create Subscription</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Amount (PYUSD)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="10.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Interval
              </label>
              <select
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="86400">Daily</option>
                <option value="604800">Weekly</option>
                <option value="2592000">Monthly</option>
              </select>
            </div>
            
            <button
              onClick={generateQR}
              disabled={isGenerating}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Generate QR Code'}
            </button>
            
            {qrData && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md">
                <p className="text-sm text-gray-600 mb-2">QR Code Data:</p>
                <code className="text-xs break-all">{JSON.stringify(qrData)}</code>
              </div>
            )}
          </div>
        </div>
      )}
    </HeadlessSubscriptionQRGenerator>
  );
}`;

  const realTimeUpdatesCode = `import { 
  useSubscriptions, 
  usePaymentDetection 
} from 'pyhard-vendor-sdk';

function RealTimeSubscriptionManager({ vendorAddress }) {
  const { subscriptions, refetch } = useSubscriptions(vendorAddress);
  const { hasNewPayment, latestPayment } = usePaymentDetection(
    vendorAddress, 
    subscriptions[0]?.subscriptionId
  );
  
  // Auto-refresh when new payment is detected
  useEffect(() => {
    if (hasNewPayment) {
      refetch();
      // Show notification
      toast.success('New payment received!');
    }
  }, [hasNewPayment, refetch]);
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Subscriptions ({subscriptions.length})
      </h2>
      
      {hasNewPayment && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 rounded">
          New payment received: {latestPayment?.amount} PYUSD
        </div>
      )}
      
      {subscriptions.map(subscription => (
        <div key={subscription.subscriptionId} className="border rounded p-4 mb-2">
          <p>Amount: {subscription.amountPerInterval} PYUSD</p>
          <p>Interval: {subscription.interval} seconds</p>
          <p>Status: {subscription.active ? 'Active' : 'Inactive'}</p>
        </div>
      ))}
    </div>
  );
}`;

  const errorHandlingCode = `import { useSubscriptions } from 'pyhard-vendor-sdk';

function SubscriptionManagerWithErrorHandling({ vendorAddress }) {
  const { 
    subscriptions, 
    loading, 
    error, 
    executePayment 
  } = useSubscriptions(vendorAddress);
  
  const [paymentError, setPaymentError] = useState(null);
  
  const handlePayment = async (subscriptionId) => {
    try {
      setPaymentError(null);
      const txHash = await executePayment(subscriptionId);
      console.log('Payment successful:', txHash);
    } catch (error) {
      setPaymentError(error.message);
      console.error('Payment failed:', error);
    }
  };
  
  if (loading) {
    return <div className="text-center py-8">Loading subscriptions...</div>;
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">Error loading subscriptions</div>
        <div className="text-sm text-gray-600">{error.message}</div>
      </div>
    );
  }
  
  return (
    <div>
      {paymentError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded text-red-700">
          Payment failed: {paymentError}
        </div>
      )}
      
      {subscriptions.map(subscription => (
        <div key={subscription.subscriptionId} className="border rounded p-4 mb-2">
          <p>Amount: {subscription.amountPerInterval} PYUSD</p>
          <button 
            onClick={() => handlePayment(subscription.subscriptionId)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Execute Payment
          </button>
        </div>
      ))}
    </div>
  );
}`;

  const examples = [
    {
      title: 'Basic Integration',
      description: 'Simple wallet connection and QR generation',
      difficulty: 'Beginner',
      features: ['Wallet connection', 'QR generation', 'Basic setup'],
      code: basicExampleCode,
      useCase: 'Perfect for getting started with PyHard'
    },
    {
      title: 'Complete Dashboard',
      description: 'Full-featured vendor dashboard with all components',
      difficulty: 'Intermediate',
      features: ['All components', 'State management', 'Real-time updates'],
      code: completeExampleCode,
      useCase: 'Production-ready vendor application'
    },
    {
      title: 'Custom Styling',
      description: 'Using headless components for complete UI control',
      difficulty: 'Advanced',
      features: ['Headless components', 'Custom styling', 'Render props'],
      code: customStylingCode,
      useCase: 'Custom design system integration'
    },
    {
      title: 'Real-time Updates',
      description: 'Automatic subscription updates with payment detection',
      difficulty: 'Intermediate',
      features: ['Payment detection', 'Auto-refresh', 'Notifications'],
      code: realTimeUpdatesCode,
      useCase: 'Live subscription monitoring'
    },
    {
      title: 'Error Handling',
      description: 'Comprehensive error handling and user feedback',
      difficulty: 'Intermediate',
      features: ['Error states', 'Loading states', 'User feedback'],
      code: errorHandlingCode,
      useCase: 'Production error handling'
    }
  ];

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-space-grotesk font-bold text-white mb-4">
            Examples
          </h1>
          <p className="text-xl text-gray-400">
            Complete examples and tutorials for PyHard integration
          </p>
        </div>

        {/* Difficulty Levels */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-500/20 to-green-400/20 border border-green-500/30 rounded-xl p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white mb-3">Beginner</h2>
              <p className="text-gray-300 text-sm mb-4">
                Simple integrations with basic components and minimal configuration.
              </p>
              <div className="space-y-1 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>Basic setup</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>Styled components</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>Quick start</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-400/20 border border-yellow-500/30 rounded-xl p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white mb-3">Intermediate</h2>
              <p className="text-gray-300 text-sm mb-4">
                Advanced integrations with custom logic, error handling, and real-time features.
              </p>
              <div className="space-y-1 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-yellow-400" />
                  <span>Custom hooks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-yellow-400" />
                  <span>Error handling</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-yellow-400" />
                  <span>Real-time updates</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500/20 to-red-400/20 border border-red-500/30 rounded-xl p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white mb-3">Advanced</h2>
              <p className="text-gray-300 text-sm mb-4">
                Complex integrations with headless components and complete customization.
              </p>
              <div className="space-y-1 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-red-400" />
                  <span>Headless components</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-red-400" />
                  <span>Custom styling</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-red-400" />
                  <span>Full control</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Examples */}
        <section className="mb-12">
          <h2 className="text-3xl font-space-grotesk font-bold text-white mb-8">
            Complete Examples
          </h2>
          <div className="space-y-8">
            {examples.map((example, index) => (
              <div key={index} className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-semibold text-white">
                      {example.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      example.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                      example.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {example.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-4">
                    {example.description}
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    <strong>Use case:</strong> {example.useCase}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {example.features.map((feature, featureIndex) => (
                      <span 
                        key={featureIndex}
                        className="px-3 py-1 bg-pyhard-blue/20 text-pyhard-blue text-sm rounded-full border border-pyhard-blue/30"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-black/20 rounded-lg p-4">
                  <CodeBlock code={example.code} language="tsx" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Copy Examples */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-pyhard-blue/20 to-pyhard-accent/20 border border-white/20 rounded-xl p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-space-grotesk font-bold text-white mb-4">
              Try These Examples
            </h2>
            <p className="text-gray-300 mb-6">
              Copy any of the examples above and customize them for your needs. Each example is complete and ready to run.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="/demo" 
                className="inline-flex items-center bg-gradient-to-r from-pyhard-blue to-pyhard-accent hover:from-pyhard-blue/90 hover:to-pyhard-accent/90 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Copy className="w-4 h-4 mr-2" />
                Try Interactive Demo
              </a>
              <a 
                href="https://github.com/Dawe000/PyHard" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center border border-white/20 hover:border-white/40 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on GitHub
              </a>
            </div>
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
                🎯 Start Simple
              </h3>
              <p className="text-gray-300 text-sm mb-3">
                Begin with basic components and gradually add complexity. Use styled components first, then move to headless for customization.
              </p>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-3">
                🔄 Handle States
              </h3>
              <p className="text-gray-300 text-sm mb-3">
                Always handle loading, error, and success states. Provide clear feedback to users about what's happening.
              </p>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-3">
                ⚡ Performance
              </h3>
              <p className="text-gray-300 text-sm mb-3">
                Use React.memo for expensive components and avoid unnecessary re-renders. Consider debouncing user inputs.
              </p>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-3">
                🎨 Customization
              </h3>
              <p className="text-gray-300 text-sm mb-3">
                Use headless components for complete control. Maintain consistent styling with your design system.
              </p>
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
              Start with the basic example and gradually add features. Check out the API documentation for detailed component and hook references.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="/docs/api" 
                className="inline-flex items-center justify-center space-x-2 bg-pyhard-blue hover:bg-pyhard-blue/80 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                <span>API Reference</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a 
                href="/docs/getting-started" 
                className="inline-flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-lg font-semibold transition-all"
              >
                <span>Getting Started</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
