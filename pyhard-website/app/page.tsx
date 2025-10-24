import React from 'react';
import Link from 'next/link';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { ArrowRight, CheckCircle2 } from 'lucide-react';


export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <Hero />

      {/* What is PyHard Section */}
      <section className="py-24 bg-gradient-to-br from-white/5 to-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-space-grotesk font-bold text-white mb-8">
                What is <span className="bg-gradient-to-r from-pyhard-blue to-pyhard-accent bg-clip-text text-transparent">PyHard</span>?
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                PyHard is a smart wallet system built on Arbitrum that enables <span className="text-pyhard-blue font-semibold bg-pyhard-blue/10 px-2 py-1 rounded">gasless recurring payments</span> using EIP-7702 delegation.
              </p>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Vendors can accept subscriptions without users paying gas fees, and users can manage sub-accounts with spending limits for family allowances and budgeting.
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
                  <span className="text-gray-300 text-lg">Sub-account system for family management</span>
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
                  <span>Try Demo</span>
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
              <span>View Demo</span>
            </Link>
          </div>
          
          {/* Links */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6">
            <a 
              href="https://www.npmjs.com/settings/dawe0000/packages" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-pyhard-blue transition-colors duration-200 text-sm"
            >
              📦 npm package
            </a>
            <a 
              href="https://github.com/Dawe000/PyHard" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-pyhard-blue transition-colors duration-200 text-sm"
            >
              🐙 GitHub repository
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
