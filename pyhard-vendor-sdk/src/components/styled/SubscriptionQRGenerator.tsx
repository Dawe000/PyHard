'use client';

// Styled subscription QR generator component for PyHard Vendor SDK

import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useWallet } from '../../hooks/useWallet';
import { createSubscriptionQR, formatInterval } from '../../utils/qrcode';
import { formatAmount } from '../../utils/formatting';
import { INTERVAL_PRESETS } from '../../constants';
import { SubscriptionQRGeneratorProps } from '../../types';

export function SubscriptionQRGenerator({ onQRGenerated, className = '' }: SubscriptionQRGeneratorProps) {
  const { address } = useWallet();
  const [amount, setAmount] = useState('');
  const [intervalType, setIntervalType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('monthly');
  const [customInterval, setCustomInterval] = useState('');
  const [qrData, setQrData] = useState<string | null>(null);

  const getIntervalSeconds = (): number => {
    switch (intervalType) {
      case 'daily': return INTERVAL_PRESETS.DAILY;
      case 'weekly': return INTERVAL_PRESETS.WEEKLY;
      case 'monthly': return INTERVAL_PRESETS.MONTHLY;
      case 'custom': return parseInt(customInterval) * 86400;
      default: return 0;
    }
  };

  const handleGenerateQR = () => {
    if (!address || !amount) return;

    let intervalSeconds: string;
    
    switch (intervalType) {
      case 'daily':
        intervalSeconds = INTERVAL_PRESETS.DAILY.toString();
        break;
      case 'weekly':
        intervalSeconds = INTERVAL_PRESETS.WEEKLY.toString();
        break;
      case 'monthly':
        intervalSeconds = INTERVAL_PRESETS.MONTHLY.toString();
        break;
      case 'custom':
        intervalSeconds = (parseInt(customInterval) * 86400).toString();
        break;
    }

    const qr = createSubscriptionQR(address, amount, intervalSeconds);
    setQrData(qr);
    
    if (onQRGenerated) {
      onQRGenerated(qr);
    }
  };

  const isValid = address && amount && (intervalType !== 'custom' || customInterval);

  return (
    <div className={`pyhard-subscription-qr-generator ${className}`}>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Create Subscription QR Code
        </h3>

        {!address ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Please connect your wallet first</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (PYUSD)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10.00"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Interval Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Billing Interval
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {(['daily', 'weekly', 'monthly'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setIntervalType(type)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      intervalType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
                <button
                  onClick={() => setIntervalType('custom')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    intervalType === 'custom'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Custom
                </button>
              </div>

              {intervalType === 'custom' && (
                <input
                  type="number"
                  value={customInterval}
                  onChange={(e) => setCustomInterval(e.target.value)}
                  placeholder="Days"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateQR}
              disabled={!isValid}
              className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                isValid
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Generate QR Code
            </button>

            {/* QR Code Display */}
            {qrData && (
              <div className="mt-6 text-center">
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Subscription QR Code
                </h4>
                <div className="inline-block p-4 bg-white rounded-lg border">
                  <QRCodeCanvas value={qrData} size={256} />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>Amount: {formatAmount(amount)}</p>
                  <p>Interval: {formatInterval(getIntervalSeconds())}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
