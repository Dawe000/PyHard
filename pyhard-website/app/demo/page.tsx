'use client';

import React, { useState } from 'react';

export const runtime = 'edge';
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

        {/* Instructions */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-pyhard-blue/20 to-pyhard-accent/20 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
              <span className="mr-3">📋</span>
              How to Use This Demo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-pyhard-blue to-pyhard-accent rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Connect Wallet</h3>
                  <p className="text-gray-300 text-sm">Use Reown AppKit or enter address manually</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-pyhard-blue to-pyhard-accent rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Generate QR Code</h3>
                  <p className="text-gray-300 text-sm">Create subscription or payment QR codes</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-pyhard-blue to-pyhard-accent rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Scan with Mobile</h3>
                  <p className="text-gray-300 text-sm">Use PyHard mobile app to authorize</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-pyhard-blue to-pyhard-accent rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Manage Payments</h3>
                  <p className="text-gray-300 text-sm">View and execute subscription payments</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Demo Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left: Wallet Connection */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-pyhard-blue to-pyhard-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🔗</span>
              </div>
              <h2 className="text-xl font-semibold text-white">
                Connect Your Wallet
              </h2>
            </div>
            <div className="wallet-connect-simple">
              <WalletConnect />
              <style jsx>{`
                .wallet-connect-simple .flex.space-x-2 {
                  display: none !important;
                }
                .wallet-connect-simple .space-y-2:has(input) {
                  display: none !important;
                }
              `}</style>
            </div>
          </div>

          {/* Right: QR Generator */}
          {address && (
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-pyhard-blue to-pyhard-accent rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">📱</span>
                </div>
                <h2 className="text-xl font-semibold text-white">
                  Generate QR Code
                </h2>
              </div>
              
              {/* Tab Switcher */}
              <div className="flex space-x-2 mb-6 bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('subscription')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === 'subscription'
                      ? 'bg-gradient-to-r from-pyhard-blue to-pyhard-accent text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Subscription
                </button>
                <button
                  onClick={() => setActiveTab('payment')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === 'payment'
                      ? 'bg-gradient-to-r from-pyhard-blue to-pyhard-accent text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
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

        {/* Subscriptions Section */}
        {address && (
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-8 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-pyhard-blue to-pyhard-accent rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">📊</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">
                Your Subscriptions
              </h2>
            </div>
            <SubscriptionList 
              vendorAddress={address}
              onPaymentExecuted={(subscriptionId, txHash) => {
                console.log('Payment executed:', subscriptionId, txHash);
                alert(`Payment executed successfully!\nTx: ${txHash.slice(0, 10)}...`);
              }}
            />
          </div>
        )}

      </div>
    </div>
  );
}
