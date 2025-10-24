import React from 'react';
import { CheckCircle2, ArrowRight, Shield, Zap, Users, CreditCard } from 'lucide-react';


export default function AppDocsPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-space-grotesk font-bold text-white mb-4">
            PyHard Application
          </h1>
          <p className="text-xl text-gray-400">
            Smart wallet system for gasless recurring payments
          </p>
        </div>

        {/* Overview */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-8 backdrop-blur-sm">
            <h2 className="text-3xl font-space-grotesk font-bold text-white mb-6">
              What is PyHard?
            </h2>
            <p className="text-lg text-gray-300 mb-6 leading-relaxed">
              PyHard is a revolutionary smart wallet system built on Arbitrum that enables <span className="text-pyhard-blue font-semibold">gasless recurring payments</span> using EIP-7702 delegation. It eliminates the friction of gas fees for subscription services while maintaining full decentralization.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-pyhard-blue to-pyhard-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Gasless Transactions</h3>
                <p className="text-gray-300 text-sm">Zero gas fees for users through EIP-7702 delegation</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-pyhard-blue to-pyhard-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">PYUSD Stablecoin</h3>
                <p className="text-gray-300 text-sm">Predictable payments with stable value</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-pyhard-blue to-pyhard-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Family Management</h3>
                <p className="text-gray-300 text-sm">Sub-accounts with spending limits and allowances</p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section className="mb-12">
          <h2 className="text-3xl font-space-grotesk font-bold text-white mb-8">
            Core Features
          </h2>
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-pyhard-blue to-pyhard-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">EIP-7702 Delegation</h3>
                  <p className="text-gray-300 mb-4">
                    Users can temporarily delegate their EOA to a smart contract, enabling gasless transactions while maintaining full control of their funds.
                  </p>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                      <span>No gas fees for users</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                      <span>Maintains EOA security</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                      <span>Revocable at any time</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-pyhard-blue to-pyhard-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Smart Wallet System</h3>
                  <p className="text-gray-300 mb-4">
                    Deterministic smart wallet creation using CREATE2, enabling predictable addresses and gasless deployment.
                  </p>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                      <span>Deterministic addresses</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                      <span>Gasless deployment</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                      <span>PYUSD integration</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-pyhard-blue to-pyhard-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Sub-Account Management</h3>
                  <p className="text-gray-300 mb-4">
                    Create and manage sub-accounts with spending limits and time periods, perfect for family allowances and budgeting.
                  </p>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                      <span>Monthly spending limits</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                      <span>Time-based restrictions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                      <span>Real-time monitoring</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Architecture */}
        <section className="mb-12">
          <h2 className="text-3xl font-space-grotesk font-bold text-white mb-8">
            System Architecture
          </h2>
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-8 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Smart Contracts</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-pyhard-accent rounded-full"></div>
                    <span className="text-gray-300">SmartWallet.sol - Core wallet logic</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-pyhard-accent rounded-full"></div>
                    <span className="text-gray-300">EOADelegation.sol - EIP-7702 delegation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-pyhard-accent rounded-full"></div>
                    <span className="text-gray-300">SmartWalletFactory.sol - Deterministic creation</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Infrastructure</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-pyhard-accent rounded-full"></div>
                    <span className="text-gray-300">Cloudflare Worker - Paymaster service</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-pyhard-accent rounded-full"></div>
                    <span className="text-gray-300">Blockscout API - Event monitoring</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-pyhard-accent rounded-full"></div>
                    <span className="text-gray-300">Arbitrum Sepolia - Testnet deployment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-12">
          <h2 className="text-3xl font-space-grotesk font-bold text-white mb-8">
            Use Cases
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-pyhard-blue/20 to-pyhard-accent/20 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-3">Subscription Services</h3>
              <p className="text-gray-300 text-sm mb-4">
                SaaS companies, streaming services, and other subscription-based businesses can accept recurring payments without users paying gas fees.
              </p>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                  <span>Zero gas fees for customers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                  <span>Automatic recurring payments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                  <span>PYUSD stablecoin integration</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pyhard-blue/20 to-pyhard-accent/20 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-3">Family Finance</h3>
              <p className="text-gray-300 text-sm mb-4">
                Parents can create sub-accounts for children with monthly spending limits, teaching financial responsibility while maintaining control.
              </p>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                  <span>Monthly allowance limits</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                  <span>Real-time spending monitoring</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-pyhard-accent" />
                  <span>Easy account management</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section className="mb-12">
          <h2 className="text-3xl font-space-grotesk font-bold text-white mb-8">
            Getting Started
          </h2>
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-8 backdrop-blur-sm">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-pyhard-blue to-pyhard-accent rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Install the SDK</h3>
                  <p className="text-gray-300">Add PyHard Vendor SDK to your project</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-pyhard-blue to-pyhard-accent rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Configure Provider</h3>
                  <p className="text-gray-300">Set up PyHardProvider with your configuration</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-pyhard-blue to-pyhard-accent rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Add Components</h3>
                  <p className="text-gray-300">Use WalletConnect, QR generators, and subscription management</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-pyhard-blue to-pyhard-accent rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Test Integration</h3>
                  <p className="text-gray-300">Use the demo page to test your implementation</p>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/20">
              <a 
                href="/demo" 
                className="inline-flex items-center bg-gradient-to-r from-pyhard-blue to-pyhard-accent hover:from-pyhard-blue/90 hover:to-pyhard-accent/90 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Try the Demo <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
