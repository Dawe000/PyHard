import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Smartphone, Users, CreditCard, Shield, Zap } from 'lucide-react';

export default function ExploreApp() {
  return (
    <div className="min-h-screen bg-pyhard-dark pt-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-pyhard-blue/10 to-pyhard-accent/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="text-center">
              <h1 className="text-3xl font-space-grotesk font-bold text-white">
                Explore the App
              </h1>
              <p className="text-gray-400 mt-2">
                Discover the PyHard mobile experience
              </p>
            </div>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Placeholder Content */}
        <div className="text-center mb-12">
          <div className="text-8xl mb-6">📱</div>
          <h2 className="text-4xl font-space-grotesk font-bold text-white mb-4">
            PyHard Mobile App
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            This page will showcase the complete PyHard mobile app experience with screenshots, 
            feature demonstrations, and detailed walkthroughs.
          </p>
        </div>

        {/* Feature Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: <Smartphone className="w-8 h-8 text-pyhard-blue" />,
              title: "Mobile Wallet",
              description: "Complete mobile wallet experience with gasless transactions",
              features: ["PYUSD Balance", "Transaction History", "Quick Actions", "Address Management"]
            },
            {
              icon: <Users className="w-8 h-8 text-pyhard-accent" />,
              title: "Family Banking",
              description: "Sub-wallets and family management features",
              features: ["Sub-Accounts", "Spending Limits", "Parental Controls", "Allowance Management"]
            },
            {
              icon: <CreditCard className="w-8 h-8 text-green-400" />,
              title: "Payment System",
              description: "QR code payments and subscription management",
              features: ["QR Code Payments", "Subscription Management", "Social Payments", "Contact Management"]
            },
            {
              icon: <Shield className="w-8 h-8 text-purple-400" />,
              title: "Security",
              description: "Advanced security with account abstraction",
              features: ["EIP-7702 Delegation", "Biometric Auth", "Private Key Protection", "Transaction Signing"]
            },
            {
              icon: <Zap className="w-8 h-8 text-yellow-400" />,
              title: "Gasless Experience",
              description: "Zero gas fees for all transactions",
              features: ["Gas Sponsorship", "Paymaster Integration", "Automatic Sponsorship", "Rate Limiting"]
            }
          ].map((feature, index) => (
            <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-pyhard-blue/30 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                {feature.icon}
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              </div>
              <p className="text-gray-400 mb-4">{feature.description}</p>
              <div className="space-y-2">
                {feature.features.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-pyhard-accent rounded-full"></div>
                    <span className="text-sm text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* App Screenshots Placeholder */}
        <div className="bg-white/5 rounded-2xl p-12 border border-white/10 mb-16">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-white mb-4">App Screenshots</h3>
            <p className="text-gray-400 mb-8">
              This section will showcase actual app screenshots and interface demonstrations
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/10 rounded-lg p-8 text-center">
                <div className="text-4xl mb-4">📱</div>
                <h4 className="text-lg font-semibold text-white mb-2">Balance Screen</h4>
                <p className="text-gray-400 text-sm">PYUSD balance, quick actions, and recent activity</p>
              </div>
              <div className="bg-white/10 rounded-lg p-8 text-center">
                <div className="text-4xl mb-4">💳</div>
                <h4 className="text-lg font-semibold text-white mb-2">Payment Flow</h4>
                <p className="text-gray-400 text-sm">QR code scanning and payment processing</p>
              </div>
              <div className="bg-white/10 rounded-lg p-8 text-center">
                <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
                <h4 className="text-lg font-semibold text-white mb-2">Family Management</h4>
                <p className="text-gray-400 text-sm">Sub-accounts and parental controls</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Experience Section */}
        <div className="bg-gradient-to-br from-pyhard-blue/10 to-pyhard-accent/10 rounded-2xl p-12 border border-white/10">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-white mb-4">User Experience</h3>
            <p className="text-gray-400 mb-8 max-w-3xl mx-auto">
              This section will include user journey demonstrations, step-by-step walkthroughs, 
              and interactive app demonstrations.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/5 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-3">Getting Started</h4>
                <p className="text-gray-400 text-sm mb-4">Onboarding flow and initial setup</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-pyhard-blue rounded-full flex items-center justify-center text-xs text-white">1</div>
                    <span className="text-sm text-gray-300">Download and install app</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-pyhard-blue rounded-full flex items-center justify-center text-xs text-white">2</div>
                    <span className="text-sm text-gray-300">Connect wallet or create new</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-pyhard-blue rounded-full flex items-center justify-center text-xs text-white">3</div>
                    <span className="text-sm text-gray-300">Start using gasless transactions</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-3">Key Features</h4>
                <p className="text-gray-400 text-sm mb-4">Core functionality demonstrations</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-pyhard-accent rounded-full"></div>
                    <span className="text-sm text-gray-300">Gasless payments</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-pyhard-accent rounded-full"></div>
                    <span className="text-sm text-gray-300">QR code scanning</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-pyhard-accent rounded-full"></div>
                    <span className="text-sm text-gray-300">Family banking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-pyhard-accent rounded-full"></div>
                    <span className="text-sm text-gray-300">Subscription management</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-semibold text-white mb-4">Ready to Experience PyHard?</h3>
          <p className="text-gray-400 mb-8">
            Download the app and start using gasless transactions today
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              href="/docs"
              className="inline-flex items-center space-x-2 bg-pyhard-blue hover:bg-pyhard-blue/80 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              <span>Read Documentation</span>
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-lg font-semibold transition-all"
            >
              <span>Try Payments SDK Demo</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
