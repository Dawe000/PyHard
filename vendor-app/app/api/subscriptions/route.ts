import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { SMART_WALLET_FACTORY } from '@/lib/constants';
import { keccak256, toHex } from 'viem';

const BLOCKSCOUT_API = "https://arbitrum-sepolia.blockscout.com/api";
const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vendor = searchParams.get('vendor');

  if (!vendor) {
    return NextResponse.json({ error: 'Vendor address required' }, { status: 400 });
  }

  try {
    console.log(`🔍 Finding subscriptions for vendor: ${vendor}`);

    // Step 1: Get all SmartWallets created by the factory
    const walletCreatedEventSignature = keccak256(toHex('WalletCreated(address,address)'));
    const factoryLogsUrl = `${BLOCKSCOUT_API}?module=logs&action=getLogs&fromBlock=0&toBlock=latest&topic0=${walletCreatedEventSignature}&address=${SMART_WALLET_FACTORY}`;
    
    console.log('📡 Fetching factory logs:', factoryLogsUrl);
    
    const factoryResponse = await fetch(factoryLogsUrl);
    const factoryData = await factoryResponse.json();

    if (factoryData.status !== '1' || !factoryData.result) {
      console.log('❌ No factory logs found');
      return NextResponse.json({ subscriptions: [] });
    }

    // Extract smart wallet addresses from factory events
    const smartWalletAddresses: string[] = factoryData.result.map((log: any) => {
      // SmartWallet address is in topics[2] (third topic)
      // Format: 0x000000000000000000000000{address}
      const topic = log.topics[2];
      if (topic && topic.length === 66) { // 0x + 64 chars
        return '0x' + topic.slice(26); // Remove padding, keep last 40 chars
      }
      return null;
    }).filter(addr => addr !== null);

    console.log(`📊 Found ${smartWalletAddresses.length} smart wallets from factory`);

    const publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(RPC_URL)
    });

    const allSubscriptions: any[] = [];

    for (const smartWalletAddress of smartWalletAddresses) {
      try {
        console.log(`📋 Checking smart wallet: ${smartWalletAddress}`);
        
        // Get subscription count for this smart wallet
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
              requestedVendor: vendor,
              vendorMatch: subscription[0].toLowerCase() === vendor.toLowerCase(),
              active: subscription[4],
              amount: subscription[1].toString(),
              interval: subscription[2].toString(),
              lastPayment: subscription[3].toString()
            });

            // Check if this subscription is for our vendor and is active
            if (subscription[0].toLowerCase() === vendor.toLowerCase() && subscription[4]) {
              console.log(`✅ Found active subscription ${i} for vendor ${vendor}`);
              allSubscriptions.push({
                subscriptionId: i,
                smartWallet: smartWalletAddress,
                vendor: subscription[0],
                amountPerInterval: subscription[1].toString(),
                interval: subscription[2].toString(),
                lastPayment: subscription[3].toString(),
                active: subscription[4]
              });
            } else if (subscription[0].toLowerCase() === vendor.toLowerCase() && !subscription[4]) {
              console.log(`⚠️ Found INACTIVE subscription ${i} for vendor ${vendor} - this might be the issue!`);
            }
          } catch (subError) {
            console.warn(`⚠️ Error reading subscription ${i} from ${smartWalletAddress}:`, subError);
            // Continue with other subscriptions
          }
        }
      } catch (walletError) {
        console.warn(`⚠️ Error reading from smart wallet ${smartWalletAddress}:`, walletError);
        // Continue with other smart wallets
      }
    }

    console.log(`🎉 Found ${allSubscriptions.length} total subscriptions for vendor ${vendor}`);
    return NextResponse.json({ subscriptions: allSubscriptions });

  } catch (error) {
    console.error('❌ Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions', subscriptions: [] },
      { status: 500 }
    );
  }
}

