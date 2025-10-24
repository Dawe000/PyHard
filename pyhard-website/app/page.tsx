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

      {/* What is PyHard Section */}
      <section className="py-24 bg-gradient-to-br from-white/5 to-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-space-grotesk font-bold text-white mb-8">
                What is <span className="bg-gradient-to-r from-pyhard-blue to-pyhard-accent bg-clip-text text-transparent">PyHard</span>?
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                PyHard is a comprehensive crypto wallet ecosystem that makes blockchain accessible to non-technical users through <span className="text-pyhard-blue font-semibold bg-pyhard-blue/10 px-2 py-1 rounded">gasless transactions</span>, QR code payments, social features, and family banking.
              </p>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Built on Arbitrum with PYUSD integration, PyHard enables vendors to accept payments and subscriptions while users enjoy zero gas fees, family sub-wallets, and PayPal-style UX.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-4 group">
                  <div className="w-6 h-6 bg-gradient-to-r from-pyhard-accent to-pyhard-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-200">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-300 text-lg">EIP-7702 delegation for gasless transactions</span>
                </div>
                <div className="flex items-start space-x-4 group">
                  <div className="w-6 h-6 bg-gradient-to-r from-pyhard-accent to-pyhard-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-200">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-300 text-lg">PYUSD stablecoin for predictable payments</span>
                </div>
                <div className="flex items-start space-x-4 group">
                  <div className="w-6 h-6 bg-gradient-to-r from-pyhard-accent to-pyhard-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-200">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-300 text-lg">QR code payments and subscriptions</span>
                </div>
                <div className="flex items-start space-x-4 group">
                  <div className="w-6 h-6 bg-gradient-to-r from-pyhard-accent to-pyhard-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-200">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-300 text-lg">Family banking with sub-wallets and spending limits</span>
                </div>
                <div className="flex items-start space-x-4 group">
                  <div className="w-6 h-6 bg-gradient-to-r from-pyhard-accent to-pyhard-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-200">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-300 text-lg">Social features and contact management</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-pyhard-blue/20 to-pyhard-accent/20 rounded-2xl p-8 border border-white/20 backdrop-blur-sm">
              <div className="space-y-6">
                <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                  <div className="text-sm text-gray-400 mb-2 font-medium">Smart Wallet</div>
                  <div className="font-space-mono text-pyhard-blue text-lg">0x1234...5678</div>
                </div>
                <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                  <div className="text-sm text-gray-400 mb-2 font-medium">Monthly Subscription</div>
                  <div className="text-3xl font-bold text-white">$10.00 PYUSD</div>
                </div>
                <div className="bg-gradient-to-r from-pyhard-accent/20 to-pyhard-blue/20 rounded-xl p-6 border border-pyhard-accent/30">
                  <div className="text-sm text-pyhard-accent mb-2 font-medium">Gas Fees</div>
                  <div className="text-3xl font-bold text-pyhard-accent">$0.00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <Features />

      {/* Explore the App Section */}
      <section id="explore-app" className="py-20 bg-gradient-to-br from-pyhard-accent/5 to-pyhard-blue/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-space-grotesk font-bold text-white mb-4">
              Explore the App
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Discover the PyHard mobile experience with gasless transactions, family banking, and social features
            </p>
          </div>

          {/* Placeholder content - to be filled later */}
          <div className="bg-white/5 rounded-2xl p-12 border border-white/10 text-center">
            <div className="text-6xl mb-6">📱</div>
            <h3 className="text-2xl font-semibold text-white mb-4">
              Mobile App Showcase
            </h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              This section will showcase the PyHard mobile app with screenshots, feature highlights, and user experience demonstrations.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="text-3xl mb-3">💳</div>
                <h4 className="text-lg font-semibold text-white mb-2">Payment Features</h4>
                <p className="text-gray-400 text-sm">QR code payments, gasless transactions, and social payments</p>
              </div>
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="text-3xl mb-3">👨‍👩‍👧‍👦</div>
                <h4 className="text-lg font-semibold text-white mb-2">Family Banking</h4>
                <p className="text-gray-400 text-sm">Sub-wallets, spending limits, and parental controls</p>
              </div>
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="text-3xl mb-3">📊</div>
                <h4 className="text-lg font-semibold text-white mb-2">Subscription Management</h4>
                <p className="text-gray-400 text-sm">Recurring payments, vendor subscriptions, and payment history</p>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* Why We Built It Section */}
      <section className="py-20 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-space-grotesk font-bold text-white mb-4">
              Why We Built It
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Solving the gas fee problem for recurring payments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-8">
              <h3 className="text-2xl font-semibold text-white mb-4">❌ The Problem</h3>
              <p className="text-gray-300 mb-4">
                Traditional blockchain subscriptions require users to pay gas for every payment, making small recurring payments impractical.
              </p>
              <ul className="space-y-2 text-gray-400">
                <li>• High gas fees eat into subscription value</li>
                <li>• Users must manually approve each payment</li>
                <li>• Complex UX discourages adoption</li>
              </ul>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-8">
              <h3 className="text-2xl font-semibold text-white mb-4">✅ The Solution</h3>
              <p className="text-gray-300 mb-4">
                PyHard uses EIP-7702 to delegate transaction execution to a paymaster, enabling truly gasless subscriptions.
              </p>
              <ul className="space-y-2 text-gray-400">
                <li>• Zero gas fees for end users</li>
                <li>• One-time authorization for recurring payments</li>
                <li>• Simple QR code-based onboarding</li>
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
              How It Works
            </h2>
            <p className="text-xl text-gray-400">
              Four simple steps to gasless subscriptions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Create QR Code',
                description: 'Vendor generates a subscription QR code with amount and interval'
              },
              {
                step: '2',
                title: 'Scan & Authorize',
                description: 'User scans QR code with PyHard mobile app and authorizes'
              },
              {
                step: '3',
                title: 'Gasless Setup',
                description: 'EIP-7702 delegation enables gasless transaction execution'
              },
              {
                step: '4',
                title: 'Execute Payments',
                description: 'Vendor executes payments when due, user pays zero gas'
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
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Build gasless subscription systems on Arbitrum today
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
