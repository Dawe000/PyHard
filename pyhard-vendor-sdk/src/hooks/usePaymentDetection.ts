'use client';

// Payment detection hook for PyHard Vendor SDK
// Polls Blockscout for new payment events

import { useState, useEffect, useCallback, useRef } from 'react';
import { pollForNewPayments } from '../utils/blockscout';
import { PaymentHistory, PaymentDetectionState } from '../types';
import { POLLING_INTERVALS } from '../constants';

export function usePaymentDetection(
  smartWalletAddress: string,
  subscriptionId: number,
  onNewPayment?: (payment: PaymentHistory) => void
) {
  const [state, setState] = useState<PaymentDetectionState>({
    latestPayment: null,
    isPolling: false,
    error: null
  });

  const pollingRef = useRef<(() => void) | null>(null);

  const startPolling = useCallback(() => {
    if (!smartWalletAddress || !subscriptionId) return;

    // Stop existing polling
    if (pollingRef.current) {
      pollingRef.current();
    }

    setState(prev => ({ ...prev, isPolling: true, error: null }));

    // Start new polling
    pollingRef.current = pollForNewPayments(
      smartWalletAddress,
      subscriptionId,
      (payment) => {
        setState(prev => ({
          ...prev,
          latestPayment: payment,
          error: null
        }));
        
        if (onNewPayment) {
          onNewPayment(payment);
        }
      },
      POLLING_INTERVALS.PAYMENTS
    );
  }, [smartWalletAddress, subscriptionId, onNewPayment]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      pollingRef.current();
      pollingRef.current = null;
    }
    setState(prev => ({ ...prev, isPolling: false }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        pollingRef.current();
      }
    };
  }, []);

  // Auto-start polling when parameters change
  useEffect(() => {
    if (smartWalletAddress && subscriptionId) {
      startPolling();
    } else {
      stopPolling();
    }
  }, [smartWalletAddress, subscriptionId, startPolling, stopPolling]);

  return {
    ...state,
    startPolling,
    stopPolling
  };
}
