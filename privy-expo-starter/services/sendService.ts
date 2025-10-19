import { Alert } from "react-native";

const CF_WORKER_URL = "https://paymaster-cf-worker.dawid-pisarczyk.workers.dev";

// EIP-7702 EOADelegation contract address
const EOADelegation_ADDRESS = "0x0ef2789981b7a7a52e21320a21afcb4c31903883";
const PRIVY_APP_ID = "cmgtb4vg702vqld0da5wktriq"; // Real Privy App ID from app.json

interface SponsorRequest {
  eoaAddress: string;
  smartWalletAddress: string;
  functionData: string;
  value: string;
  nonce: string;
  deadline: string;
  signature: string;
  chainId: string;
  userJWT: string; // User JWT for authorization context
}

interface SponsorResponse {
  transactionHash: string;
  success: boolean;
  gasUsed?: string;
  error?: string;
}

interface SendPYUSDResponse {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

/**
 * Send PYUSD from SmartWallet to recipient using gas-sponsored transaction
 * @param eoaAddress - The EOA address
 * @param smartWalletAddress - The SmartWallet address
 * @param recipientAddress - The recipient address
 * @param amount - The amount to send (in PYUSD, e.g., "10.50")
 * @param userJWT - The user JWT for authorization context
 * @returns Send result
 */
export async function sendPYUSD(
  eoaAddress: string,
  smartWalletAddress: string,
  recipientAddress: string,
  amount: string,
  userJWT: string
): Promise<SendPYUSDResponse> {
  try {
    console.log("📞 ===== SEND SERVICE START =====");
    console.log("📞 Using existing sponsor endpoint for EIP-7702 transaction");
    console.log("📍 EOA Address:", eoaAddress);
    console.log("🏦 SmartWallet Address:", smartWalletAddress);
    console.log("👤 Recipient Address:", recipientAddress);
    console.log("💰 Amount:", amount);
    console.log("🔗 CF Worker URL:", `${CF_WORKER_URL}/sponsor-transaction`);

    // Validate inputs
    console.log("🔍 Validating inputs...");
    if (!eoaAddress || !smartWalletAddress || !recipientAddress || !amount) {
      throw new Error("Missing required parameters");
    }
    if (!eoaAddress.startsWith('0x') || eoaAddress.length !== 42) {
      throw new Error("Invalid EOA address format");
    }
    if (!smartWalletAddress.startsWith('0x') || smartWalletAddress.length !== 42) {
      throw new Error("Invalid SmartWallet address format");
    }
    if (!recipientAddress.startsWith('0x') || recipientAddress.length !== 42) {
      throw new Error("Invalid recipient address format");
    }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      throw new Error("Invalid amount");
    }
    console.log("✅ Input validation passed");

    // Encode PYUSD transfer function call
    console.log("🔧 Encoding PYUSD transfer function call...");
    const amountInWei = BigInt(Math.floor(amountNum * 1000000)); // PYUSD has 6 decimals
    
    // PYUSD transfer function signature: transfer(address to, uint256 amount)
    const transferData = `0xa9059cbb${recipientAddress.slice(2).padStart(64, '0')}${amountInWei.toString(16).padStart(64, '0')}`;
    console.log("📝 PYUSD transfer data:", transferData);

    // Log the user JWT for server-side EIP-7702 signing
    console.log("🔐 User JWT for server-side EIP-7702 signing");
    console.log("🔐 JWT length:", userJWT?.length);
    console.log("🔐 JWT preview:", userJWT?.substring(0, 50) + "...");

    // Create sponsor request for transaction execution
    const sponsorRequest: SponsorRequest = {
      eoaAddress,
      smartWalletAddress,
      functionData: transferData,
      value: "0",
      nonce: "0", // TODO: Get actual nonce
      deadline: (Math.floor(Date.now() / 1000) + 3600).toString(), // 1 hour from now
      signature: "0x", // Will be filled by the CF Worker
      chainId: "421614", // Arbitrum Sepolia
      userJWT: userJWT, // Include user JWT for authorization context
    };

    console.log("📤 Sponsor request:", JSON.stringify(sponsorRequest, null, 2));

    console.log("🌐 Making HTTP request to sponsor-transaction endpoint...");
    const response = await fetch(`${CF_WORKER_URL}/sponsor-transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sponsorRequest),
    });

    console.log("📥 Response status:", response.status);
    console.log("📥 Response status text:", response.statusText);
    console.log("📥 Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ CF Worker error response:", errorText);
      throw new Error(`CF Worker returned ${response.status}: ${response.statusText}\nResponse: ${errorText}`);
    }

    const data: SponsorResponse = await response.json();
    console.log("📥 Response data:", JSON.stringify(data, null, 2));

    if (data.error) {
      console.error("❌ Error in response:", data.error);
      throw new Error(data.error);
    }

    if (!data.success) {
      console.error("❌ Send was not successful:", data);
      throw new Error(data.error || "Send was not successful");
    }

    console.log("✅ PYUSD send successful:", {
      transactionHash: data.transactionHash,
    });
    console.log("📞 ===== SEND SERVICE END =====");

    return {
      success: true,
      transactionHash: data.transactionHash,
    };
  } catch (error) {
    console.error("❌ ===== SEND SERVICE ERROR =====");
    console.error("❌ Error sending PYUSD:", error);
    console.error("❌ Error type:", typeof error);
    console.error("❌ Error message:", error instanceof Error ? error.message : String(error));
    if (error instanceof Error) {
      console.error("❌ Error stack:", error.stack);
    }
    console.error("❌ ===== SEND SERVICE ERROR END =====");
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get the current PYUSD balance of a SmartWallet
 * @param smartWalletAddress - The SmartWallet address
 * @param provider - The wallet provider
 * @returns PYUSD balance as string
 */
export async function getPYUSDBalance(
  smartWalletAddress: string,
  provider: any
): Promise<string> {
  try {
    if (!smartWalletAddress || smartWalletAddress === "0x0000000000000000000000000000000000000000") {
      return "0.00";
    }

    // PYUSD contract address on Arbitrum Sepolia
    const PYUSD_CONTRACT_ADDRESS = "0x637A1259C6afd7E3AdF63993cA7E58BB438aB1B1";
    const PYUSD_DECIMALS = 6;

    // PYUSD balanceOf function signature
    const pyusdCallData = `0x70a08231000000000000000000000000${smartWalletAddress.slice(2)}`;

    const pyusdBalanceHex = await provider.request({
      method: "eth_call",
      params: [
        {
          to: PYUSD_CONTRACT_ADDRESS,
          data: pyusdCallData,
        },
        "latest",
      ],
    });

    if (pyusdBalanceHex && pyusdBalanceHex !== "0x") {
      const pyusdBalance = (parseInt(pyusdBalanceHex, 16) / Math.pow(10, PYUSD_DECIMALS)).toFixed(2);
      return pyusdBalance;
    } else {
      return "0.00";
    }
  } catch (error: any) {
    console.error("Error fetching PYUSD balance:", error);
    Alert.alert("Error", `Failed to fetch balance: ${error.message}`);
    return "0.00";
  }
}
