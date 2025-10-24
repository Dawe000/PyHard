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
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Create Payment QR Code
        </h3>

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

          {/* Recipient Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
            {address && (
              <button
                onClick={() => setRecipientAddress(address)}
                className="mt-1 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Use my address ({formatAddress(address)})
              </button>
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
                Payment QR Code
              </h4>
              <div className="inline-block p-4 bg-white rounded-lg border">
                <QRCodeCanvas value={qrData} size={256} />
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>Amount: {formatAmount(amount)}</p>
                <p>Recipient: {formatAddress(recipientAddress)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
