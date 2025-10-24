'use client';

// Headless payment history component for PyHard Vendor SDK

import React from 'react';
import { usePaymentHistory } from '../../hooks/usePaymentHistory';
import { PaymentHistoryRenderProps } from '../../types';

interface PaymentHistoryProps {
  smartWalletAddress: string;
  subscriptionId: number;
  children: (props: PaymentHistoryRenderProps) => React.ReactNode;
}

export function PaymentHistory({ smartWalletAddress, subscriptionId, children }: PaymentHistoryProps) {
  const { payments, loading, error, refetch } = usePaymentHistory(smartWalletAddress, subscriptionId);

  const renderProps: PaymentHistoryRenderProps = {
    payments,
    loading,
    error,
    refetch
  };

  return <>{children(renderProps)}</>;
}
