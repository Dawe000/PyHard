'use client';

// Styled subscription list component for PyHard Vendor SDK

import React from 'react';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { formatAmount, formatTimestamp, formatInterval, isPaymentDue, getTimeUntilNextPayment } from '../../utils/formatting';
import { getAddressURL } from '../../utils/formatting';
import { SubscriptionListProps } from '../../types';

export function SubscriptionList({ vendorAddress, onPaymentExecuted, className = '' }: SubscriptionListProps) {
  const {
    subscriptions,
    loading,
    error,
    executePayment,
    isPaymentDue,
    getTimeUntilNextPayment,
    refetch
  } = useSubscriptions(vendorAddress);

  const handleExecutePayment = async (subscription: any) => {
    try {
      const txHash = await executePayment(subscription);
      if (onPaymentExecuted) {
        onPaymentExecuted(subscription.subscriptionId, txHash);
      }
    } catch (error) {
      console.error('Payment execution failed:', error);
      alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading && subscriptions.length === 0) {
    return (
      <div className={`pyhard-subscription-list ${className}`}>
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Your Subscriptions
          </h2>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <span className="ml-2 text-gray-400">Loading subscriptions...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`pyhard-subscription-list ${className}`}>
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Your Subscriptions
          </h2>
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">Error loading subscriptions</p>
            <button
              onClick={refetch}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`pyhard-subscription-list ${className}`}>
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Your Subscriptions
              </h2>
              <p className="text-gray-400 text-sm">
                {subscriptions.length} active subscription{subscriptions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={refetch}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        {subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No subscriptions yet</h3>
            <p className="text-gray-400 mb-6">
              Create a subscription QR code to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((subscription, index) => (
              <div
                key={`${subscription.smartWallet}-${subscription.subscriptionId}`}
                className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600 hover:border-gray-500 transition-all duration-200 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">#{subscription.subscriptionId}</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {formatAmount(subscription.amountPerInterval)} PYUSD
                        </h3>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-300 text-sm">
                          {formatInterval(parseInt(subscription.interval))}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>Wallet: {subscription.smartWallet.slice(0, 6)}...{subscription.smartWallet.slice(-4)}</span>
                        <span>•</span>
                        <span>Last: {formatTimestamp(subscription.lastPayment)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-400 mb-1">Next payment</div>
                      <div className="text-white font-medium">
                        {getTimeUntilNextPayment(subscription)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        subscription.active 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          subscription.active ? 'bg-green-400' : 'bg-red-400'
                        }`}></div>
                        {subscription.active ? 'Active' : 'Inactive'}
                      </span>
                      
                      {subscription.active && isPaymentDue(subscription) && (
                        <button
                          onClick={() => handleExecutePayment(subscription)}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          Execute Payment
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
