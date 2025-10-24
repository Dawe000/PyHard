// TypeScript interfaces for PyHard Vendor SDK

export interface Subscription {
  subscriptionId: number;
  smartWallet: string;
  vendor: string;
  amountPerInterval: string;
  interval: string;
  lastPayment: string;
  active: boolean;
}

export interface PaymentHistory {
  transactionHash: string;
  amount: string;
  timestamp: string;
  blockNumber: string;
}

export interface QRCodeData {
  version: string;
  type: string;
  data: SubscriptionRequestData | PaymentRequestData;
}

export interface SubscriptionRequestData {
  vendorAddress: string;
  amount: string; // PYUSD display units
  interval: string; // seconds
  timestamp: number;
  requestId: string;
}

export interface PaymentRequestData {
  recipientAddress: string;
  amount: string; // PYUSD display units
  timestamp: number;
  requestId: string;
}

export interface PyHardConfig {
  rpcUrl?: string;
  blockscoutUrl?: string;
  paymasterUrl?: string;
  chainId?: number;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isManual: boolean;
}

export interface SubscriptionState {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
}

export interface PaymentHistoryState {
  payments: PaymentHistory[];
  loading: boolean;
  error: string | null;
}

export interface PaymentDetectionState {
  latestPayment: PaymentHistory | null;
  isPolling: boolean;
  error: string | null;
}

// Component Props
export interface WalletConnectProps {
  onAddressChange?: (address: string | null) => void;
  className?: string;
}

export interface SubscriptionQRGeneratorProps {
  onQRGenerated?: (qrData: string) => void;
  className?: string;
}

export interface PaymentQRGeneratorProps {
  onQRGenerated?: (qrData: string) => void;
  className?: string;
}

export interface SubscriptionListProps {
  vendorAddress: string;
  onPaymentExecuted?: (subscriptionId: number, txHash: string) => void;
  className?: string;
}

export interface PaymentHistoryProps {
  smartWalletAddress: string;
  subscriptionId: number;
  className?: string;
}

// Headless Component Render Props
export interface SubscriptionQRGeneratorRenderProps {
  amount: string;
  setAmount: (amount: string) => void;
  interval: string;
  setInterval: (interval: string) => void;
  qrData: string | null;
  generateQR: () => void;
  isValid: boolean;
  isLoading: boolean;
}

export interface PaymentQRGeneratorRenderProps {
  amount: string;
  setAmount: (amount: string) => void;
  recipientAddress: string;
  setRecipientAddress: (address: string) => void;
  qrData: string | null;
  generateQR: () => void;
  isValid: boolean;
  isLoading: boolean;
}

export interface SubscriptionListRenderProps {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
  executePayment: (subscription: Subscription) => Promise<void>;
  isPaymentDue: (subscription: Subscription) => boolean;
  getTimeUntilNextPayment: (subscription: Subscription) => string;
  refetch: () => void;
}

export interface PaymentHistoryRenderProps {
  payments: PaymentHistory[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}
