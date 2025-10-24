// Contract addresses and constants for Arbitrum Sepolia
// PyHard Vendor SDK

export const SMART_WALLET_FACTORY = "0x884ff7a379192ef709e0d865d52adfa967e1ab94";
export const EOA_DELEGATION_ADDRESS = "0x0977081db8717cb860716edcd117ef1fbf108857";
export const PYUSD_ADDRESS = "0x637A1259C6afd7E3AdF63993cA7E58BB438aB1B1";

// Event signatures
// SubscriptionCreated(uint256 indexed subscriptionId, address indexed vendor, uint256 amount, uint256 interval)
export const SUBSCRIPTION_CREATED_EVENT = "0x83de2e0cd5a46803c4f417df02a619d3a3c8e22bf0b1ca63e6a5c6f33ce9f1c1";

// SubscriptionPaymentExecuted(uint256 indexed subscriptionId, uint256 amount)
export const SUBSCRIPTION_PAYMENT_EVENT = "0x8e47b87b2e0b0b6f1c9b8b5e9c9b8e5e7c8e1e4e3e2e1e0e9e8e7e6e5e4e3e2";

// SubscriptionCancelled(uint256 indexed subscriptionId)
export const SUBSCRIPTION_CANCELLED_EVENT = "0x9e47b87b2e0b0b6f1c9b8b5e9c9b8e5e7c8e1e4e3e2e1e0e9e8e7e6e5e4e3e2";

// Cloudflare Worker URL
export const PAYMASTER_WORKER_URL = "https://paymaster-cf-worker.dawid-pisarczyk.workers.dev";

// Blockscout API URL
export const BLOCKSCOUT_API_URL = "https://arbitrum-sepolia.blockscout.com/api";

// Arbitrum Sepolia chain config
export const ARBITRUM_SEPOLIA_CHAIN = {
  chainId: 421614,
  rpc: ["https://sepolia-rollup.arbitrum.io/rpc"],
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  shortName: "arb-sep",
  slug: "arbitrum-sepolia",
  testnet: true,
  chain: "arbitrum-sepolia",
  name: "Arbitrum Sepolia"
};

// Common intervals in seconds
export const INTERVAL_PRESETS = {
  DAILY: 86400,
  WEEKLY: 604800,
  MONTHLY: 2592000,
} as const;

// Default polling intervals
export const POLLING_INTERVALS = {
  SUBSCRIPTIONS: 30000, // 30 seconds
  PAYMENTS: 10000, // 10 seconds
} as const;
