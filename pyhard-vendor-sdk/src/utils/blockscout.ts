// Blockscout API integration for PyHard Vendor SDK

import { Subscription, PaymentHistory } from '../types';
import { 
  BLOCKSCOUT_API_URL, 
  SMART_WALLET_FACTORY, 
  SUBSCRIPTION_CREATED_EVENT,
  SUBSCRIPTION_PAYMENT_EVENT 
} from '../constants';

/**
 * Fetch all subscriptions for a vendor address
 * Queries all smart wallets created by the factory and filters by vendor
 */
export async function fetchSubscriptions(vendorAddress: string): Promise<Subscription[]> {
  try {
    console.log(`🔍 Fetching subscriptions for vendor: ${vendorAddress}`);

    // Step 1: Get all SmartWallets created by the factory
    const walletCreatedEventSignature = "0x5b03bfed1c14a02bdeceb5fa582eb1a5765fc0bc64ca0e6af4c20afc9487f081"; // WalletCreated(address,address)
    const factoryLogsUrl = `${BLOCKSCOUT_API_URL}?module=logs&action=getLogs&fromBlock=0&toBlock=latest&topic0=${walletCreatedEventSignature}&address=${SMART_WALLET_FACTORY}`;
    
    const factoryResponse = await fetch(factoryLogsUrl);
    const factoryData = await factoryResponse.json();

    if (factoryData.status !== '1' || !factoryData.result) {
      console.log('❌ No factory logs found');
      return [];
    }

    // Extract smart wallet addresses from factory events
    const smartWalletAddresses: string[] = factoryData.result.map((log: any) => {
      const topic = log.topics[2];
      if (topic && topic.length === 66) {
        return '0x' + topic.slice(26);
      }
      return null;
    }).filter((addr: any) => addr !== null);

    console.log(`📊 Found ${smartWalletAddresses.length} smart wallets from factory`);

    const allSubscriptions: Subscription[] = [];

    for (const smartWalletAddress of smartWalletAddresses) {
      try {
        // Get subscription count for this smart wallet
        const subscriptionCountResponse = await fetch(`${BLOCKSCOUT_API_URL}?module=proxy&action=eth_call&to=${smartWalletAddress}&data=0x${'getSubscriptionCount()'.padStart(64, '0')}&tag=latest`);
        const subscriptionCountData = await subscriptionCountResponse.json();
        
        if (subscriptionCountData.result === '0x') {
          continue;
        }

        const subscriptionCount = parseInt(subscriptionCountData.result, 16);
        console.log(`📋 Smart wallet ${smartWalletAddress} has ${subscriptionCount} subscriptions`);

        // Check each subscription
        for (let i = 1; i <= subscriptionCount; i++) {
          try {
            // Get subscription data
            const subscriptionData = await fetch(`${BLOCKSCOUT_API_URL}?module=proxy&action=eth_call&to=${smartWalletAddress}&data=0x${'getSubscription(uint256)'.padStart(64, '0')}${i.toString(16).padStart(64, '0')}&tag=latest`);
            const subscriptionResult = await subscriptionData.json();
            
            if (subscriptionResult.result && subscriptionResult.result !== '0x') {
              // Parse the subscription data (vendor, amount, interval, lastPayment, active)
              const data = subscriptionResult.result.slice(2);
              const vendor = '0x' + data.slice(24, 64);
              const amount = parseInt(data.slice(64, 128), 16).toString();
              const interval = parseInt(data.slice(128, 192), 16).toString();
              const lastPayment = parseInt(data.slice(192, 256), 16).toString();
              const active = data.slice(256, 320) !== '0'.repeat(64);

              // Check if this subscription is for our vendor and is active
              if (vendor.toLowerCase() === vendorAddress.toLowerCase() && active) {
                console.log(`✅ Found active subscription ${i} for vendor ${vendorAddress}`);
                allSubscriptions.push({
                  subscriptionId: i,
                  smartWallet: smartWalletAddress,
                  vendor: vendor,
                  amountPerInterval: amount,
                  interval: interval,
                  lastPayment: lastPayment,
                  active: active
                });
              }
            }
          } catch (subError) {
            console.warn(`⚠️ Error reading subscription ${i} from ${smartWalletAddress}:`, subError);
          }
        }
      } catch (walletError) {
        console.warn(`⚠️ Error reading from smart wallet ${smartWalletAddress}:`, walletError);
      }
    }

    console.log(`🎉 Found ${allSubscriptions.length} total subscriptions for vendor ${vendorAddress}`);
    return allSubscriptions;

  } catch (error) {
    console.error('❌ Error fetching subscriptions:', error);
    return [];
  }
}

/**
 * Fetch payment history for a specific subscription
 */
export async function fetchPaymentHistory(
  smartWalletAddress: string, 
  subscriptionId: number
): Promise<PaymentHistory[]> {
  try {
    console.log(`📝 Fetching payment history for subscription ${subscriptionId} in smart wallet: ${smartWalletAddress}`);

    // Query Blockscout for SubscriptionPaymentExecuted events
    const eventUrl = `${BLOCKSCOUT_API_URL}?module=logs&action=getLogs&fromBlock=0&toBlock=latest&address=${smartWalletAddress}&topic0=${SUBSCRIPTION_PAYMENT_EVENT}&topic1=${'0x' + subscriptionId.toString(16).padStart(64, '0')}`;
    
    console.log('📡 Fetching payment history events:', eventUrl);
    
    const response = await fetch(eventUrl);
    const data = await response.json();

    if (data.status !== '1' || !data.result) {
      return [];
    }

    const payments = data.result.map((log: any) => {
      // Parse amount from data field (second uint256)
      const amountHex = '0x' + log.data.slice(66, 130);
      const amount = BigInt(amountHex).toString();
      
      return {
        transactionHash: log.transactionHash,
        amount: amount,
        timestamp: log.timeStamp,
        blockNumber: log.blockNumber
      };
    });

    console.log(`📊 Found ${payments.length} payment history entries`);
    return payments;

  } catch (error) {
    console.error('❌ Error fetching payment history:', error);
    return [];
  }
}

/**
 * Poll for new payment events
 */
export function pollForNewPayments(
  smartWalletAddress: string,
  subscriptionId: number,
  callback: (payment: PaymentHistory) => void,
  interval: number = 10000
): () => void {
  let lastPaymentHash: string | null = null;
  
  const poll = async () => {
    try {
      const payments = await fetchPaymentHistory(smartWalletAddress, subscriptionId);
      const latestPayment = payments[0]; // Most recent payment
      
      if (latestPayment && latestPayment.transactionHash !== lastPaymentHash) {
        lastPaymentHash = latestPayment.transactionHash;
        callback(latestPayment);
      }
    } catch (error) {
      console.error('❌ Error polling for payments:', error);
    }
  };

  // Start polling
  const intervalId = setInterval(poll, interval);
  
  // Return cleanup function
  return () => clearInterval(intervalId);
}
