import React, { useState, useCallback, useEffect } from "react";
import { 
  Text, 
  TextInput, 
  View, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  Alert,
  Dimensions 
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

import {
  usePrivy,
  useEmbeddedEthereumWallet,
  getUserEmbeddedEthereumWallet,
  PrivyEmbeddedWalletProvider,
} from "@privy-io/expo";

const { width } = Dimensions.get('window');

// Base Sepolia network details
const BASE_SEPOLIA_CHAIN_ID = "84532";
const BASE_SEPOLIA_RPC_URL = "https://sepolia.base.org";
const USDC_CONTRACT_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Correct Base Sepolia USDC
const USDC_DECIMALS = 6;

export const UserScreen = () => {
  const [destinationAddress, setDestinationAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [ethBalance, setEthBalance] = useState("0");
  const [usdcBalance, setUsdcBalance] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [isRefreshingBalances, setIsRefreshingBalances] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const { logout, user } = usePrivy();
  const { wallets, create } = useEmbeddedEthereumWallet();
  const account = getUserEmbeddedEthereumWallet(user);

  const fetchBalances = useCallback(async (isManualRefresh = false) => {
    if (!account?.address) {
      console.log("❌ No wallet address available for balance fetching");
      setEthBalance("No Wallet");
      setUsdcBalance("No Wallet");
      return;
    }

    if (!wallets[0]) {
      console.log("❌ No wallet provider available for balance fetching");
      setEthBalance("No Provider");
      setUsdcBalance("No Provider");
      return;
    }

    if (isManualRefresh) {
      setIsRefreshingBalances(true);
      console.log("🔄 Manual balance refresh triggered for address:", account.address);
    } else {
      console.log("🔄 Starting balance fetch for address:", account.address);
    }
    
    try {
      const provider = await wallets[0].getProvider();
      console.log("✅ Wallet provider obtained successfully");
      
      // Check current network
      console.log("🔄 Checking current network...");
      const networkId = await provider.request({
        method: "net_version",
        params: [],
      });
      console.log("📊 Current network ID:", networkId);
      console.log("📊 Expected Base Sepolia network ID:", BASE_SEPOLIA_CHAIN_ID);
      
      if (networkId !== BASE_SEPOLIA_CHAIN_ID) {
        console.log("⚠️ WARNING: Wallet is not on Base Sepolia network!");
        console.log("⚠️ Current network:", networkId, "Expected:", BASE_SEPOLIA_CHAIN_ID);
        console.log("🔄 Attempting to fetch balances directly from Base Sepolia RPC...");
        
        // Try fetching balances directly from Base Sepolia RPC using fetch
        try {
          console.log("🔄 Fetching ETH balance directly from Base Sepolia...");
          
          // Fetch ETH balance directly from Base Sepolia RPC
          const ethResponse = await fetch(BASE_SEPOLIA_RPC_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_getBalance',
              params: [account.address, 'latest'],
              id: 1,
            }),
          });
          
          const ethData = await ethResponse.json();
          console.log("📊 Direct ETH balance response:", ethData);
          
          if (ethData.result && ethData.result !== "0x") {
            const directEthBalanceFormatted = (parseInt(ethData.result, 16) / Math.pow(10, 18)).toFixed(6);
            console.log("📊 Direct ETH balance from Base Sepolia:", directEthBalanceFormatted);
            setEthBalance(directEthBalanceFormatted);
          } else {
            console.log("⚠️ Direct ETH balance is empty or zero");
            setEthBalance("0.000000");
          }
          
          console.log("🔄 Fetching USDC balance directly from Base Sepolia...");
          console.log("📊 Using USDC contract address:", USDC_CONTRACT_ADDRESS);
          
          // Fetch USDC balance directly from Base Sepolia RPC
          const usdcResponse = await fetch(BASE_SEPOLIA_RPC_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [
                {
                  to: USDC_CONTRACT_ADDRESS,
                  data: `0x70a08231000000000000000000000000${account.address.slice(2)}`,
                },
                'latest',
              ],
              id: 2,
            }),
          });
          
          const usdcData = await usdcResponse.json();
          console.log("📊 Direct USDC balance response:", usdcData);
          
          if (usdcData.result && usdcData.result !== "0x") {
            const directUsdcBalanceFormatted = (parseInt(usdcData.result, 16) / Math.pow(10, USDC_DECIMALS)).toFixed(6);
            console.log("📊 Direct USDC balance from Base Sepolia:", directUsdcBalanceFormatted);
            setUsdcBalance(directUsdcBalanceFormatted);
          } else {
            console.log("⚠️ Direct USDC balance is empty or zero");
            setUsdcBalance("0.000000");
          }
          
          console.log("✅ Successfully fetched balances directly from Base Sepolia RPC");
          
          if (isManualRefresh) {
            Alert.alert("Success", "Balances fetched from Base Sepolia (direct RPC)!");
          } else {
            Alert.alert(
              "Network Notice", 
              `Your wallet is on network ${networkId}, but I fetched your Base Sepolia balances directly. Use "Switch to Base Sepolia" to connect your wallet to the correct network.`
            );
          }
          
          return; // Exit early since we got the balances directly
        } catch (directError: any) {
          console.error("❌ Direct RPC fetch failed:", directError);
          console.log("🔄 Falling back to wallet provider...");
        }
        
        Alert.alert(
          "Wrong Network", 
          `Your wallet is on network ${networkId}, but Base Sepolia is ${BASE_SEPOLIA_CHAIN_ID}. Please switch networks using the "Switch to Base Sepolia" button.`
        );
      }
      
      // Fetch ETH balance
      console.log("🔄 Fetching ETH balance...");
      const ethBalanceWei = await provider.request({
        method: "eth_getBalance",
        params: [account.address, "latest"],
      });
      console.log("📊 ETH balance (wei):", ethBalanceWei);
      
      if (!ethBalanceWei || ethBalanceWei === "0x") {
        console.log("⚠️ ETH balance is empty or zero");
        setEthBalance("0.000000");
      } else {
        const ethBalance = (parseInt(ethBalanceWei, 16) / Math.pow(10, 18)).toFixed(6);
        console.log("✅ ETH balance:", ethBalance);
        setEthBalance(ethBalance);
      }
      
      // Fetch USDC balance
      console.log("🔄 Fetching USDC balance from contract:", USDC_CONTRACT_ADDRESS);
      const usdcCallData = `0x70a08231000000000000000000000000${account.address.slice(2)}`;
      console.log("📊 USDC call data:", usdcCallData);
      
      const usdcBalanceHex = await provider.request({
        method: "eth_call",
        params: [
          {
            to: USDC_CONTRACT_ADDRESS,
            data: usdcCallData,
          },
          "latest",
        ],
      });
      console.log("📊 USDC balance (hex):", usdcBalanceHex);
      
      if (!usdcBalanceHex || usdcBalanceHex === "0x") {
        console.log("⚠️ USDC balance is empty or zero");
        setUsdcBalance("0.000000");
      } else {
        const usdcBalance = (parseInt(usdcBalanceHex, 16) / Math.pow(10, USDC_DECIMALS)).toFixed(6);
        console.log("✅ USDC balance:", usdcBalance);
        setUsdcBalance(usdcBalance);
      }
      
      if (isManualRefresh) {
        console.log("✅ Manual balance refresh completed successfully");
        Alert.alert("Success", "Balances refreshed successfully!");
      } else {
        console.log("✅ Balance fetch completed successfully");
      }
    } catch (error: any) {
      console.error("❌ CRITICAL ERROR in balance fetching:", error);
      console.error("❌ Error message:", error.message);
      console.error("❌ Error code:", error.code);
      console.error("❌ Error stack:", error.stack);
      
      setEthBalance(`Error: ${error.message || "Unknown"}`);
      setUsdcBalance(`Error: ${error.message || "Unknown"}`);
      
      // Show user-facing error
      Alert.alert(
        "Balance Fetch Error", 
        `Failed to fetch balances: ${error.message || "Unknown error"}\n\nCheck console for details.`
      );
    } finally {
      if (isManualRefresh) {
        setIsRefreshingBalances(false);
      }
    }
  }, [account?.address, wallets]);

  // Auto-create wallet if user doesn't have one
  useEffect(() => {
    const createWalletIfNeeded = async () => {
      if (!user) {
        console.log("❌ No user logged in, skipping wallet creation");
        return;
      }

      if (account) {
        console.log("✅ User already has wallet:", account.address);
        return;
      }

      if (isCreatingWallet) {
        console.log("⏳ Wallet creation already in progress");
        return;
      }

      console.log("🔄 Starting automatic wallet creation for user:", user.id);
      setIsCreatingWallet(true);
      
      try {
        console.log("🔄 Calling Privy create() function...");
        const result = await create();
        console.log("✅ Wallet creation result:", result);
        Alert.alert("Success", "Wallet created successfully!");
      } catch (error: any) {
        console.error("❌ CRITICAL ERROR in wallet creation:", error);
        console.error("❌ Error message:", error.message);
        console.error("❌ Error code:", error.code);
        console.error("❌ Error stack:", error.stack);
        
        Alert.alert(
          "Wallet Creation Error", 
          `Failed to create wallet: ${error.message || "Unknown error"}\n\nCheck console for details.`
        );
      } finally {
        setIsCreatingWallet(false);
        console.log("🏁 Wallet creation process completed");
      }
    };

    createWalletIfNeeded();
  }, [user, account, create, isCreatingWallet]);

  // Fetch balances when wallet address changes
  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  const copyAddress = useCallback(async () => {
    if (!account?.address) {
      console.log("❌ No address to copy");
      Alert.alert("Error", "No wallet address available");
      return;
    }

    try {
      console.log("🔄 Copying address to clipboard:", account.address);
      await Clipboard.setStringAsync(account.address);
      console.log("✅ Address copied to clipboard successfully");
      Alert.alert("Copied!", "Wallet address copied to clipboard");
    } catch (error: any) {
      console.error("❌ Failed to copy address:", error);
      Alert.alert("Error", "Failed to copy address to clipboard");
    }
  }, [account?.address]);

  const refreshBalances = useCallback(async () => {
    console.log("🔄 Refresh balances button pressed");
    await fetchBalances(true);
  }, [fetchBalances]);

  const checkUSDCApproval = useCallback(async (spenderAddress: string, amount: string) => {
    if (!wallets[0] || !account?.address) {
      console.log("❌ No wallet or account for approval check");
      return { isApproved: false, allowance: "0" };
    }

    try {
      console.log("🔍 Checking USDC approval for spender:", spenderAddress);
      console.log("📊 Checking allowance from owner:", account.address, "to spender:", spenderAddress);
      const provider = await wallets[0].getProvider();
      
      // Check current allowance - allowance(owner, spender)
      const allowanceData = `0xdd62ed3e${account.address.slice(2).padStart(64, '0')}${spenderAddress.slice(2).padStart(64, '0')}`;
      console.log("📊 Allowance call data:", allowanceData);
      
      const allowanceHex = await provider.request({
        method: "eth_call",
        params: [
          {
            to: USDC_CONTRACT_ADDRESS,
            data: allowanceData,
          },
          "latest",
        ],
      });
      
      console.log("📊 Raw allowance response:", allowanceHex);
      
      if (!allowanceHex || allowanceHex === "0x") {
        console.log("📊 No allowance data returned");
        return { isApproved: false, allowance: "0" };
      }
      
      const allowance = parseInt(allowanceHex, 16);
      const requiredAmount = Math.floor(parseFloat(amount) * Math.pow(10, USDC_DECIMALS));
      
      console.log("📊 USDC approval check:", {
        rawAllowanceHex: allowanceHex,
        currentAllowance: allowance,
        requiredAmount: requiredAmount,
        isApproved: allowance >= requiredAmount,
        allowanceFormatted: (allowance / Math.pow(10, USDC_DECIMALS)).toFixed(6)
      });
      
      return {
        isApproved: allowance >= requiredAmount,
        allowance: allowance.toString()
      };
    } catch (error: any) {
      console.error("❌ Error checking USDC approval:", error);
      console.error("📊 Error details:", {
        message: error.message,
        code: error.code,
        data: error.data
      });
      return { isApproved: false, allowance: "0" };
    }
  }, [wallets, account?.address]);

  const executeUSDCApproval = useCallback(async (spenderAddress: string, amount: string) => {
    if (!wallets[0] || !account?.address) {
      console.log("❌ No wallet or account for USDC approval");
      Alert.alert("Error", "No wallet available for approval");
      return false;
    }

    console.log("🚀 ===== STARTING USDC APPROVAL PROCESS =====");
    console.log("📊 Approval details:", { spenderAddress, amount });
    
    setIsApproving(true);
    
    try {
      const provider = await wallets[0].getProvider();
      
      // Calculate approval amount in smallest unit
      const approvalAmount = Math.floor(parseFloat(amount) * Math.pow(10, USDC_DECIMALS));
      const approvalAmountHex = approvalAmount.toString(16).padStart(64, '0');
      const spenderAddressHex = spenderAddress.slice(2).padStart(64, '0');
      
      console.log("📊 Approval calculation:", {
        amount: amount,
        approvalAmount: approvalAmount,
        approvalAmountHex: approvalAmountHex,
        spenderAddress: spenderAddress,
        spenderAddressHex: spenderAddressHex
      });
      
      // Build approval transaction data (approve function: 0x095ea7b3)
      const approvalData = `0x095ea7b3${spenderAddressHex}${approvalAmountHex}`;
      console.log("📊 Approval transaction data:", approvalData);
      
      // Estimate gas for approval
      console.log("🔄 Estimating gas for approval transaction...");
      let approvalGasEstimate;
      try {
        const estimatedApprovalGas = await provider.request({
          method: "eth_estimateGas",
          params: [{
            to: USDC_CONTRACT_ADDRESS,
            data: approvalData,
            from: account.address,
          }],
        });
        
        // Add 20% buffer to approval gas estimate
        const approvalGasBuffer = Math.floor(parseInt(estimatedApprovalGas, 16) * 1.2);
        approvalGasEstimate = `0x${approvalGasBuffer.toString(16)}`;
        console.log("📊 Approval gas with buffer:", approvalGasEstimate);
      } catch (gasError: any) {
        console.log("⚠️ Approval gas estimation failed, using fallback");
        approvalGasEstimate = "0x7530"; // 30,000 gas fallback
      }
      
      // Build approval transaction
      const approvalTransaction = {
        to: USDC_CONTRACT_ADDRESS,
        data: approvalData,
        value: "0x0",
        gas: approvalGasEstimate,
        from: account.address,
        chainId: `0x${parseInt(BASE_SEPOLIA_CHAIN_ID).toString(16)}`,
      };
      
      console.log("📊 Approval transaction object:", approvalTransaction);
      
      // Send approval transaction
      console.log("🔄 Sending approval transaction...");
      const approvalResponse = await provider.request({
        method: "eth_sendTransaction",
        params: [approvalTransaction],
      });
      
      console.log("✅ USDC approval transaction sent successfully!");
      console.log("📊 Approval transaction hash:", approvalResponse);
      
      Alert.alert(
        "Approval Sent", 
        `USDC approval transaction sent successfully!\n\nHash: ${approvalResponse}\n\nYou can now attempt the transfer.`
      );
      
      return true;
      
    } catch (error: any) {
      console.error("❌ CRITICAL ERROR in USDC approval:", error);
      console.error("📊 Approval error details:", {
        message: error.message,
        code: error.code,
        data: error.data
      });
      
      let errorMessage = "Unknown approval error";
      if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        "Approval Error", 
        `USDC approval failed: ${errorMessage}\n\nCheck console for details.`
      );
      
      return false;
    } finally {
      setIsApproving(false);
      console.log("🏁 ===== USDC APPROVAL PROCESS COMPLETED =====");
    }
  }, [wallets, account?.address]);

  const switchToBaseSepolia = useCallback(async () => {
    if (!wallets[0]) {
      console.log("❌ No wallet available for network switching");
      Alert.alert("Error", "No wallet available");
      return;
    }
    
    try {
      console.log("🔄 Attempting to switch to Base Sepolia network...");
      const provider = await wallets[0].getProvider();
      
      // Check current network first
      const currentNetworkId = await provider.request({
        method: "net_version",
        params: [],
      });
      console.log("📊 Current network before switch:", currentNetworkId);
      
      const chainIdHex = `0x${parseInt(BASE_SEPOLIA_CHAIN_ID).toString(16)}`;
      console.log("🔄 Switching to chain ID:", chainIdHex);
      
      // Try different network switching methods for Privy embedded wallet
      try {
        // Method 1: Standard wallet_switchEthereumChain
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdHex }],
        });
        console.log("✅ Method 1 (wallet_switchEthereumChain) succeeded");
      } catch (switchError: any) {
        console.log("⚠️ Method 1 failed:", switchError.message);
        
        // Method 2: Try wallet_addEthereumChain first, then switch
        try {
          console.log("🔄 Trying wallet_addEthereumChain method...");
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: chainIdHex,
              chainName: "Base Sepolia",
              nativeCurrency: {
                name: "Ether",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: [BASE_SEPOLIA_RPC_URL],
              blockExplorerUrls: ["https://sepolia.basescan.org"],
            }],
          });
          console.log("✅ Added Base Sepolia network, now switching...");
          
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: chainIdHex }],
          });
          console.log("✅ Method 2 (add then switch) succeeded");
        } catch (addError: any) {
          console.log("⚠️ Method 2 failed:", addError.message);
          
          // Method 3: For Privy embedded wallets, we might need to configure the provider directly
          console.log("🔄 Trying direct provider configuration...");
          // Note: This might not work with all embedded wallet implementations
          throw new Error(`Network switching failed. Privy embedded wallet may not support network switching. Error: ${switchError.message}`);
        }
      }
      
      // Verify switch was successful
      const newNetworkId = await provider.request({
        method: "net_version",
        params: [],
      });
      console.log("📊 New network after switch:", newNetworkId);
      
      if (newNetworkId === BASE_SEPOLIA_CHAIN_ID) {
        console.log("✅ Successfully switched to Base Sepolia");
        Alert.alert("Success", "Switched to Base Sepolia network successfully!");
        
        // Refresh balances after network switch
        console.log("🔄 Refreshing balances after network switch...");
        setTimeout(() => {
          fetchBalances(true);
        }, 1000);
      } else {
        console.log("⚠️ Network switch may not have worked as expected");
        Alert.alert("Warning", "Network switch completed, but please verify you're on Base Sepolia");
      }
    } catch (error: any) {
      console.error("❌ Error switching network:", error);
      console.error("❌ Error message:", error.message);
      console.error("❌ Error code:", error.code);
      
      Alert.alert(
        "Network Switch Error", 
        `Failed to switch network: ${error.message || "Unknown error"}\n\nPrivy embedded wallets may have limited network switching support. Check console for details.`
      );
    }
  }, [wallets, fetchBalances]);

  const sendUSDC = useCallback(async () => {
    console.log("🚀 ===== STARTING USDC TRANSACTION PROCESS =====");
    console.log("📊 Initial transaction details:", { 
      destinationAddress, 
      amount, 
      walletAddress: account?.address,
      hasWallet: !!wallets[0],
      isLoading 
    });
    
    // Input validation with detailed logging
    console.log("🔍 Step 1: Input validation");
    if (!wallets[0]) {
      console.log("❌ VALIDATION FAILED: No wallet available");
      console.log("📊 Wallets array:", wallets);
      Alert.alert("Error", "No wallet available");
      return;
    }
    
    if (!destinationAddress) {
      console.log("❌ VALIDATION FAILED: Missing destination address");
      Alert.alert("Error", "Please enter destination address");
      return;
    }
    
    if (!amount) {
      console.log("❌ VALIDATION FAILED: Missing amount");
      Alert.alert("Error", "Please enter amount");
      return;
    }
    
    console.log("✅ Step 1: Input validation passed");

    // Address format validation
    console.log("🔍 Step 2: Address format validation");
    console.log("📊 Destination address:", destinationAddress);
    console.log("📊 Address length:", destinationAddress.length);
    console.log("📊 Starts with 0x:", destinationAddress.startsWith("0x"));
    
    if (!destinationAddress.startsWith("0x") || destinationAddress.length !== 42) {
      console.log("❌ VALIDATION FAILED: Invalid address format");
      console.log("📊 Expected: 42 chars starting with 0x");
      console.log("📊 Got:", destinationAddress.length, "chars, starts with 0x:", destinationAddress.startsWith("0x"));
      Alert.alert("Error", "Please enter a valid Ethereum address (42 characters starting with 0x)");
      return;
    }
    console.log("✅ Step 2: Address format validation passed");

    // Amount validation
    console.log("🔍 Step 3: Amount validation");
    const parsedAmount = parseFloat(amount);
    console.log("📊 Raw amount:", amount);
    console.log("📊 Parsed amount:", parsedAmount);
    console.log("📊 Is NaN:", isNaN(parsedAmount));
    console.log("📊 Is positive:", parsedAmount > 0);
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      console.log("❌ VALIDATION FAILED: Invalid amount");
      Alert.alert("Error", "Please enter a valid positive amount");
      return;
    }
    console.log("✅ Step 3: Amount validation passed");

    // Set loading state
    console.log("🔄 Step 4: Setting loading state");
    setIsLoading(true);
    console.log("✅ Step 4: Loading state set to true");
    
    try {
      // Get wallet provider
      console.log("🔍 Step 5: Getting wallet provider");
      console.log("📊 Wallet object:", wallets[0]);
      const provider = await wallets[0].getProvider();
      console.log("✅ Step 5: Wallet provider obtained");
      console.log("📊 Provider object:", provider);
      
      // CRITICAL: Ensure wallet is on Base Sepolia before proceeding
      console.log("🔍 Step 5.5: Verifying network before transaction");
      const currentNetworkId = await provider.request({
        method: "net_version",
        params: [],
      });
      console.log("📊 Current network before transaction:", currentNetworkId);
      
      if (currentNetworkId !== BASE_SEPOLIA_CHAIN_ID) {
        console.log("❌ CRITICAL: Wallet is not on Base Sepolia for transaction!");
        console.log("❌ Current network:", currentNetworkId, "Expected:", BASE_SEPOLIA_CHAIN_ID);
        
        Alert.alert(
          "Wrong Network",
          `Your wallet is on network ${currentNetworkId}, but USDC transactions require Base Sepolia (${BASE_SEPOLIA_CHAIN_ID}).\n\n` +
          "Please use the 'Switch to Base Sepolia' button first, then try the transaction again."
        );
        return;
      }
      console.log("✅ Step 5.5: Network verification passed - wallet is on Base Sepolia");
      
      // Calculate USDC amount
      console.log("🔍 Step 6: Calculating USDC amount");
      const usdcAmount = Math.floor(parsedAmount * Math.pow(10, USDC_DECIMALS));
      const usdcAmountHex = usdcAmount.toString(16).padStart(64, '0');
      const destinationAddressHex = destinationAddress.slice(2).padStart(64, '0');
      
      console.log("📊 USDC calculation details:", {
        originalAmount: amount,
        parsedAmount: parsedAmount,
        decimals: USDC_DECIMALS,
        multiplier: Math.pow(10, USDC_DECIMALS),
        usdcAmount: usdcAmount,
        usdcAmountHex: usdcAmountHex,
        destinationAddress: destinationAddress,
        destinationAddressHex: destinationAddressHex
      });
      console.log("✅ Step 6: USDC amount calculated");
      
      // Check USDC balance before transaction
      console.log("🔍 Step 6.5: Checking USDC balance before transaction");
      try {
        const currentUsdcBalanceHex = await provider.request({
          method: "eth_call",
          params: [
            {
              to: USDC_CONTRACT_ADDRESS,
              data: `0x70a08231000000000000000000000000${account.address.slice(2)}`,
            },
            "latest",
          ],
        });
        
        console.log("📊 Raw USDC balance response:", currentUsdcBalanceHex);
        
        if (!currentUsdcBalanceHex || currentUsdcBalanceHex === "0x" || currentUsdcBalanceHex === "0x0") {
          console.log("⚠️ USDC balance check returned empty/zero - this might indicate wrong network");
          console.log("⚠️ Proceeding with transaction - will fail if insufficient balance");
        } else {
          const currentUsdcBalance = parseInt(currentUsdcBalanceHex, 16);
          const currentUsdcBalanceFormatted = (currentUsdcBalance / Math.pow(10, USDC_DECIMALS)).toFixed(6);
          
          console.log("📊 Current USDC balance check:", {
            balanceHex: currentUsdcBalanceHex,
            balanceRaw: currentUsdcBalance,
            balanceFormatted: currentUsdcBalanceFormatted,
            requiredAmount: usdcAmount,
            hasEnoughBalance: currentUsdcBalance >= usdcAmount
          });
          
          if (currentUsdcBalance < usdcAmount) {
            console.log("❌ INSUFFICIENT USDC BALANCE");
            Alert.alert(
              "Insufficient Balance",
              `You don't have enough USDC to send this transaction.\n\n` +
              `Current balance: ${currentUsdcBalanceFormatted} USDC\n` +
              `Required amount: ${amount} USDC\n\n` +
              `Please check your balance and try a smaller amount.`
            );
            return;
          }
          
          console.log("✅ Step 6.5: USDC balance check passed");
        }
      } catch (balanceError: any) {
        console.error("❌ Step 6.5: USDC balance check failed:", balanceError);
        console.log("⚠️ Proceeding without balance check - transaction may fail");
      }
      
      // Skip USDC approval check for direct transfers
      console.log("🔍 Step 6.6: Skipping approval check for direct USDC transfer");
      console.log("📊 Direct transfers typically don't require approval");
      console.log("✅ Step 6.6: Proceeding with direct transfer");
      
      // Build transaction data
      console.log("🔍 Step 7: Building transaction data");
      const transactionData = `0xa9059cbb${destinationAddressHex}${usdcAmountHex}`;
      console.log("📊 Transaction data components:", {
        transferFunction: "0xa9059cbb",
        destinationAddressHex: destinationAddressHex,
        amountHex: usdcAmountHex,
        fullTransactionData: transactionData
      });
      console.log("✅ Step 7: Transaction data built");
      
      // Estimate gas
      console.log("🔍 Step 8: Estimating gas");
      const gasEstimateParams = {
        to: USDC_CONTRACT_ADDRESS,
        data: transactionData,
        from: account?.address,
      };
      console.log("📊 Gas estimate params:", gasEstimateParams);
      
      let gasEstimate;
      try {
        const estimatedGas = await provider.request({
          method: "eth_estimateGas",
          params: [gasEstimateParams],
        });
        console.log("✅ Step 8: Gas estimated successfully");
        console.log("📊 Gas estimate result:", estimatedGas);
        console.log("📊 Gas estimate (decimal):", parseInt(estimatedGas, 16));
        
        // Add 20% buffer to gas estimate for USDC transfers
        const gasBuffer = Math.floor(parseInt(estimatedGas, 16) * 1.2);
        gasEstimate = `0x${gasBuffer.toString(16)}`;
        console.log("📊 Gas with 20% buffer:", gasEstimate);
        console.log("📊 Gas with buffer (decimal):", gasBuffer);
      } catch (gasError: any) {
        console.error("❌ Step 8: Gas estimation failed:", gasError);
        console.error("📊 Gas error details:", {
          message: gasError.message,
          code: gasError.code,
          data: gasError.data
        });
        
        // Fallback to a higher gas limit if estimation fails
        console.log("🔄 Using fallback gas limit for USDC transfer");
        gasEstimate = "0x7530"; // 30,000 gas (higher than typical ERC-20 transfer)
        console.log("📊 Fallback gas estimate:", gasEstimate);
      }

      // Build final transaction
      console.log("🔍 Step 9: Building final transaction object");
      const transaction = {
        to: USDC_CONTRACT_ADDRESS,
        data: transactionData,
        value: "0x0",
        gas: gasEstimate,
        from: account?.address,
        chainId: `0x${parseInt(BASE_SEPOLIA_CHAIN_ID).toString(16)}`, // Force Base Sepolia
      };
      
      console.log("📊 Final transaction object:", transaction);
      console.log("📊 Transaction details:", {
        to: transaction.to,
        value: transaction.value,
        gas: transaction.gas,
        from: transaction.from,
        dataLength: transaction.data.length,
        dataPreview: transaction.data.substring(0, 20) + "..."
      });
      console.log("✅ Step 9: Final transaction object built");

      // Simulate transaction first to catch potential issues
      console.log("🔍 Step 9.5: Simulating transaction to check for issues...");
      try {
        await provider.request({
          method: "eth_call",
          params: [transaction, "latest"],
        });
        console.log("✅ Step 9.5: Transaction simulation successful - no obvious issues");
      } catch (simError: any) {
        console.error("❌ Step 9.5: Transaction simulation failed:", simError);
        console.error("📊 Simulation error details:", {
          message: simError.message,
          code: simError.code,
          data: simError.data
        });
        
        // Check for common simulation errors
        if (simError.message && simError.message.includes("insufficient funds")) {
          Alert.alert(
            "Simulation Error", 
            "Transaction simulation failed: Insufficient USDC balance.\n\n" +
            `You're trying to send ${amount} USDC, but your balance might be lower.`
          );
          return;
        } else if (simError.message && simError.message.includes("execution reverted")) {
          Alert.alert(
            "Simulation Error", 
            "Transaction simulation failed: Contract execution reverted.\n\n" +
            "This usually means:\n" +
            "• Insufficient USDC balance\n" +
            "• Invalid destination address\n" +
            "• Contract doesn't exist\n\n" +
            "Check your USDC balance and try a smaller amount."
          );
          return;
        } else {
          Alert.alert(
            "Simulation Error", 
            `Transaction simulation failed: ${simError.message}\n\n` +
            "The transaction will likely fail. Check console for details."
          );
          return;
        }
      }

      // Send transaction
      console.log("🔍 Step 10: Sending transaction");
      console.log("📊 About to call eth_sendTransaction with params:", [transaction]);
      console.log("📊 Full transaction details:", JSON.stringify(transaction, null, 2));
      
      // Additional validation before sending
      console.log("🔍 Pre-transaction validation:");
      console.log("📊 - From address:", transaction.from);
      console.log("📊 - To address (USDC contract):", transaction.to);
      console.log("📊 - Value:", transaction.value);
      console.log("📊 - Gas:", transaction.gas);
      console.log("📊 - Chain ID:", transaction.chainId);
      console.log("📊 - Data length:", transaction.data.length);
      console.log("📊 - Data preview:", transaction.data.substring(0, 50) + "...");
      
      try {
        const response = await provider.request({
          method: "eth_sendTransaction",
          params: [transaction],
        });

        console.log("✅ Step 10: Transaction sent successfully!");
        console.log("📊 Transaction response:", response);
        console.log("📊 Transaction hash:", response);
        
        Alert.alert("Success", `Transaction sent successfully!\n\nHash: ${response}`);
        setDestinationAddress("");
        setAmount("");
        
        // Refresh balances after transaction
        console.log("🔄 Step 11: Scheduling balance refresh");
        setTimeout(() => {
          console.log("🔄 Refreshing balances after successful transaction...");
          if (account?.address && wallets[0]) {
            fetchBalances(true);
          }
        }, 2000);
        
      } catch (sendError: any) {
        console.error("❌ Step 10: Transaction send failed:", sendError);
        console.error("📊 Send error details:", {
          message: sendError.message,
          code: sendError.code,
          data: sendError.data,
          stack: sendError.stack
        });
        
        // Check for specific error types
        if (sendError.code === 4001) {
          console.log("📊 Error 4001: User rejected transaction");
          Alert.alert("Transaction Cancelled", "Transaction was cancelled by user");
        } else if (sendError.code === -32603 || sendError.code === -32000) {
          console.log("📊 Error -32603/-32000: Internal JSON-RPC error");
          
          // Check if it's an insufficient funds error
          if (sendError.message && sendError.message.includes("insufficient funds")) {
            console.log("📊 Insufficient funds error detected");
            Alert.alert(
              "Insufficient Funds", 
              "You don't have enough ETH for gas fees on the current network.\n\n" +
              "Your wallet might be on Ethereum Mainnet instead of Base Sepolia.\n" +
              "Try using the 'Switch to Base Sepolia' button first."
            );
          } else {
            Alert.alert("Transaction Error", `Internal error: ${sendError.message}\n\nThis might be a network or gas issue.`);
          }
        } else if (sendError.message && sendError.message.includes("mainnet.rpc.privy.systems")) {
          console.log("📊 Transaction sent to mainnet instead of Base Sepolia");
          Alert.alert(
            "Wrong Network", 
            "The transaction was sent to Ethereum Mainnet instead of Base Sepolia.\n\n" +
            "Your wallet needs to be connected to Base Sepolia network.\n" +
            "Try using the 'Switch to Base Sepolia' button first."
          );
        } else if (sendError.message && sendError.message.includes("out of gas")) {
          console.log("📊 Out of gas error detected");
          Alert.alert(
            "Out of Gas", 
            "The transaction ran out of gas during execution.\n\n" +
            "This usually means the gas limit was too low for the USDC transfer.\n" +
            "The app will now use a higher gas limit for the next attempt."
          );
        } else {
          console.log("📊 Unknown error code:", sendError.code);
          Alert.alert("Transaction Error", `Transaction failed: ${sendError.message}`);
        }
        
        throw sendError; // Re-throw to be caught by outer catch
      }
      
    } catch (error: any) {
      console.error("❌ CRITICAL ERROR in USDC transaction:", error);
      console.error("📊 Error analysis:", {
        name: error.name,
        message: error.message,
        code: error.code,
        data: error.data,
        stack: error.stack,
        cause: error.cause
      });
      
      // More detailed error reporting
      let errorMessage = "Unknown error";
      if (error.message) {
        errorMessage = error.message;
      } else if (error.data) {
        errorMessage = error.data;
      }
      
      console.error("📊 Final error message for user:", errorMessage);
      
      Alert.alert(
        "Transaction Error", 
        `Transaction failed: ${errorMessage}\n\nCheck console logs for detailed error information.`
      );
    } finally {
      setIsLoading(false);
      console.log("🏁 ===== TRANSACTION PROCESS COMPLETED =====");
      console.log("📊 Loading state set to false");
    }
  }, [wallets, destinationAddress, amount, account?.address]);

  if (!user) {
    return null;
  }

  if (isCreatingWallet) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <Ionicons name="wallet" size={60} color="#fff" />
            <Text style={styles.loadingText}>Creating your wallet...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Your Wallet</Text>
              <Text style={styles.subtitle}>Base Sepolia Network</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Ionicons name="log-out-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Wallet Address Card */}
          {account?.address && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="wallet" size={24} color="#10b981" />
                <Text style={styles.cardTitle}>Wallet Address</Text>
              </View>
              
              <View style={styles.addressContainer}>
                <Text style={styles.walletAddress}>{account.address}</Text>
                <TouchableOpacity style={styles.copyButton} onPress={copyAddress}>
                  <Ionicons name="copy-outline" size={20} color="#6366f1" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.networkButton} onPress={switchToBaseSepolia}>
                  <Ionicons name="swap-horizontal" size={16} color="#fff" />
                  <Text style={styles.networkButtonText}>Switch to Base Sepolia</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.faucetButton} onPress={copyAddress}>
                  <Ionicons name="water" size={16} color="#fff" />
                  <Text style={styles.faucetButtonText}>Copy for Faucet</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Balances Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="analytics" size={24} color="#f59e0b" />
              <Text style={styles.cardTitle}>Balances</Text>
              <TouchableOpacity 
                style={[styles.refreshButton, isRefreshingBalances && styles.refreshButtonDisabled]} 
                onPress={refreshBalances}
                disabled={isRefreshingBalances}
              >
                {isRefreshingBalances ? (
                  <Ionicons name="hourglass-outline" size={16} color="#6b7280" />
                ) : (
                  <Ionicons name="refresh" size={16} color="#6366f1" />
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.balanceContainer}>
              <View style={styles.balanceItem}>
                <View style={styles.balanceHeader}>
                  <Ionicons name="diamond" size={20} color="#627eea" />
                  <Text style={styles.balanceLabel}>ETH</Text>
                </View>
                <Text style={styles.balanceAmount}>{ethBalance}</Text>
              </View>
              
              <View style={styles.balanceItem}>
                <View style={styles.balanceHeader}>
                  <Ionicons name="cash" size={20} color="#2775ca" />
                  <Text style={styles.balanceLabel}>USDC</Text>
                </View>
                <Text style={styles.balanceAmount}>{usdcBalance}</Text>
              </View>
            </View>
          </View>

          {/* Send USDC Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="send" size={24} color="#ef4444" />
              <Text style={styles.cardTitle}>Send USDC</Text>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Destination Address</Text>
              <TextInput
                style={styles.input}
                value={destinationAddress}
                onChangeText={setDestinationAddress}
                placeholder="0x..."
                placeholderTextColor="#9ca3af"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Amount (USDC)</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
              />
            </View>
            
                <TouchableOpacity
                  style={[styles.sendButton, (isLoading || isApproving) && styles.sendButtonDisabled]}
                  onPress={sendUSDC}
                  disabled={isLoading || isApproving}
                >
                  {isApproving ? (
                    <Text style={styles.sendButtonText}>Approving...</Text>
                  ) : isLoading ? (
                    <Text style={styles.sendButtonText}>Sending...</Text>
                  ) : (
                    <>
                      <Ionicons name="paper-plane" size={20} color="#fff" />
                      <Text style={styles.sendButtonText}>Send USDC</Text>
                    </>
                  )}
                </TouchableOpacity>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
      </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingTop: 40,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  logoutButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  walletAddress: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'monospace',
    flex: 1,
  },
  copyButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  networkButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  networkButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  faucetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  faucetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});
