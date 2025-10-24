// QR Code generation utilities for PyHard Vendor SDK
// Supports both subscription and payment QR codes

import { QRCodeData, SubscriptionRequestData, PaymentRequestData } from '../types';

/**
 * Create a subscription request QR code data structure
 * Matches the format expected by the mobile app
 */
export function createSubscriptionQR(
  vendorAddress: string,
  amount: string,
  interval: string
): string {
  const qrData: QRCodeData = {
    version: "1.0",
    type: "subscription_request",
    data: {
      vendorAddress,
      amount,
      interval,
      timestamp: Date.now(),
      requestId: crypto.randomUUID()
    } as SubscriptionRequestData
  };

  return JSON.stringify(qrData);
}

/**
 * Create a payment request QR code data structure
 * Matches the format expected by the mobile app
 */
export function createPaymentQR(
  recipientAddress: string,
  amount: string
): string {
  const qrData: QRCodeData = {
    version: "1.0",
    type: "payment_request",
    data: {
      recipientAddress,
      amount,
      timestamp: Date.now(),
      requestId: crypto.randomUUID()
    } as PaymentRequestData
  };

  return JSON.stringify(qrData);
}

/**
 * Format interval for display
 */
export function formatInterval(seconds: number): string {
  const days = seconds / 86400;
  
  if (seconds === 86400) return "Daily (24 hours)";
  if (seconds === 604800) return "Weekly (7 days)";
  if (seconds === 2592000) return "Monthly (30 days)";
  
  if (days < 1) {
    const hours = seconds / 3600;
    return `Every ${hours.toFixed(1)} hours`;
  }
  
  return `Every ${days.toFixed(1)} days`;
}

/**
 * Parse QR code data
 */
export function parseQRCode(qrData: string): QRCodeData | null {
  try {
    const parsed = JSON.parse(qrData);
    if (parsed.version && parsed.type && parsed.data) {
      return parsed as QRCodeData;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Validate QR code data
 */
export function validateQRCode(qrData: QRCodeData): boolean {
  if (!qrData.version || !qrData.type || !qrData.data) {
    return false;
  }

  if (qrData.type === "subscription_request") {
    const data = qrData.data as SubscriptionRequestData;
    return !!(data.vendorAddress && data.amount && data.interval);
  }

  if (qrData.type === "payment_request") {
    const data = qrData.data as PaymentRequestData;
    return !!(data.recipientAddress && data.amount);
  }

  return false;
}
