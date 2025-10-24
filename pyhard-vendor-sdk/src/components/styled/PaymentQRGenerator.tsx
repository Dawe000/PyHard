'use client';

// Styled payment QR generator component for PyHard Vendor SDK

import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useWallet } from '../../hooks/useWallet';
import { createPaymentQR } from '../../utils/qrcode';
import { formatAmount, formatAddress } from '../../utils/formatting';
import { PaymentQRGeneratorProps } from '../../types';

export function PaymentQRGenerator({ onQRGenerated, className = '' }: PaymentQRGeneratorProps) {
  const { address } = useWallet();
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [qrData, setQrData] = useState<string | null>(null);

  const handleGenerateQR = () => {
    if (!recipientAddress || !amount) return;

    const qr = createPaymentQR(recipientAddress, amount);
    setQrData(qr);
    
    if (onQRGenerated) {
      onQRGenerated(qr);
    }
  };

  const isValid = recipientAddress && amount;

  return (
    <div className={`pyhard-payment-qr-generator ${className}`}>
      <div className="space-y-6">
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

          {/* Recipient Address */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pyhard-blue focus:border-pyhard-blue transition-all duration-200 font-mono text-sm"
            />
            {address && (
              <button
                onClick={() => setRecipientAddress(address)}
                className="mt-2 text-sm text-pyhard-blue hover:text-pyhard-accent underline transition-colors duration-200"
              >
                Use my address ({formatAddress(address)})
              </button>
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
                Payment QR Code
              </h4>
              <div className="inline-block p-6 bg-white rounded-xl shadow-lg">
                <QRCodeCanvas value={qrData} size={256} />
              </div>
              <div className="mt-4 space-y-2">
                <div className="text-sm text-gray-300">
                  <span className="font-medium">Amount:</span> {formatAmount(amount)}
                </div>
                <div className="text-sm text-gray-300">
                  <span className="font-medium">Recipient:</span> {formatAddress(recipientAddress)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
