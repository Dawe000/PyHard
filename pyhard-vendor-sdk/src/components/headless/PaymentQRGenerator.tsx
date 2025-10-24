// Headless payment QR generator component for PyHard Vendor SDK

import React, { useState, useCallback } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { createPaymentQR } from '../../utils/qrcode';
import { PaymentQRGeneratorRenderProps } from '../../types';

interface PaymentQRGeneratorProps {
  children: (props: PaymentQRGeneratorRenderProps) => React.ReactNode;
}

export function PaymentQRGenerator({ children }: PaymentQRGeneratorProps) {
  const { address } = useWallet();
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [qrData, setQrData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateQR = useCallback(() => {
    if (!recipientAddress || !amount) return;

    setIsLoading(true);
    try {
      const qr = createPaymentQR(recipientAddress, amount);
      setQrData(qr);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsLoading(false);
    }
  }, [recipientAddress, amount]);

  const isValid = recipientAddress && amount;

  const renderProps: PaymentQRGeneratorRenderProps = {
    amount,
    setAmount,
    recipientAddress,
    setRecipientAddress,
    qrData,
    generateQR,
    isValid: !!isValid,
    isLoading
  };

  return <>{children(renderProps)}</>;
}
