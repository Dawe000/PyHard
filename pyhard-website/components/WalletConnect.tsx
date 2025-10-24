'use client';

import React from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { createAppKit } from '@reown/appkit/react';
import { arbitrumSepolia } from '@reown/appkit/networks';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const connectWallet = () => {
    const modal = createAppKit({
      projectId: process.env.NEXT_PUBLIC_PROJECT_ID || "b56e18d47c72ab683b10814fe9495694",
      networks: [arbitrumSepolia],
      defaultNetwork: arbitrumSepolia,
      metadata: {
        name: 'PyHard Demo',
        description: 'PyHard subscription demo',
        url: 'https://pyhard.com',
        icons: ['https://pyhard.com/icon.png']
      }
    });
    modal.open();
  };

  if (!isConnected) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Connect Your Wallet
        </h2>
        <button
          onClick={connectWallet}
          className="w-full bg-pyhard-blue hover:bg-pyhard-blue/80 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">
        Wallet Connected
      </h2>
      <div className="space-y-3">
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-400">Connected</p>
              <p className="text-xs text-green-300 font-mono">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
            <button
              onClick={() => disconnect()}
              className="text-sm text-green-400 hover:text-green-300 underline"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
