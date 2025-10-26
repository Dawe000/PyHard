import React from 'react';
import Link from 'next/link';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { ArrowRight, CheckCircle2 } from 'lucide-react';


export default function Home() {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <Hero />

      {/* Quick Links Section */}
      <section className="py-8 bg-gradient-to-r from-pyhard-blue/10 to-pyhard-accent/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
            <a 
              href="https://www.npmjs.com/package/pyhard-vendor-sdk" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-3 bg-pyhard-blue hover:bg-pyhard-blue/80 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <span className="text-2xl">📦</span>
              <div>
                <div className="text-sm opacity-90">Install via npm</div>
                <div className="font-mono text-sm">pyhard-vendor-sdk</div>
              </div>
            </a>
            <a 
              href="https://github.com/Dawe000/PyHard" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-3 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <span className="text-2xl">🐙</span>
              <div>
                <div className="text-sm opacity-90">View on GitHub</div>
                <div className="font-mono text-sm">PyHard Ecosystem</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Banking Experience Section */}
      <section className="py-24 bg-gradient-to-br from-white/5 to-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-space-grotesk font-bold text-white mb-8">
                Banking <span className="bg-gradient-to-r from-pyhard-blue to-pyhard-accent bg-clip-text text-transparent">Reimagined</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                PyHard brings the familiar banking experience you love with the power of blockchain. Think PayPal meets crypto - <span className="text-pyhard-blue font-semibold bg-pyhard-blue/10 px-2 py-1 rounded">zero gas fees</span>, instant global payments, and family financial management.
              </p>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Send money to friends, pay for subscriptions, manage family allowances - all with the simplicity of traditional banking, but with the transparency and security of blockchain.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-4 group">
                  <div className="w-6 h-6 bg-gradient-to-r from-pyhard-accent to-pyhard-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-200">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-300 text-lg">Familiar banking interface - no crypto complexity</span>
                </div>
                <div className="flex items-start space-x-4 group">
                  <div className="w-6 h-6 bg-gradient-to-r from-pyhard-accent to-pyhard-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-200">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-300 text-lg">PYUSD stablecoin - your money stays stable</span>
                </div>
                <div className="flex items-start space-x-4 group">
                  <div className="w-6 h-6 bg-gradient-to-r from-pyhard-accent to-pyhard-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-200">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-300 text-lg">QR code payments - scan and pay instantly</span>
                </div>
                <div className="flex items-start space-x-4 group">
                  <div className="w-6 h-6 bg-gradient-to-r from-pyhard-accent to-pyhard-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-200">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-300 text-lg">Family banking - manage kids' allowances and spending</span>
                </div>
                <div className="flex items-start space-x-4 group">
                  <div className="w-6 h-6 bg-gradient-to-r from-pyhard-accent to-pyhard-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-200">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-300 text-lg">Social payments - send money to contacts easily</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-pyhard-blue/20 to-pyhard-accent/20 rounded-2xl p-8 border border-white/20 backdrop-blur-sm">
              <div className="space-y-6">
                <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                  <div className="text-sm text-gray-400 mb-2 font-medium">Your Digital Wallet</div>
                  <div className="font-space-mono text-pyhard-blue text-lg">0x1234...5678</div>
                </div>
                <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                  <div className="text-sm text-gray-400 mb-2 font-medium">Netflix Subscription</div>
                  <div className="text-3xl font-bold text-white">$15.99 PYUSD</div>
                  <div className="text-sm text-gray-400 mt-1">Auto-pays monthly</div>
                </div>
                <div className="bg-gradient-to-r from-pyhard-accent/20 to-pyhard-blue/20 rounded-xl p-6 border border-pyhard-accent/30">
                  <div className="text-sm text-pyhard-accent mb-2 font-medium">Transaction Fees</div>
                  <div className="text-3xl font-bold text-pyhard-accent">$0.00</div>
                  <div className="text-sm text-pyhard-accent mt-1">Always free for you</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <Features />


      {/* Ecosystem Components Section */}
      <section className="py-20 bg-gradient-to-br from-pyhard-blue/5 to-pyhard-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-space-grotesk font-bold text-white mb-4">
              Complete Ecosystem
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              PyHard consists of 6 core components working together to create a seamless crypto experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "PyHard Mobile App",
                description: "Main wallet for users with gasless transactions, QR code payments, and social features",
                icon: "📱",
                features: ["PYUSD Balance", "Transaction History", "Sub-Accounts", "Social Payments"]
              },
              {
                title: "PyHard Child App", 
                description: "Specialized app for children with parental controls and allowance management",
                icon: "👶",
                features: ["Allowance Tracking", "Spending Limits", "QR Code Scanning", "Parental Controls"]
              },
              {
                title: "Paymaster Worker",
                description: "Cloudflare Worker providing gas sponsorship for all transactions",
                icon: "⚡",
                features: ["Gas Sponsorship", "EIP-7702 Support", "Rate Limiting", "Multi-chain Support"]
              },
              {
                title: "Vendor SDK",
                description: "React SDK for vendors to integrate payments and subscriptions",
                icon: "🛠️",
                features: ["QR Code Generation", "Payment Processing", "Subscription Management", "Real-time Detection"]
              },
              {
                title: "Smart Contracts",
                description: "Core blockchain infrastructure with account abstraction",
                icon: "🔗",
                features: ["Account Abstraction", "Subscription System", "Sub-Wallet Management", "Cross-chain Bridge"]
              },
              {
                title: "Documentation Site",
                description: "Comprehensive documentation and interactive demo",
                icon: "📚",
                features: ["SDK Documentation", "API Reference", "Live Demo", "Integration Guides"]
              }
            ].map((component, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-pyhard-blue/30 transition-all duration-300">
                <div className="text-4xl mb-4">{component.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{component.title}</h3>
                <p className="text-gray-400 mb-4">{component.description}</p>
                <div className="space-y-2">
                  {component.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-pyhard-accent flex-shrink-0" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility & Banking Section */}
      <section className="py-20 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-space-grotesk font-bold text-white mb-4">
              Making Crypto Accessible
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Bringing the banking experience you know to the blockchain world
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-8">
              <h3 className="text-2xl font-semibold text-white mb-4">❌ Traditional Crypto</h3>
              <p className="text-gray-300 mb-4">
                Current crypto wallets are complex, expensive, and intimidating for everyday users.
              </p>
              <ul className="space-y-2 text-gray-400">
                <li>• High gas fees make small payments impossible</li>
                <li>• Complex interfaces scare away non-technical users</li>
                <li>• No family financial management tools</li>
                <li>• Difficult to send money to friends and family</li>
              </ul>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-8">
              <h3 className="text-2xl font-semibold text-white mb-4">✅ PyHard Banking</h3>
              <p className="text-gray-300 mb-4">
                PyHard brings familiar banking UX with blockchain benefits - zero fees, instant payments, and family controls.
              </p>
              <ul className="space-y-2 text-gray-400">
                <li>• Zero gas fees - always free for users</li>
                <li>• PayPal-style interface everyone understands</li>
                <li>• Family banking with parental controls</li>
                <li>• Send money to contacts like Venmo</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-space-grotesk font-bold text-white mb-4">
              Simple as Banking
            </h2>
            <p className="text-xl text-gray-400">
              Four easy steps to start using PyHard
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Sign Up',
                description: 'Create your account with email or social login - no crypto setup needed'
              },
              {
                step: '2',
                title: 'Add Money',
                description: 'Fund your wallet with PYUSD stablecoin - your money stays stable'
              },
              {
                step: '3',
                title: 'Start Paying',
                description: 'Send money to friends, pay subscriptions, or scan QR codes to pay'
              },
              {
                step: '4',
                title: 'Manage Family',
                description: 'Create sub-wallets for kids with spending limits and parental controls'
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pyhard-blue to-pyhard-accent rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Vendors Section */}
      <section className="py-20 bg-gradient-to-br from-pyhard-blue/10 to-pyhard-accent/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-space-grotesk font-bold text-white mb-4">
              For Vendors
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Integrate PyHard into your application with our easy-to-use SDK
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-white mb-6">
                Easy Integration
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-pyhard-accent flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-white font-semibold">Styled Components</div>
                    <div className="text-gray-400">Ready-to-use components with beautiful UI</div>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-pyhard-accent flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-white font-semibold">Headless Components</div>
                    <div className="text-gray-400">Fully customizable with render props</div>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-pyhard-accent flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-white font-semibold">Real-time Detection</div>
                    <div className="text-gray-400">Instant payment notifications via polling</div>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-pyhard-accent flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-white font-semibold">TypeScript Support</div>
                    <div className="text-gray-400">Fully typed for better DX</div>
                  </div>
                </li>
              </ul>

              <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  href="/docs"
                  className="inline-flex items-center justify-center space-x-2 bg-pyhard-blue hover:bg-pyhard-blue/80 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  <span>Read Documentation</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  <span>Payments SDK Demo</span>
                </Link>
              </div>
            </div>

            <div className="bg-pyhard-dark/50 rounded-lg p-6 border border-white/10">
              <pre className="text-sm text-gray-300 font-space-mono overflow-x-auto">
                <code>{`import { 
  PyHardProvider,
  SubscriptionQRGenerator,
  SubscriptionList
} from 'pyhard-vendor-sdk';

function App() {
  return (
    <PyHardProvider>
      <SubscriptionQRGenerator />
      <SubscriptionList 
        vendorAddress="0x..." 
      />
    </PyHardProvider>
  );
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-space-grotesk font-bold text-white mb-6">
            Ready to Bank Better?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Experience the future of digital banking with zero fees and instant global payments
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              href="/docs/getting-started"
              className="inline-flex items-center space-x-2 bg-pyhard-blue hover:bg-pyhard-blue/80 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-lg font-semibold transition-all"
            >
              <span>Payments SDK Demo</span>
            </Link>
            <Link
              href="/explore-app"
              className="inline-flex items-center space-x-2 bg-pyhard-accent/10 hover:bg-pyhard-accent/20 text-pyhard-accent border border-pyhard-accent/30 px-8 py-4 rounded-lg font-semibold transition-all"
            >
              <span>Explore the App</span>
            </Link>
          </div>
          
          {/* Links */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Built with PYUSD, Hardhat, and Blockscout integration
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
