// Example usage of PyHard Vendor SDK

import React from 'react';
import { 
  PyHardProvider,
  WalletConnect,
  SubscriptionQRGenerator,
  PaymentQRGenerator,
  SubscriptionList,
  PaymentHistory,
  useWallet,
  useSubscriptions,
  usePaymentDetection
} from './src';

// Example 1: Complete Vendor Dashboard with Styled Components
function VendorDashboard() {
  const { address } = useWallet();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">PyHard Vendor Dashboard</h1>
      
      {/* Wallet Connection */}
      <WalletConnect />
      
      {/* QR Code Generators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubscriptionQRGenerator />
        <PaymentQRGenerator />
      </div>
      
      {/* Subscriptions and History */}
      {address && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SubscriptionList vendorAddress={address} />
          <PaymentHistory smartWalletAddress="0x..." subscriptionId={1} />
        </div>
      )}
    </div>
  );
}

// Example 2: Custom UI with Headless Components
function CustomSubscriptionForm() {
  return (
    <SubscriptionQRGenerator>
      {({ amount, setAmount, interval, setInterval, generateQR, qrData, isValid, isLoading }) => (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Create Subscription</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Amount (PYUSD)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10.00"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Interval</label>
              <select
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="86400">Daily</option>
                <option value="604800">Weekly</option>
                <option value="2592000">Monthly</option>
              </select>
            </div>
            
            <button
              onClick={generateQR}
              disabled={!isValid || isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md disabled:bg-gray-300"
            >
              {isLoading ? 'Generating...' : 'Generate QR Code'}
            </button>
            
            {qrData && (
              <div className="mt-4 text-center">
                <h4 className="font-medium mb-2">Subscription QR Code</h4>
                <div className="inline-block p-4 bg-gray-50 rounded">
                  {/* QR Code would go here */}
                  <div className="w-48 h-48 bg-gray-200 rounded flex items-center justify-center">
                    QR Code: {qrData.slice(0, 50)}...
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </SubscriptionQRGenerator>
  );
}

// Example 3: Payment Detection
function PaymentNotification() {
  const { address } = useWallet();
  const { subscriptions } = useSubscriptions(address || '');
  
  // Monitor first subscription for payments
  const firstSubscription = subscriptions[0];
  const { latestPayment } = usePaymentDetection(
    firstSubscription?.smartWallet || '',
    firstSubscription?.subscriptionId || 0,
    (payment) => {
      console.log('New payment received:', payment);
      // Show notification, update UI, etc.
    }
  );

  return (
    <div>
      {latestPayment && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Latest payment: {latestPayment.amount} PYUSD
        </div>
      )}
    </div>
  );
}

// Example 4: Manual Address Usage
function ManualVendor() {
  const { setManualAddress, address } = useWallet();
  
  React.useEffect(() => {
    // Set vendor address manually (e.g., from environment variable)
    setManualAddress('0x55c7E5124FC14a3CDDE1f09ecBb8676141c5A06c');
  }, [setManualAddress]);

  return (
    <div>
      <h2>Manual Vendor: {address}</h2>
      <SubscriptionQRGenerator />
    </div>
  );
}

// Main App
function App() {
  return (
    <PyHardProvider>
      <div className="min-h-screen bg-gray-50">
        <VendorDashboard />
        
        <div className="max-w-6xl mx-auto p-6 mt-8">
          <h2 className="text-2xl font-bold mb-6">Custom Components</h2>
          <CustomSubscriptionForm />
        </div>
        
        <div className="max-w-6xl mx-auto p-6 mt-8">
          <h2 className="text-2xl font-bold mb-6">Payment Detection</h2>
          <PaymentNotification />
        </div>
        
        <div className="max-w-6xl mx-auto p-6 mt-8">
          <h2 className="text-2xl font-bold mb-6">Manual Address</h2>
          <ManualVendor />
        </div>
      </div>
    </PyHardProvider>
  );
}

export default App;
