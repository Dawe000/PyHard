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
    const parsed = JSON.parse(qrString);
    
    // Validate structure
    if (
      parsed.version &&
      parsed.type &&
      parsed.data &&
      parsed.data.timestamp &&
      parsed.data.requestId
    ) {
      // Check if it's a payment request
      if (parsed.type === "payment_request" && 
          parsed.data.smartWalletAddress && 
          parsed.data.amount) {
        return parsed as QRCodeData;
      }
      
      // Check if it's a sub-account request
      if (parsed.type === "subaccount_request" && 
          parsed.data.childEOA && 
          parsed.data.childName) {
        return parsed as QRCodeData;
      }
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
 * Validate if QR code is a sub-account request
 */
export function isSubAccountRequest(qrData: QRCodeData): boolean {
  return qrData.type === "subaccount_request" && qrData.version === "1.0";
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
