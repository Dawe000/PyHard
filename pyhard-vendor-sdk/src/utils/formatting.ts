// Formatting utilities for PyHard Vendor SDK

/**
 * Format Unix timestamp to readable date string
 */
export function formatTimestamp(timestamp: string | number): string {
  const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) * 1000 : timestamp * 1000);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

/**
 * Format amount from wei to PYUSD display units
 */
export function formatAmount(amount: string | number): string {
  const amountInPYUSD = typeof amount === 'string' ? parseFloat(amount) / 1000000 : amount / 1000000;
  return `${amountInPYUSD.toFixed(2)} PYUSD`;
}

/**
 * Format address for display (truncate with ellipsis)
 */
export function formatAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (!address || address.length < startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Calculate next payment time
 */
export function calculateNextPayment(lastPayment: string, interval: string): string {
  const nextPaymentTimestamp = parseInt(lastPayment) + parseInt(interval);
  const date = new Date(nextPaymentTimestamp * 1000);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

/**
 * Get time until next payment is due
 */
export function getTimeUntilNextPayment(subscription: { lastPayment: string; interval: string }): string {
  const now = Math.floor(Date.now() / 1000);
  const lastPayment = parseInt(subscription.lastPayment);
  const interval = parseInt(subscription.interval);
  const nextPaymentTime = lastPayment + interval;
  
  if (now >= nextPaymentTime) {
    return "Due now";
  }
  
  const timeUntilNext = nextPaymentTime - now;
  const hoursUntilNext = Math.ceil(timeUntilNext / 3600);
  
  if (hoursUntilNext < 24) {
    return `Due in ${hoursUntilNext} hours`;
  } else {
    const daysUntilNext = Math.ceil(hoursUntilNext / 24);
    return `Due in ${daysUntilNext} days`;
  }
}

/**
 * Check if a payment is due for a subscription
 */
export function isPaymentDue(subscription: { lastPayment: string; interval: string }): boolean {
  const now = Math.floor(Date.now() / 1000);
  const lastPayment = parseInt(subscription.lastPayment);
  const interval = parseInt(subscription.interval);
  const nextPaymentTime = lastPayment + interval;
  
  return now >= nextPaymentTime;
}

/**
 * Format interval for display
 */
export function formatInterval(seconds: number): string {
  const days = seconds / 86400;
  
  if (seconds === 86400) return "Daily";
  if (seconds === 604800) return "Weekly";
  if (seconds === 2592000) return "Monthly";
  
  if (days < 1) {
    const hours = seconds / 3600;
    return `Every ${hours.toFixed(1)} hours`;
  }
  
  return `Every ${days.toFixed(1)} days`;
}

/**
 * Get transaction URL for Blockscout explorer
 */
export function getTransactionURL(txHash: string): string {
  return `https://arbitrum-sepolia.blockscout.com/tx/${txHash}`;
}

/**
 * Get address URL for Blockscout explorer
 */
export function getAddressURL(address: string): string {
  return `https://arbitrum-sepolia.blockscout.com/address/${address}`;
}
