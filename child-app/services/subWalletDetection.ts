import { createPublicClient, http, parseAbi } from 'viem';
import { arbitrumSepolia } from 'viem/chains';

const SMART_WALLET_FACTORY_ADDRESS = "0x884ff7a379192ef709e0d865d52adfa967e1ab94"; // Updated SmartWalletFactory address

interface SubWalletInfo {
  childEOA: string;
  spendingLimit: bigint;
  spentThisPeriod: bigint;
  periodStart: bigint;
  periodDuration: bigint;
  mode: number;
  active: boolean;
}

interface ParentWalletInfo {
  parentEOA: string;
  smartWalletAddress: string;
  subWalletId: number;
  subWalletInfo: SubWalletInfo;
}

/**
 * Poll the blockchain to detect if the child's EOA has been added as a sub-wallet
 * Uses Blockscout API to find all smart wallets and check their sub-wallets
 */
export async function detectSubWalletCreation(childEOA: string): Promise<ParentWalletInfo | null> {
  try {
    console.log(`🔍 Checking for sub-wallet creation for: ${childEOA.slice(0, 6)}...${childEOA.slice(-4)}`);

    // Create viem client for contract calls
    const publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http('https://sepolia-rollup.arbitrum.io/rpc')
    });

    // SmartWallet ABI
    const smartWalletAbi = parseAbi([
      'function getSubWalletCount() external view returns (uint256)',
      'function getSubWallet(uint256 subWalletId) external view returns (address childEOA, uint256 spendingLimit, uint256 spentThisPeriod, uint256 periodStart, uint256 periodDuration, uint8 mode, bool active)'
    ]);

    // First, get all smart wallets created by our factory
    console.log(`📊 Fetching smart wallets from factory...`);
    
    // Get WalletCreated events from the factory to find all smart wallets
    const walletCreatedEventSignature = '0x' + 'WalletCreated(address,address)'.padStart(64, '0');
    const factoryUrl = `https://arbitrum-sepolia.blockscout.com/api?module=logs&action=getLogs&fromBlock=0&toBlock=latest&topic0=${walletCreatedEventSignature}&address=${SMART_WALLET_FACTORY_ADDRESS}`;
    console.log(`🌐 Factory request: ${factoryUrl}`);
    
    let smartWallets: string[] = [];
    try {
      const factoryResponse = await fetch(factoryUrl);
      if (factoryResponse.ok) {
        const factoryData = await factoryResponse.json();
        if (factoryData.result && factoryData.result.length > 0) {
          smartWallets = factoryData.result.map((log: any) => '0x' + log.topics[2]?.slice(26));
          console.log(`📊 Found ${smartWallets.length} smart wallets from factory`);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching smart wallets:', error);
    }
    
    if (smartWallets.length === 0) {
      console.log('❌ No smart wallets found, cannot search for sub-wallets');
      return null;
    }
    
    // Now search for SubWalletCreated events from all smart wallets
    console.log(`📊 Searching for SubWalletCreated events in ${smartWallets.length} smart wallets...`);
    
    // Event: SubWalletCreated(uint256 indexed subWalletId, address indexed childEOA, uint256 limit, uint8 mode)
    const subWalletCreatedEventSignature = '0x' + 'SubWalletCreated(uint256,address,uint256,uint8)'.padStart(64, '0');
    
    // Search each smart wallet for SubWalletCreated events
    let allSubWalletEvents: any[] = [];
    for (const smartWalletAddress of smartWallets) {
      const apiUrl = `https://arbitrum-sepolia.blockscout.com/api?module=logs&action=getLogs&fromBlock=0&toBlock=latest&topic0=${subWalletCreatedEventSignature}&address=${smartWalletAddress}`;
      console.log(`🌐 Searching smart wallet ${smartWalletAddress}: ${apiUrl}`);
      
      try {
        const response = await fetch(apiUrl);
        if (response.ok) {
          const data = await response.json();
          if (data.result && data.result.length > 0) {
            console.log(`📊 Found ${data.result.length} SubWalletCreated events in ${smartWalletAddress}`);
            allSubWalletEvents = allSubWalletEvents.concat(data.result);
          }
        }
      } catch (error) {
        console.error(`❌ Error searching smart wallet ${smartWalletAddress}:`, error);
      }
    }
    
    console.log(`📊 Total SubWalletCreated events found: ${allSubWalletEvents.length}`);
    
    if (allSubWalletEvents.length === 0) {
      console.log('❌ No SubWalletCreated events found in any smart wallets');
      return null;
    }
    
    // Check if any of these events match our child EOA
    for (const log of allSubWalletEvents) {
      try {
        // Extract child EOA from topics (indexed parameter)
        // topics[1] = subWalletId, topics[2] = childEOA
        const childEOAFromLog = '0x' + log.topics[2]?.slice(26); // Remove 0x and padding
        
        if (childEOAFromLog.toLowerCase() === childEOA.toLowerCase()) {
          console.log(`🎉 Found sub-wallet creation for our child EOA!`);
          
          // Get the smart wallet address from the log
          const smartWalletAddress = log.address;
          const subWalletId = parseInt(log.topics[1]?.slice(2), 16); // topics[1] is subWalletId
          
          console.log(`📊 Smart wallet: ${smartWalletAddress}`);
          console.log(`📊 Sub-wallet ID: ${subWalletId}`);

          // We already know the smart wallet address, so we can use it directly
          // For now, we'll use the smart wallet address as the parent EOA
          const parentEOA = smartWalletAddress;

          // Get detailed sub-wallet information from the smart contract
          const subWalletData = await publicClient.readContract({
            address: smartWalletAddress as `0x${string}`,
            abi: smartWalletAbi,
            functionName: 'getSubWallet',
            args: [BigInt(subWalletId)]
          });

          const [childEOAFromContract, spendingLimit, spentThisPeriod, periodStart, periodDuration, mode, active] = subWalletData;

          console.log(`✅ Sub-wallet detected:`, {
            parentEOA,
            smartWalletAddress,
            subWalletId,
            childEOA: childEOAFromContract,
            spendingLimit: spendingLimit.toString(),
            periodStart: periodStart.toString(),
            active
          });

          return {
            parentEOA,
            smartWalletAddress,
            subWalletId,
            subWalletInfo: {
              childEOA: childEOAFromContract,
              spendingLimit,
              spentThisPeriod,
              periodStart,
              periodDuration,
              mode: Number(mode),
              active
            }
          };
        }
      } catch (logError) {
        console.error(`❌ Error processing log:`, logError);
      }
    }

    console.log('❌ No sub-wallet creation found for this child EOA');
    return null;

  } catch (error) {
    console.error('❌ Error detecting sub-wallet creation:', error);
    return null;
  }
}

/**
 * Poll for sub-wallet creation with a simple interval
 */
export function startSubWalletPolling(
  childEOA: string, 
  onDetected: (info: ParentWalletInfo) => void,
  onDeactivated?: () => void,
  intervalMs: number = 10000 // Poll every 10 seconds (less frequent since we're checking all wallets)
): () => void {
  console.log(`🔄 Starting sub-wallet polling for: ${childEOA.slice(0, 6)}...${childEOA.slice(-4)}`);
  
  const intervalId = setInterval(async () => {
    try {
      const result = await detectSubWalletCreation(childEOA);
      if (result) {
        if (result.subWalletInfo.active) {
          console.log('🎉 Sub-wallet detected! Stopping polling.');
          clearInterval(intervalId);
          onDetected(result);
        } else {
          console.log('⚠️ Sub-wallet is inactive! Logging out.');
          clearInterval(intervalId);
          onDeactivated?.();
        }
      }
    } catch (error) {
      console.error('❌ Error in polling:', error);
    }
  }, intervalMs);

  // Return cleanup function
  return () => {
    console.log('🛑 Stopping sub-wallet polling');
    clearInterval(intervalId);
  };
}