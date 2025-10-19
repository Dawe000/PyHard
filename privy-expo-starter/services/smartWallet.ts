// SmartWallet Service
// Handles SmartWallet creation and balance fetching

const CF_WORKER_URL = "https://paymaster-cf-worker.dawid-pisarczyk.workers.dev";

export interface SmartWalletInfo {
  address: string;
  isNew: boolean;
  transactionHash?: string;
}

/**
 * Get or create a SmartWallet for the given EOA address
 * @param eoaAddress - The EOA address
 * @param privyAccessToken - The Privy access token for authentication
 * @returns SmartWallet information
 */
export async function getOrCreateSmartWallet(
  eoaAddress: string,
  privyAccessToken: string
): Promise<SmartWalletInfo> {
  try {
    console.log("📞 Calling CF Worker to get/create SmartWallet");
    console.log("📍 EOA Address:", eoaAddress);
    console.log("🔗 CF Worker URL:", `${CF_WORKER_URL}/create-smart-wallet`);
    console.log("🔐 Using token:", privyAccessToken.substring(0, 20) + "...");

    const requestBody = {
      eoaAddress,
      privyToken: privyAccessToken,
    };
    console.log("📤 Request body:", requestBody);

    const response = await fetch(`${CF_WORKER_URL}/create-smart-wallet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("📥 Response status:", response.status);
    console.log("📥 Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ CF Worker error response:", errorText);
      throw new Error(`CF Worker returned ${response.status}: ${response.statusText}\nResponse: ${errorText}`);
    }

    const data = await response.json();
    console.log("📥 Response data:", data);

    if (data.error) {
      console.error("❌ Error in response:", data.error);
      throw new Error(data.error);
    }

    console.log("✅ SmartWallet info received:", {
      address: data.smartWalletAddress,
      isNew: data.isNew,
      transactionHash: data.transactionHash,
    });

    return {
      address: data.smartWalletAddress,
      isNew: data.isNew,
      transactionHash: data.transactionHash,
    };
  } catch (error) {
    console.error("❌ Error getting/creating SmartWallet:", error);
    throw error;
  }
}

/**
 * Get PYUSD balance for a SmartWallet
 * @param smartWalletAddress - The SmartWallet address
 * @param provider - The wallet provider
 * @param pyusdContractAddress - The PYUSD contract address
 * @returns PYUSD balance as a string
 */
export async function getSmartWalletPYUSDBalance(
  smartWalletAddress: string,
  provider: any,
  pyusdContractAddress: string,
  decimals: number = 6
): Promise<string> {
  try {
    console.log("📊 Fetching PYUSD balance for SmartWallet:", smartWalletAddress);

    // Encode balanceOf(address) call
    const balanceOfCallData = `0x70a08231000000000000000000000000${smartWalletAddress.slice(2)}`;

    const balanceHex = await provider.request({
      method: "eth_call",
      params: [
        {
          to: pyusdContractAddress,
          data: balanceOfCallData,
        },
        "latest",
      ],
    });

    if (balanceHex && balanceHex !== "0x") {
      const balance = (parseInt(balanceHex, 16) / Math.pow(10, decimals)).toFixed(2);
      console.log("✅ SmartWallet PYUSD balance:", balance);
      return balance;
    }

    return "0.00";
  } catch (error) {
    console.error("❌ Error fetching SmartWallet balance:", error);
    throw error;
  }
}

/**
 * Check if a SmartWallet exists for the given EOA address
 * @param eoaAddress - The EOA address
 * @returns SmartWallet address or null if doesn't exist
 */
export async function checkSmartWalletExists(
  eoaAddress: string
): Promise<string | null> {
  try {
    // This would call the factory contract directly via RPC
    // For now, we'll rely on getOrCreateSmartWallet which handles this
    return null;
  } catch (error) {
    console.error("❌ Error checking SmartWallet existence:", error);
    return null;
  }
}

