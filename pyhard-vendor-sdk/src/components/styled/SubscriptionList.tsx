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
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Active Subscriptions
          </h2>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading subscriptions...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`pyhard-subscription-list ${className}`}>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Active Subscriptions
          </h2>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Error loading subscriptions</p>
            <button
              onClick={refetch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Active Subscriptions
          </h2>
          <button
            onClick={refetch}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Refresh
          </button>
        </div>

        {subscriptions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">
              No active subscriptions found. Create a subscription QR code to get started!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Smart Wallet
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Interval
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Last Payment
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Next Due
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription) => (
                  <tr
                    key={`${subscription.smartWallet}-${subscription.subscriptionId}`}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <a
                        href={getAddressURL(subscription.smartWallet)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-blue-600 hover:text-blue-800"
                      >
                        {subscription.smartWallet.slice(0, 6)}...{subscription.smartWallet.slice(-4)}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {formatAmount(subscription.amountPerInterval)}
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {formatInterval(parseInt(subscription.interval))}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {formatTimestamp(subscription.lastPayment)}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {getTimeUntilNextPayment(subscription)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isPaymentDue(subscription)
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {isPaymentDue(subscription) ? 'Payment Due' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleExecutePayment(subscription)}
                        disabled={!isPaymentDue(subscription) || loading}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          isPaymentDue(subscription) && !loading
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {loading ? 'Loading...' : isPaymentDue(subscription) ? 'Execute Payment' : 'Not Due Yet'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
