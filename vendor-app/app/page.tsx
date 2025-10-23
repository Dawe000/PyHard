"use client";

import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { createSubscriptionQR, formatInterval } from "@/lib/qrcode";
import { INTERVAL_PRESETS } from "@/lib/constants";
import { useAccount, useWalletClient } from 'wagmi';
import { createPublicClient, createWalletClient, http, encodeFunctionData } from 'viem';
import { arbitrumSepolia } from 'viem/chains';

interface Subscription {
  subscriptionId: number;
  smartWallet: string;
  vendor: string;
  amountPerInterval: string;
  interval: string;
  lastPayment: string;
  active: boolean;
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [amount, setAmount] = useState("");
  const [intervalType, setIntervalType] = useState<"daily" | "weekly" | "monthly" | "custom">("monthly");
  const [customInterval, setCustomInterval] = useState("");
  const [qrData, setQrData] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [executingPayment, setExecutingPayment] = useState<number | null>(null);

  // Fetch subscriptions when address changes
  useEffect(() => {
    if (address) {
      fetchSubscriptions();
      const interval = setInterval(fetchSubscriptions, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [address]);

  async function fetchSubscriptions() {
    if (!address) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/subscriptions?vendor=${address}`);
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleGenerateQR() {
    if (!address || !amount) return;

    let intervalSeconds: string;
    
    switch (intervalType) {
      case "daily":
        intervalSeconds = INTERVAL_PRESETS.DAILY.toString();
        break;
      case "weekly":
        intervalSeconds = INTERVAL_PRESETS.WEEKLY.toString();
        break;
      case "monthly":
        intervalSeconds = INTERVAL_PRESETS.MONTHLY.toString();
        break;
      case "custom":
        intervalSeconds = (parseInt(customInterval) * 86400).toString(); // Convert days to seconds
        break;
    }

    const qr = createSubscriptionQR(address, amount, intervalSeconds);
    setQrData(qr);
  }

  function getIntervalSeconds(): number {
    switch (intervalType) {
      case "daily": return INTERVAL_PRESETS.DAILY;
      case "weekly": return INTERVAL_PRESETS.WEEKLY;
      case "monthly": return INTERVAL_PRESETS.MONTHLY;
      case "custom": return parseInt(customInterval) * 86400;
      default: return 0;
    }
  }

  function formatTimestamp(timestamp: string): string {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  }

  function calculateNextPayment(lastPayment: string, interval: string): string {
    const nextPaymentTimestamp = parseInt(lastPayment) + parseInt(interval);
    const date = new Date(nextPaymentTimestamp * 1000);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  }

  async function executePayment(subscription: Subscription) {
    // Only run in browser
    if (typeof window === 'undefined') {
      return;
    }

    if (!walletClient) {
      alert('Wallet not connected');
      return;
    }

    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    setExecutingPayment(subscription.subscriptionId);
    
    try {
      console.log(`💰 Executing payment for subscription ${subscription.subscriptionId}`);
      console.log('📊 Subscription details:', subscription);
      
      // Encode the executeSubscriptionPayment function call
      const functionData = encodeFunctionData({
        abi: [{
          type: 'function',
          name: 'executeSubscriptionPayment',
          inputs: [{ type: 'uint256', name: 'subscriptionId' }],
          outputs: []
        }],
        functionName: 'executeSubscriptionPayment',
        args: [BigInt(subscription.subscriptionId)]
      });

      console.log('📝 Function data:', functionData);

      // Check if subscription is ready for payment
      const now = Math.floor(Date.now() / 1000);
      const lastPayment = parseInt(subscription.lastPayment);
      const interval = parseInt(subscription.interval);
      const nextPaymentTime = lastPayment + interval;
      
      console.log('⏰ Payment timing check:', {
        now,
        lastPayment,
        interval,
        nextPaymentTime,
        isReady: now >= nextPaymentTime
      });

      if (now < nextPaymentTime) {
        const timeUntilReady = nextPaymentTime - now;
        const hoursUntilReady = Math.ceil(timeUntilReady / 3600);
        alert(`Payment not ready yet. Next payment available in ${hoursUntilReady} hours.`);
        return;
      }

      // Send transaction to smart wallet
      const hash = await walletClient.sendTransaction({
        to: subscription.smartWallet as `0x${string}`,
        data: functionData,
        value: 0n,
        gas: 100000n // Set reasonable gas limit
      });

      console.log('✅ Payment transaction sent:', hash);
      alert(`Payment executed successfully!\nTransaction: ${hash}`);
      
      // Refresh subscriptions to show updated data
      await fetchSubscriptions();
      
    } catch (error) {
      console.error('❌ Error executing payment:', error);
      alert(`Failed to execute payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setExecutingPayment(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Subscription Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Create subscription requests and manage your subscribers
          </p>
        </div>

        {/* Connect Wallet */}
        <div className="mb-8">
          <appkit-button />
        </div>

        {address ? (
          <div className="space-y-8">
            {/* Vendor Address */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Your Vendor Address
              </h2>
              <p className="text-lg font-mono text-gray-900 dark:text-white break-all">
                {address}
              </p>
            </div>

            {/* Create Subscription */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Create Subscription Request
              </h2>

              <div className="space-y-6">
                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount (PYUSD)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="10.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Interval Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Billing Interval
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {(["daily", "weekly", "monthly", "custom"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setIntervalType(type)}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          intervalType === type
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>

                  {intervalType === "custom" && (
                    <input
                      type="number"
                      value={customInterval}
                      onChange={(e) => setCustomInterval(e.target.value)}
                      placeholder="Number of days"
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  )}
                </div>

                {/* Generate QR Button */}
                <button
                  onClick={handleGenerateQR}
                  disabled={!amount || (intervalType === "custom" && !customInterval)}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  Generate QR Code
                </button>

                {/* QR Code Display */}
                {qrData && (
                  <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Scan to Subscribe
                    </h3>
                    <div className="inline-block p-4 bg-white rounded-lg">
                      <QRCodeCanvas value={qrData} size={256} />
                    </div>
                    <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                      <p>Amount: {amount} PYUSD</p>
                      <p>Interval: {formatInterval(getIntervalSeconds())}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Subscriptions List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Active Subscriptions
              </h2>

              {loading ? (
                <p className="text-gray-600 dark:text-gray-400">Loading...</p>
              ) : subscriptions.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">
                  No active subscriptions yet. Share your QR code to get started!
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                          Smart Wallet
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                          Interval
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                          Last Payment
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                          Next Due
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptions.map((sub) => (
                        <tr
                          key={`${sub.smartWallet}-${sub.subscriptionId}`}
                          className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="py-3 px-4 font-mono text-sm text-gray-900 dark:text-white">
                            {sub.smartWallet.slice(0, 6)}...{sub.smartWallet.slice(-4)}
                          </td>
                          <td className="py-3 px-4 text-gray-900 dark:text-white">
                            {(parseInt(sub.amountPerInterval) / 1000000).toFixed(2)} PYUSD
                          </td>
                          <td className="py-3 px-4 text-gray-900 dark:text-white">
                            {formatInterval(parseInt(sub.interval))}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                            {formatTimestamp(sub.lastPayment)}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                            {calculateNextPayment(sub.lastPayment, sub.interval)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Active
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => executePayment(sub)}
                              disabled={loading || executingPayment === sub.subscriptionId}
                              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm font-medium transition"
                            >
                              {executingPayment === sub.subscriptionId ? 'Executing...' : 'Execute Payment'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Connect Your Wallet to Get Started
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Connect your wallet to create subscription requests and manage your subscribers
            </p>
          </div>
        )}
        </div>
    </div>
  );
}
