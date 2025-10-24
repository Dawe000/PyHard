'use client';

// Wallet connection hook for PyHard Vendor SDK
// Supports both Reown AppKit connection and manual address input

import { useState, useCallback } from 'react';
import { useAccount, useWalletClient, useConnect } from 'wagmi';
import { WalletState } from '../types';

export function useWallet() {
  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { connect, connectors } = useConnect();
  
  const [manualAddress, setManualAddress] = useState<string>('');
  const [isManual, setIsManual] = useState(false);

  const address = isManual ? manualAddress : (wagmiAddress || null);
  const isConnected = isManual ? !!manualAddress : wagmiConnected;

  const setManualAddressValue = useCallback((newAddress: string) => {
    setManualAddress(newAddress);
    setIsManual(true);
  }, []);

  const connectWallet = useCallback(() => {
    setIsManual(false);
    // Try to connect with the first available connector (usually MetaMask)
    if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  }, [connect, connectors]);

  const disconnect = useCallback(() => {
    if (isManual) {
      setManualAddress('');
      setIsManual(false);
    } else {
      // Disconnection is handled by Reown AppKit
    }
  }, [isManual]);

  const toggleMode = useCallback(() => {
    setIsManual(!isManual);
    if (!isManual) {
      setManualAddress('');
    }
  }, [isManual]);

  // Validate manual address format
  const isValidAddress = useCallback((addr: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  }, []);

  const state: WalletState = {
    address,
    isConnected,
    isManual
  };

  return {
    ...state,
    walletClient,
    manualAddress,
    setManualAddress: setManualAddressValue,
    connectWallet,
    disconnect,
    toggleMode,
    isValidAddress: isValidAddress(address || ''),
    isWagmiConnected: wagmiConnected,
    isManualMode: isManual
  };
}
