'use client';

// Payment history hook for PyHard Vendor SDK

import { useState, useEffect, useCallback } from 'react';
import { fetchPaymentHistory } from '../utils/blockscout';
import { PaymentHistory, PaymentHistoryState } from '../types';

export function usePaymentHistory(smartWalletAddress: string, subscriptionId: number) {
  const [state, setState] = useState<PaymentHistoryState>({
    payments: [],
    loading: false,
    error: null
  });

  const fetchPayments = useCallback(async () => {
    if (!smartWalletAddress || !subscriptionId) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const payments = await fetchPaymentHistory(smartWalletAddress, subscriptionId);
      setState({
        payments,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('❌ Error fetching payment history:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch payment history'
      }));
    }
  }, [smartWalletAddress, subscriptionId]);

  // Auto-fetch on mount and when parameters change
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    ...state,
    refetch: fetchPayments
  };
}
