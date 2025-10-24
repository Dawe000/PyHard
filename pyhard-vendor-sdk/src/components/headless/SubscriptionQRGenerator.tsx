// Headless subscription QR generator component for PyHard Vendor SDK

import React, { useState, useCallback } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { createSubscriptionQR } from '../../utils/qrcode';
import { INTERVAL_PRESETS } from '../../constants';
import { SubscriptionQRGeneratorRenderProps } from '../../types';

interface SubscriptionQRGeneratorProps {
  children: (props: SubscriptionQRGeneratorRenderProps) => React.ReactNode;
}

export function SubscriptionQRGenerator({ children }: SubscriptionQRGeneratorProps) {
  const { address } = useWallet();
  const [amount, setAmount] = useState('');
  const [interval, setInterval] = useState(INTERVAL_PRESETS.MONTHLY.toString());
  const [qrData, setQrData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateQR = useCallback(() => {
    if (!address || !amount) return;

    setIsLoading(true);
    try {
      const qr = createSubscriptionQR(address, amount, interval);
      setQrData(qr);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsLoading(false);
    }
  }, [address, amount, interval]);

  const isValid = address && amount && interval;

  const renderProps: SubscriptionQRGeneratorRenderProps = {
    amount,
    setAmount,
    interval,
    setInterval,
    qrData,
    generateQR,
    isValid: !!isValid,
    isLoading
  };

  return <>{children(renderProps)}</>;
}
