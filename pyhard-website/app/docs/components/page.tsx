import React from 'react';
import { CodeBlock } from '@/components/CodeBlock';
import { CheckCircle2, ArrowRight, Eye, Code } from 'lucide-react';
import { DocsLayout } from '@/components/DocsLayout';

export const runtime = 'edge';

export default function ComponentsPage() {
  const walletConnectCode = `import { WalletConnect } from 'pyhard-vendor-sdk';

function MyApp() {
  return (
    <WalletConnect 
      onAddressChange={(address) => console.log('Address:', address)}
      showManualInput={true} // Optional, defaults to true
    />
  );
}`;

  const subscriptionQRCode = `import { SubscriptionQRGenerator } from 'pyhard-vendor-sdk';

function CreateSubscription() {
  return (
    <SubscriptionQRGenerator 
      onQRGenerated={(qrData) => {
        console.log('QR Code Data:', qrData);
        // Handle QR code generation
      }}
    />
  );
}`;

  const paymentQRCode = `import { PaymentQRGenerator } from 'pyhard-vendor-sdk';

function CreatePayment() {
  return (
    <PaymentQRGenerator 
      onQRGenerated={(qrData) => {
        console.log('Payment QR:', qrData);
        // Handle payment QR generation
      }}
    />
  );
}`;

  const subscriptionListCode = `import { SubscriptionList } from 'pyhard-vendor-sdk';

function MySubscriptions() {
  return (
    <SubscriptionList 
      vendorAddress="0x..." 
      onPaymentExecuted={(subscriptionId, txHash) => {
        console.log('Payment executed:', subscriptionId, txHash);
      }}
    />
  );
}`;

  const paymentHistoryCode = `import { PaymentHistory } from 'pyhard-vendor-sdk';

function SubscriptionHistory() {
  return (
    <PaymentHistory 
      smartWalletAddress="0x..."
      subscriptionId={1}
    />
  );
}`;

  const headlessExampleCode = `import { 
  SubscriptionQRGenerator as HeadlessSubscriptionQRGenerator 
} from 'pyhard-vendor-sdk';

function CustomSubscriptionForm() {
  return (
    <HeadlessSubscriptionQRGenerator>
      {({ generateQR, isGenerating }) => (
        <div className="my-custom-styling">
          <button 
            onClick={generateQR}
            disabled={isGenerating}
            className="my-button"
          >
            {isGenerating ? 'Generating...' : 'Create QR Code'}
          </button>
        </div>
      )}
    </HeadlessSubscriptionQRGenerator>
  );
}`;

  const components = [
    {
      name: 'WalletConnect',
      description: 'Connect wallets via Reown AppKit or manual address input',
      features: ['Reown AppKit integration', 'Manual address input', 'Connection state management'],
      code: walletConnectCode,
      props: [
        { name: 'onAddressChange', type: '(address: string) => void', required: false, description: 'Callback when address changes' },
        { name: 'showManualInput', type: 'boolean', required: false, description: 'Show manual address input toggle (default: true)' }
      ]
    },
    {
      name: 'SubscriptionQRGenerator',
      description: 'Generate QR codes for subscription requests',
      features: ['Amount input', 'Interval selection', 'QR code generation', 'Copy to clipboard'],
      code: subscriptionQRCode,
      props: [
        { name: 'onQRGenerated', type: '(qrData: QRCodeData) => void', required: false, description: 'Callback when QR is generated' }
      ]
    },
    {
      name: 'PaymentQRGenerator',
      description: 'Generate QR codes for payment requests',
      features: ['Amount input', 'Recipient address', 'QR code generation', 'Copy to clipboard'],
      code: paymentQRCode,
      props: [
        { name: 'onQRGenerated', type: '(qrData: QRCodeData) => void', required: false, description: 'Callback when QR is generated' }
      ]
    },
    {
      name: 'SubscriptionList',
      description: 'Display and manage subscriptions for a vendor',
      features: ['Subscription listing', 'Payment execution', 'Status indicators', 'Real-time updates'],
      code: subscriptionListCode,
      props: [
        { name: 'vendorAddress', type: 'string', required: true, description: 'Vendor wallet address' },
        { name: 'onPaymentExecuted', type: '(subscriptionId: number, txHash: string) => void', required: false, description: 'Callback when payment is executed' }
      ]
    },
    {
      name: 'PaymentHistory',
      description: 'Display payment history for a subscription',
      features: ['Payment listing', 'Transaction details', 'Timestamps', 'Amount formatting'],
      code: paymentHistoryCode,
      props: [
        { name: 'smartWalletAddress', type: 'string', required: true, description: 'Smart wallet address' },
        { name: 'subscriptionId', type: 'number', required: true, description: 'Subscription ID' }
      ]
    }
  ];

  return (
    <DocsLayout title="Components" description="Styled and headless components for PyHard integration">

        {/* Component Types */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-pyhard-blue/20 to-pyhard-accent/20 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-4">
                <Eye className="w-6 h-6 text-pyhard-blue" />
                <h2 className="text-xl font-semibold text-white">Styled Components</h2>
              </div>
              <p className="text-gray-300 mb-4">
                Ready-to-use components with beautiful Tailwind CSS styling. Perfect for quick integration.
              </p>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                  <span>Pre-styled with Tailwind CSS</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                  <span>Responsive design</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                  <span>Dark theme optimized</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pyhard-blue/20 to-pyhard-accent/20 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-4">
                <Code className="w-6 h-6 text-pyhard-accent" />
                <h2 className="text-xl font-semibold text-white">Headless Components</h2>
              </div>
              <p className="text-gray-300 mb-4">
                Fully customizable components using render props. Bring your own UI while leveraging PyHard's functionality.
              </p>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                  <span>Render prop pattern</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                  <span>Complete customization</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                  <span>Framework agnostic</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Styled Components */}
        <section id="styled-components" className="mb-12">
          <h2 className="text-3xl font-space-grotesk font-bold text-white mb-8">
            Styled Components
          </h2>
          <div className="space-y-8">
            {components.map((component, index) => (
              <div key={index} id={component.name.toLowerCase()} className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    {component.name}
                  </h3>
                  <p className="text-gray-300 mb-4">
                    {component.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {component.features.map((feature, featureIndex) => (
                      <span 
                        key={featureIndex}
                        className="px-3 py-1 bg-pyhard-blue/20 text-pyhard-blue text-sm rounded-full border border-pyhard-blue/30"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3">Props</h4>
                  <div className="space-y-2">
                    {component.props.map((prop, propIndex) => (
                      <div key={propIndex} className="flex items-start space-x-3 text-sm">
                        <code className="text-pyhard-blue font-mono bg-black/20 px-2 py-1 rounded">
                          {prop.name}
                        </code>
                        <span className="text-gray-400">({prop.type})</span>
                        {prop.required && (
                          <span className="text-red-400 text-xs">required</span>
                        )}
                        <span className="text-gray-300">- {prop.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-black/20 rounded-lg p-4">
                  <CodeBlock code={component.code} language="tsx" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Headless Components */}
        <section className="mb-12">
          <h2 className="text-3xl font-space-grotesk font-bold text-white mb-8">
            Headless Components
          </h2>
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-white mb-4">
              Custom Styling with Render Props
            </h3>
            <p className="text-gray-300 mb-6">
              All styled components have headless equivalents that use the render prop pattern. 
              This allows you to completely customize the UI while keeping all the functionality.
            </p>
            
            <div className="bg-black/20 rounded-lg p-4 mb-6">
              <CodeBlock code={headlessExampleCode} language="tsx" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Available Headless Components</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                    <span>WalletConnect</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                    <span>SubscriptionQRGenerator</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                    <span>PaymentQRGenerator</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                    <span>SubscriptionList</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                    <span>PaymentHistory</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Benefits</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                    <span>Complete UI control</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                    <span>Framework flexibility</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                    <span>Design system integration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                    <span>Accessibility control</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Usage Tips */}
        <section className="mb-12">
          <h2 className="text-3xl font-space-grotesk font-bold text-white mb-8">
            Usage Tips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-3">
                🎨 Styling
              </h3>
              <p className="text-gray-300 text-sm mb-3">
                Styled components use Tailwind CSS classes. You can override styles by passing custom className props or using CSS-in-JS.
              </p>
              <div className="bg-black/20 rounded-lg p-3">
                <code className="text-sm text-gray-300">
                  {`<WalletConnect className="my-custom-styles" />`}
                </code>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-3">
                🔧 Customization
              </h3>
              <p className="text-gray-300 text-sm mb-3">
                For complete control, use headless components with render props. This gives you full access to the component's state and methods.
              </p>
              <div className="bg-black/20 rounded-lg p-3">
                <code className="text-sm text-gray-300">
                  {`<SubscriptionQRGenerator>{({ generateQR, isGenerating }) => ...}</SubscriptionQRGenerator>`}
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
              Explore the hooks documentation to understand the underlying functionality, or jump to examples to see complete implementations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="/docs/hooks" 
                className="inline-flex items-center justify-center space-x-2 bg-pyhard-blue hover:bg-pyhard-blue/80 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                <span>View Hooks</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a 
                href="/docs/examples" 
                className="inline-flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-lg font-semibold transition-all"
              >
                <span>See Examples</span>
              </a>
            </div>
          </div>
        </section>
    </DocsLayout>
  );
}
