'use client';

// Subscriptions management hook for PyHard Vendor SDK

import { useState, useEffect, useCallback } from 'react';
import { useWalletClient } from 'wagmi';
import { createPublicClient, http, encodeFunctionData } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { fetchSubscriptions } from '../utils/blockscout';
import { Subscription, SubscriptionState } from '../types';
import { PAYMASTER_WORKER_URL, POLLING_INTERVALS } from '../constants';

export function useSubscriptions(vendorAddress: string) {
  const { data: walletClient } = useWalletClient();
  const [state, setState] = useState<SubscriptionState>({
    subscriptions: [],
    loading: false,
    error: null
  });

  const fetchSubscriptionsData = useCallback(async () => {
    if (!vendorAddress) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const subscriptions = await fetchSubscriptions(vendorAddress);
      setState({
        subscriptions,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('❌ Error fetching subscriptions:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch subscriptions'
      }));
    }
  }, [vendorAddress]);

  // Auto-fetch on mount and when vendor address changes
  useEffect(() => {
    fetchSubscriptionsData();
  }, [fetchSubscriptionsData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!vendorAddress) return;

    const interval = setInterval(fetchSubscriptionsData, POLLING_INTERVALS.SUBSCRIPTIONS);
    return () => clearInterval(interval);
  }, [fetchSubscriptionsData, vendorAddress]);

  const executePayment = useCallback(async (subscription: Subscription) => {
    if (!walletClient || !vendorAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      console.log(`💰 Executing payment for subscription ${subscription.subscriptionId}`);
      
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

      // Check if subscription is ready for payment
      const now = Math.floor(Date.now() / 1000);
      const lastPayment = parseInt(subscription.lastPayment);
      const interval = parseInt(subscription.interval);
      const nextPaymentTime = lastPayment + interval;
      
      if (now < nextPaymentTime) {
        const timeUntilReady = nextPaymentTime - now;
        const hoursUntilReady = Math.ceil(timeUntilReady / 3600);
        throw new Error(`Payment not ready yet. Next payment available in ${hoursUntilReady} hours.`);
      }

      // Send transaction to smart wallet
      const hash = await walletClient.sendTransaction({
        to: subscription.smartWallet as `0x${string}`,
        data: functionData,
        value: 0n,
        gas: 100000n
      });

      console.log('✅ Payment transaction sent:', hash);
      
      // Refresh subscriptions after successful payment
      await fetchSubscriptionsData();
      
      return hash;
    } catch (error) {
      console.error('❌ Error executing payment:', error);
      throw error;
    }
  }, [walletClient, vendorAddress, fetchSubscriptionsData]);

  const isPaymentDue = useCallback((subscription: Subscription) => {
    const now = Math.floor(Date.now() / 1000);
    const lastPayment = parseInt(subscription.lastPayment);
    const interval = parseInt(subscription.interval);
    const nextPaymentTime = lastPayment + interval;
    
    return now >= nextPaymentTime;
  }, []);

  const getTimeUntilNextPayment = useCallback((subscription: Subscription) => {
    const now = Math.floor(Date.now() / 1000);
    const lastPayment = parseInt(subscription.lastPayment);
    const interval = parseInt(subscription.interval);
    const nextPaymentTime = lastPayment + interval;
    
    if (now >= nextPaymentTime) {
      return "Due now";
    }
    
    const timeUntilNext = nextPaymentTime - now;
    const hoursUntilNext = Math.ceil(timeUntilNext / 3600);
    
    if (hoursUntilNext < 24) {
      return `Due in ${hoursUntilNext} hours`;
    } else {
      const daysUntilNext = Math.ceil(hoursUntilNext / 24);
      return `Due in ${daysUntilNext} days`;
    }
  }, []);

  return {
    ...state,
    refetch: fetchSubscriptionsData,
    executePayment,
    isPaymentDue,
    getTimeUntilNextPayment
  };
}
