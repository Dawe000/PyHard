// Styled wallet connection component for PyHard Vendor SDK

import React from 'react';
import { useWallet } from '../../hooks/useWallet';
import { WalletConnectProps } from '../../types';

export function WalletConnect({ onAddressChange, className = '' }: WalletConnectProps) {
  const {
    address,
    isConnected,
    isManual,
    manualAddress,
    setManualAddress,
    connectWallet,
    disconnect,
    toggleMode,
    isValidAddress,
    isWagmiConnected,
    isManualMode
  } = useWallet();

  // Notify parent of address changes
  React.useEffect(() => {
    if (onAddressChange) {
      onAddressChange(address);
    }
  }, [address, onAddressChange]);

  return (
    <div className={`pyhard-wallet-connect ${className}`}>
      {!isConnected ? (
        <div className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex space-x-2">
            <button
              onClick={() => toggleMode()}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                !isManualMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Connect Wallet
            </button>
            <button
              onClick={() => toggleMode()}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isManualMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Manual Address
            </button>
          </div>

          {/* Wallet Connection */}
          {!isManualMode && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Connect your wallet to start managing subscriptions
              </p>
              <button
                onClick={connectWallet}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Connect Wallet
              </button>
            </div>
          )}

          {/* Manual Address Input */}
          {isManualMode && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Vendor Address
              </label>
              <input
                type="text"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder="0x..."
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  manualAddress && !isValidAddress
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {manualAddress && !isValidAddress && (
                <p className="text-sm text-red-600">
                  Please enter a valid Ethereum address
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Connected State */}
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">
                  {isManual ? 'Manual Address' : 'Wallet Connected'}
                </p>
                <p className="text-xs text-green-600 font-mono">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
              <button
                onClick={disconnect}
                className="text-sm text-green-600 hover:text-green-800 underline"
              >
                Disconnect
              </button>
            </div>
          </div>

          {/* Mode Toggle for Connected State */}
          <div className="flex space-x-2">
            <button
              onClick={() => toggleMode()}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                !isManualMode
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Wallet
            </button>
            <button
              onClick={() => toggleMode()}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                isManualMode
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Manual
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
