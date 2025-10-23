import { v4 as uuidv4 } from 'uuid';

export interface SubAccountRequestData {
  childEOA: string;
  childName: string;
  timestamp: number;
  requestId: string;
}

export interface QRCodeData {
  version: string;
  type: string;
  data: SubAccountRequestData;
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
