// QR Code generation utilities for subscription requests
// Matches mobile app format

export interface SubscriptionRequestData {
  vendorAddress: string;
  amount: string; // PYUSD display units
  interval: string; // seconds
  timestamp: number;
  requestId: string;
}

export interface QRCodeData {
  version: string;
  type: string;
  data: SubscriptionRequestData;
}

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
    }
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

