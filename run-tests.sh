#!/bin/bash

echo "🚀 PYUSD Smart Wallet Test Suite"
echo "================================="

# Check if we're in the right directory
if [ ! -d "smartwallet" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

cd smartwallet

echo ""
echo "📋 Running Test Suite..."
echo ""

# Run unit tests
echo "🧪 Running Smart Wallet Unit Tests..."
npx hardhat test test/SmartWalletUnitTests.test.ts

echo ""
echo "🧪 Running Paymaster Unit Tests..."
npx hardhat test test/PaymasterUnitTests.test.ts

echo ""
echo "🧪 Running Complete End-to-End Integration Test..."
echo "⚠️  Make sure Hardhat server and CF Worker are running!"
echo ""

# Check if CF Worker is running
if curl -s http://localhost:8787/health > /dev/null 2>&1; then
    echo "✅ CF Worker is running"
    npx hardhat test test/CompleteEndToEndIntegration.test.ts
else
    echo "❌ CF Worker not running on localhost:8787"
    echo "💡 Start it with: cd paymaster-cf-worker && npm run dev"
fi

echo ""
echo "🎉 Test suite complete!"
