'use client';

// PyHard Provider for SDK configuration and context

import React, { createContext, useContext, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, type Config } from 'wagmi';
import { cookieToInitialState, cookieStorage, createStorage } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { arbitrumSepolia } from '@reown/appkit/networks';
import { PyHardConfig } from '../types';

interface PyHardContextType {
  config: PyHardConfig;
}

const PyHardContext = createContext<PyHardContextType | null>(null);

interface PyHardProviderProps {
  children: ReactNode;
  config?: PyHardConfig;
  cookies?: string | null;
}

// Set up queryClient
const queryClient = new QueryClient();

// Get projectId from environment or use default
const projectId = "b56e18d47c72ab683b10814fe9495694";

if (!projectId) {
  throw new Error('Project ID is not defined');
}

// Set up metadata
const metadata = {
  name: 'PyHard Vendor SDK',
  description: 'PyHard subscription and payment management',
  url: 'https://pyhard.com',
  icons: ['https://pyhard.com/icon.png']
};

// Create the Wagmi adapter
const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks: [arbitrumSepolia]
});

export function PyHardProvider({ children, config = {}, cookies }: PyHardProviderProps) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies);

  const contextValue: PyHardContextType = {
    config
  };

  return (
    <PyHardContext.Provider value={contextValue}>
      <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
        <QueryClientProvider client={queryClient}>
          {children}
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
