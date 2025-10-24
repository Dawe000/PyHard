'use client';

import React, { useState } from 'react';
import {
  WalletConnect,
  SubscriptionQRGenerator,
  PaymentQRGenerator,
  SubscriptionList,
  useWallet
} from 'pyhard-vendor-sdk';

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<'subscription' | 'payment'>('subscription');
  const { address } = useWallet();

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-space-grotesk font-bold text-white mb-4">
            Interactive Demo
          </h1>
          <p className="text-xl text-gray-400">
            Try out the PyHard Vendor SDK with real wallet connections
          </p>
        </div>

        {/* Demo Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Wallet Connection */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                1. Connect Wallet
              </h2>
              <WalletConnect />
            </div>

            {/* QR Generator */}
            {address && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  2. Generate QR Code
                </h2>
                
                {/* Tab Switcher */}
                <div className="flex space-x-2 mb-4 bg-white/5 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('subscription')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'subscription'
                        ? 'bg-pyhard-blue text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Subscription
                  </button>
                  <button
                    onClick={() => setActiveTab('payment')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'payment'
                        ? 'bg-pyhard-blue text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Payment
                  </button>
                </div>

                {/* QR Generators */}
                {activeTab === 'subscription' ? (
                  <SubscriptionQRGenerator />
                ) : (
                  <PaymentQRGenerator />
                )}
              </div>
            )}
          </div>

          {/* Middle Column: Instructions */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-pyhard-blue/20 to-pyhard-accent/20 border border-white/10 rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-white mb-4">
                How to Use This Demo
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-pyhard-blue rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Connect Your Wallet</h3>
                    <p className="text-gray-300 text-sm">
                      Use Reown AppKit to connect your wallet, or enter a wallet address manually
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-pyhard-blue rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Generate QR Code</h3>
                    <p className="text-gray-300 text-sm">
                      Choose between subscription or payment QR codes, enter the amount and details
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-pyhard-blue rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Scan with Mobile App</h3>
                    <p className="text-gray-300 text-sm">
                      Use the PyHard mobile app to scan the QR code and authorize the subscription
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-pyhard-blue rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Manage Subscriptions</h3>
                    <p className="text-gray-300 text-sm">
                      View active subscriptions and execute payments when they're due
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-white font-semibold mb-2">💡 Pro Tip</h3>
                <p className="text-gray-300 text-sm">
                  This demo uses the actual PyHard Vendor SDK. All components are fully functional and connect to Arbitrum Sepolia testnet.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Subscriptions */}
          <div className="lg:col-span-1">
            {address ? (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Your Subscriptions
                </h2>
                <SubscriptionList 
                  vendorAddress={address}
                  onPaymentExecuted={(subscriptionId, txHash) => {
                    console.log('Payment executed:', subscriptionId, txHash);
                    alert(`Payment executed successfully!\nTx: ${txHash.slice(0, 10)}...`);
                  }}
                />
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
                <p className="text-gray-400">
                  Connect your wallet to view subscriptions
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-12 bg-pyhard-blue/10 border border-pyhard-blue/30 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="text-pyhard-blue text-2xl">ℹ️</div>
            <div>
              <h3 className="text-white font-semibold mb-2">About This Demo</h3>
              <p className="text-gray-300 text-sm mb-2">
                This interactive demo showcases the PyHard Vendor SDK in action. All components are real and functional:
              </p>
              <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
                <li>Wallet connections use Reown AppKit</li>
                <li>QR codes are generated with the actual SDK utilities</li>
                <li>Subscription data is fetched from Arbitrum Sepolia via Blockscout</li>
                <li>Payment execution sends real transactions (on testnet)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
