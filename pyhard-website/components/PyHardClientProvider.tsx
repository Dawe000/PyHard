'use client';

import React from 'react';
import { PyHardProvider } from 'pyhard-vendor-sdk';

interface PyHardClientProviderProps {
  children: React.ReactNode;
}

export function PyHardClientProvider({ children }: PyHardClientProviderProps) {
  return (
    <PyHardProvider>
      {children}
    </PyHardProvider>
  );
}
