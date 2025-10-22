import { v4 as uuidv4 } from 'uuid';

export interface PaymentRequestData {
  smartWalletAddress: string;
  amount: string; // in PYUSD units (6 decimals)
  timestamp: number;
  requestId: string;
}

export interface QRCodeData {
  version: string;
  type: string;
  data: PaymentRequestData;
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
    const parsed = JSON.parse(qrString);
    
    // Validate structure
    if (
      parsed.version &&
      parsed.type &&
      parsed.data &&
      parsed.data.smartWalletAddress &&
      parsed.data.amount &&
      parsed.data.timestamp &&
      parsed.data.requestId
    ) {
      return parsed as QRCodeData;
    }
    
    return null;
  } catch (error) {
    console.error('Error decoding QR data:', error);
    return null;
  }
}

/**
 * Validate if QR code is a payment request
 */
export function isPaymentRequest(qrData: QRCodeData): boolean {
  return qrData.type === "payment_request" && qrData.version === "1.0";
}

/**
 * Format amount for display (convert from PYUSD units to display units)
 */
export function formatAmount(amount: string): string {
  const numAmount = parseFloat(amount);
  // If amount is already in display format (less than 1000000), return as is
  if (numAmount < 1000000) {
    return numAmount.toFixed(2);
  }
  // Otherwise, convert from PYUSD units to display units
  return (numAmount / 1000000).toFixed(2); // PYUSD has 6 decimals
}

/**
 * Convert display amount to PYUSD units
 */
export function parseAmount(displayAmount: string): string {
  const numAmount = parseFloat(displayAmount);
  return Math.floor(numAmount * 1000000).toString(); // Convert to PYUSD units
}
