'use client';

// Headless subscription list component for PyHard Vendor SDK

import React from 'react';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { SubscriptionListRenderProps } from '../../types';

interface SubscriptionListProps {
  vendorAddress: string;
  children: (props: SubscriptionListRenderProps) => React.ReactNode;
}

export function SubscriptionList({ vendorAddress, children }: SubscriptionListProps) {
  const {
    subscriptions,
    loading,
    error,
    executePayment,
    isPaymentDue,
    getTimeUntilNextPayment,
    refetch
  } = useSubscriptions(vendorAddress);

  const renderProps: SubscriptionListRenderProps = {
    subscriptions,
    loading,
    error,
    executePayment,
    isPaymentDue,
    getTimeUntilNextPayment,
    refetch
  };

  return <>{children(renderProps)}</>;
}
