// Main exports for PyHard Vendor SDK

// Styled Components
export * from './components/styled';

// Headless Components
export { 
  SubscriptionQRGenerator as HeadlessSubscriptionQRGenerator,
  PaymentQRGenerator as HeadlessPaymentQRGenerator,
  SubscriptionList as HeadlessSubscriptionList,
  PaymentHistory as HeadlessPaymentHistory
} from './components/headless';

// Hooks
export { useWallet } from './hooks/useWallet';
export { useSubscriptions } from './hooks/useSubscriptions';
export { usePaymentHistory } from './hooks/usePaymentHistory';
export { usePaymentDetection } from './hooks/usePaymentDetection';

// Utils
export { createSubscriptionQR, createPaymentQR } from './utils/qrcode';
export * from './utils/blockscout';
export { formatTimestamp, formatAmount, formatAddress } from './utils/formatting';

// Types
export type { 
  Subscription, 
  PaymentHistory, 
  QRCodeData, 
  SubscriptionRequestData, 
  PaymentRequestData, 
  PyHardConfig,
  WalletState,
  SubscriptionListRenderProps
} from './types';

// Constants
export * from './constants';

// Provider
export { PyHardProvider, usePyHardConfig } from './providers/PyHardProvider';
