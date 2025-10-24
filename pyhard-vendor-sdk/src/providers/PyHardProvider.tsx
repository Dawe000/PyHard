// PyHard Provider for SDK configuration and context

import React, { createContext, useContext, ReactNode } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { arbitrumSepolia } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppKitProvider } from '@reown/appkit/react';
import { defaultWagmiConfig } from '@reown/appkit/wagmi';
import { PyHardConfig } from '../types';
import { ARBITRUM_SEPOLIA_CHAIN } from '../constants';

interface PyHardContextType {
  config: PyHardConfig;
}

const PyHardContext = createContext<PyHardContextType | null>(null);

interface PyHardProviderProps {
  children: ReactNode;
  config?: PyHardConfig;
}

export function PyHardProvider({ children, config = {} }: PyHardProviderProps) {
  // Create Wagmi config with Reown AppKit
  const wagmiConfig = defaultWagmiConfig({
    chains: [arbitrumSepolia],
    projectId: 'your-project-id', // This should be provided by the vendor
    metadata: {
      name: 'PyHard Vendor SDK',
      description: 'PyHard subscription and payment management',
      url: 'https://pyhard.com',
      icons: ['https://pyhard.com/icon.png']
    },
    transports: {
      [arbitrumSepolia.id]: http(config.rpcUrl || 'https://sepolia-rollup.arbitrum.io/rpc')
    }
  });

  // Create React Query client
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false
      }
    }
  });

  const contextValue: PyHardContextType = {
    config
  };

  return (
    <PyHardContext.Provider value={contextValue}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <AppKitProvider>
            {children}
          </AppKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </PyHardContext.Provider>
  );
}

export function usePyHardConfig(): PyHardConfig {
  const context = useContext(PyHardContext);
  if (!context) {
    throw new Error('usePyHardConfig must be used within a PyHardProvider');
  }
  return context.config;
}
