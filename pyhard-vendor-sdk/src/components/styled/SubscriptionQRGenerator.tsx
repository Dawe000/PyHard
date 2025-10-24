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
      <div className="space-y-6">
        {!address ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-pyhard-blue/20 to-pyhard-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔗</span>
            </div>
            <p className="text-gray-400 mb-4">Please connect your wallet first</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Amount (PYUSD)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="10.00"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pyhard-blue focus:border-pyhard-blue transition-all duration-200"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                  PYUSD
                </div>
              </div>
            </div>

            {/* Interval Selection */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Billing Interval
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['daily', 'weekly', 'monthly'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setIntervalType(type)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      intervalType === type
                        ? 'bg-gradient-to-r from-pyhard-blue to-pyhard-accent text-white shadow-lg'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border border-white/20'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
                <button
                  onClick={() => setIntervalType('custom')}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    intervalType === 'custom'
                      ? 'bg-gradient-to-r from-pyhard-blue to-pyhard-accent text-white shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border border-white/20'
                  }`}
                >
                  Custom
                </button>
              </div>

              {intervalType === 'custom' && (
                <div className="mt-4">
                  <input
                    type="number"
                    value={customInterval}
                    onChange={(e) => setCustomInterval(e.target.value)}
                    placeholder="Enter days"
                    min="1"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pyhard-blue focus:border-pyhard-blue transition-all duration-200"
                  />
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateQR}
              disabled={!isValid}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                isValid
                  ? 'bg-gradient-to-r from-pyhard-blue to-pyhard-accent hover:from-pyhard-blue/90 hover:to-pyhard-accent/90 text-white shadow-lg hover:shadow-xl'
                  : 'bg-white/10 text-gray-500 cursor-not-allowed border border-white/20'
              }`}
            >
              Generate QR Code
            </button>

            {/* QR Code Display */}
            {qrData && (
              <div className="mt-8 text-center">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Subscription QR Code
                </h4>
                <div className="inline-block p-6 bg-white rounded-xl shadow-lg">
                  <QRCodeCanvas value={qrData} size={256} />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="text-sm text-gray-300">
                    <span className="font-medium">Amount:</span> {formatAmount(amount)}
                  </div>
                  <div className="text-sm text-gray-300">
                    <span className="font-medium">Interval:</span> {formatInterval(getIntervalSeconds())}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
