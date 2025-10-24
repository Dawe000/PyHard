// Blockscout API integration for PyHard Vendor SDK

import { Subscription, PaymentHistory } from '../types';
import { 
  BLOCKSCOUT_API_URL, 
  SMART_WALLET_FACTORY, 
  SUBSCRIPTION_CREATED_EVENT,
  SUBSCRIPTION_PAYMENT_EVENT 
} from '../constants';
import { createPublicClient, http } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { keccak256, toHex } from 'viem';

/**
 * Fetch all subscriptions for a vendor address
 * Uses the same approach as the vendor app - RPC calls instead of Blockscout API
 */
export async function fetchSubscriptions(vendorAddress: string): Promise<Subscription[]> {
  try {
    console.log(`🔍 Fetching subscriptions for vendor: ${vendorAddress}`);

    // Create public client for RPC calls
    const publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http('https://sepolia-rollup.arbitrum.io/rpc')
    });

    // Step 1: Get all SmartWallets created by the factory
    const walletCreatedEventSignature = keccak256(toHex('WalletCreated(address,address)'));
    const factoryLogsUrl = `${BLOCKSCOUT_API_URL}?module=logs&action=getLogs&fromBlock=0&toBlock=latest&topic0=${walletCreatedEventSignature}&address=${SMART_WALLET_FACTORY}`;
    
    console.log('📡 Fetching factory logs:', factoryLogsUrl);
    
    const factoryResponse = await fetch(factoryLogsUrl);
    const factoryData = await factoryResponse.json();

    if (factoryData.status !== '1' || !factoryData.result) {
      console.log('❌ No factory logs found');
      return [];
    }

    // Extract smart wallet addresses from factory events
    const smartWalletAddresses: string[] = factoryData.result.map((log: any) => {
      // SmartWallet address is in topics[2] (third topic)
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
        console.log(`📋 Checking smart wallet: ${smartWalletAddress}`);
        
        // Get subscription count for this smart wallet using RPC
        const subscriptionCount = await publicClient.readContract({
          address: smartWalletAddress as `0x${string}`,
          abi: [{
            type: 'function',
            name: 'getSubscriptionCount',
            inputs: [],
            outputs: [{ type: 'uint256' }],
            stateMutability: 'view'
          }],
          functionName: 'getSubscriptionCount'
        }) as bigint;

        console.log(`📋 Smart wallet has ${subscriptionCount} subscriptions`);

        // Check each subscription - also check a few more IDs in case there are gaps
        const maxCheck = Math.max(Number(subscriptionCount), 5);
        console.log(`📋 Checking subscriptions 1 to ${maxCheck} (count was ${subscriptionCount})`);
        
        for (let i = 1; i <= maxCheck; i++) {
          try {
            const subscription = await publicClient.readContract({
              address: smartWalletAddress as `0x${string}`,
              abi: [{
                type: 'function',
                name: 'getSubscription',
                inputs: [{ type: 'uint256', name: 'subscriptionId' }],
                outputs: [
                  { type: 'address', name: 'vendor' },
                  { type: 'uint256', name: 'amountPerInterval' },
                  { type: 'uint256', name: 'interval' },
                  { type: 'uint256', name: 'lastPayment' },
                  { type: 'bool', name: 'active' }
                ],
                stateMutability: 'view'
              }],
              functionName: 'getSubscription',
              args: [BigInt(i)]
            }) as [string, bigint, bigint, bigint, boolean];

            // Debug: Log subscription details
            console.log(`📊 Subscription ${i} from smart contract:`, {
              vendor: subscription[0],
              requestedVendor: vendorAddress,
              vendorMatch: subscription[0].toLowerCase() === vendorAddress.toLowerCase(),
              active: subscription[4],
              amount: subscription[1].toString(),
              interval: subscription[2].toString(),
              lastPayment: subscription[3].toString()
            });

            // Check if this subscription is for our vendor and is active
            if (subscription[0].toLowerCase() === vendorAddress.toLowerCase() && subscription[4]) {
              console.log(`✅ Found active subscription ${i} for vendor ${vendorAddress}`);
              allSubscriptions.push({
                subscriptionId: i,
                smartWallet: smartWalletAddress,
                vendor: subscription[0],
                amountPerInterval: subscription[1].toString(),
                interval: subscription[2].toString(),
                lastPayment: subscription[3].toString(),
                active: subscription[4]
              });
            } else if (subscription[0].toLowerCase() === vendorAddress.toLowerCase() && !subscription[4]) {
              console.log(`⚠️ Found INACTIVE subscription ${i} for vendor ${vendorAddress} - this might be the issue!`);
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
