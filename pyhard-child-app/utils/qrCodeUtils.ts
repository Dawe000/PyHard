import { v4 as uuidv4 } from 'uuid';

export interface PaymentRequestData {
  smartWalletAddress: string;
  amount: string; // in PYUSD units (6 decimals)
  timestamp: number;
  requestId: string;
}

export interface SubAccountRequestData {
  childEOA: string;
  childName: string;
  timestamp: number;
  requestId: string;
}

export interface QRCodeData {
  version: string;
  type: string;
  data: PaymentRequestData | SubAccountRequestData;
}

/**
 * Create a payment request QR code data structure
 */
export function createPaymentRequestQR(
  smartWalletAddress: string,
  amount: string
): QRCodeData {
  return {
    version: "1.0",
    type: "payment_request",
    data: {
      smartWalletAddress,
      amount,
      timestamp: Date.now(),
      requestId: uuidv4()
    }
  };
}

/**
 * Create a sub-account request QR code data structure
 */
export function createSubAccountRequestQR(
  childEOA: string,
  childName: string
): QRCodeData {
  return {
    version: "1.0",
    type: "subaccount_request",
    data: {
      childEOA,
      childName,
      timestamp: Date.now(),
      requestId: uuidv4()
    }
  };
}

/**
 * Encode QR code data to JSON string
 */
export function encodeQRData(qrData: QRCodeData): string {
  return JSON.stringify(qrData);
}

/**
 * Decode QR code string to QRCodeData
 */
export function decodeQRData(qrString: string): QRCodeData | null {
  try {
    const data = JSON.parse(qrString);
    if (data.version && data.type && data.data) {
      return data as QRCodeData;
    }
    return null;
  } catch (error) {
    console.error('Error decoding QR data:', error);
    return null;
  }
}

/**
 * Parse amount string to number
 */
export function parseAmount(amount: string): number {
  return parseFloat(amount);
}

/**
 * Format amount for display
 */
export function formatAmount(amount: string | number, decimals: number = 2): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toFixed(decimals);
}

/**
 * Check if QR data is a payment request
 */
export function isPaymentRequest(qrData: QRCodeData): boolean {
  return qrData.type === 'payment_request';
}

/**
 * Check if QR data is a sub-account request
 */
export function isSubAccountRequest(qrData: QRCodeData): boolean {
  return qrData.type === 'subaccount_request';
}
