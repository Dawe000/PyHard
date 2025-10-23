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

    // For now, let's just query the known smart wallet that has subscriptions
    // TODO: Implement proper factory event parsing later
    const knownSmartWallets = [
      '0xb0fcc8b6dfc093e331a004dd7a5e3ae366ae4376' // The one we know has subscriptions
    ];

    const publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(RPC_URL)
    });

    const allSubscriptions: any[] = [];

    for (const smartWalletAddress of knownSmartWallets) {
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

        // Check each subscription
        for (let i = 1; i <= Number(subscriptionCount); i++) {
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

