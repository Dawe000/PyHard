'use client';

// Styled payment history component for PyHard Vendor SDK

import React from 'react';
import { usePaymentHistory } from '../../hooks/usePaymentHistory';
import { formatAmount, formatTimestamp, getTransactionURL } from '../../utils/formatting';
import { PaymentHistoryProps } from '../../types';

export function PaymentHistory({ smartWalletAddress, subscriptionId, className = '' }: PaymentHistoryProps) {
  const { payments, loading, error, refetch } = usePaymentHistory(smartWalletAddress, subscriptionId);

  if (loading && payments.length === 0) {
    return (
      <div className={`pyhard-payment-history ${className}`}>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Payment History
          </h3>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading payment history...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`pyhard-payment-history ${className}`}>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Payment History
          </h3>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Error loading payment history</p>
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
    <div className={`pyhard-payment-history ${className}`}>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Payment History
          </h3>
          <button
            onClick={refetch}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Refresh
          </button>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600">No payment history found</p>
            <p className="text-sm text-gray-500 mt-1">Payments will appear here when executed</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment, index) => (
              <div
                key={payment.transactionHash}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Payment Executed</p>
                    <p className="text-sm text-gray-500 font-mono">
                      {payment.transactionHash.slice(0, 6)}...{payment.transactionHash.slice(-4)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatAmount(payment.amount)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatTimestamp(payment.timestamp)}
                  </p>
                </div>
                <div className="ml-4">
                  <a
                    href={getTransactionURL(payment.transactionHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
