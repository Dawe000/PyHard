# PYUSD Smart Wallet Paymaster - Cloudflare Worker

This Cloudflare Worker provides gas sponsorship for PYUSD Smart Wallet transactions. It validates user operations and sponsors gas costs for whitelisted wallets.

## Features

- ✅ **Gas Sponsorship**: Sponsors gas for PYUSD Smart Wallet transactions
- ✅ **Signature Verification**: Validates EOA signatures before sponsoring
- ✅ **Whitelist Management**: Only sponsors transactions from whitelisted wallets
- ✅ **Rate Limiting**: Simple rate limiting to prevent abuse
- ✅ **CORS Support**: Cross-origin requests supported
- ✅ **Health Check**: Built-in health monitoring

## Architecture

```
User Transaction → Smart Wallet → Paymaster API (CF Worker) → Sponsors Gas
```

The paymaster only sponsors transactions that are:
1. Signed by the user's EOA (security maintained)
2. From whitelisted wallets
3. Within rate limits
4. Valid ERC-4337 UserOperations

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file or set environment variables in Cloudflare:

```env
PRIVATE_KEY=your_paymaster_private_key
WALLET_FACTORY_ADDRESS=0x...
ENTRY_POINT_ADDRESS=0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
SUPPORTED_CHAINS=["1","42161","8453"]  # Ethereum, Arbitrum, Base
```

### 3. Deploy to Cloudflare

```bash
# Development
npm run dev

# Production
npm run deploy
```

## API Endpoints

### POST /sponsor

Sponsors a user operation.

**Request:**
```json
{
  "userOp": {
    "sender": "0x...",
    "nonce": "0x0",
    "initCode": "0x",
    "callData": "0x...",
    "callGasLimit": "0x...",
    "verificationGasLimit": "0x...",
    "preVerificationGas": "0x...",
    "maxFeePerGas": "0x...",
    "maxPriorityFeePerGas": "0x...",
    "paymasterAndData": "0x",
    "signature": "0x..."
  },
  "userOpHash": "0x...",
  "maxCost": "0x...",
  "entryPoint": "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
  "chainId": "1"
}
```

**Response:**
```json
{
  "paymasterAndData": "0x...",
  "context": "0x",
  "sigValidationData": "0x"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": 1234567890
}
```

## Security

- **EOA Signature Verification**: Only transactions signed by the user's EOA are sponsored
- **Whitelist**: Only wallets created by the factory are whitelisted
- **Rate Limiting**: Prevents abuse with simple rate limiting
- **CORS**: Proper CORS headers for web integration

## Integration with Smart Wallet

The CF Worker integrates with the `Paymaster.sol` contract:

1. **Validation**: The contract calls the CF Worker API to validate transactions
2. **Sponsorship**: If valid, the CF Worker returns sponsorship data
3. **Gas Payment**: The paymaster contract sponsors the gas cost

## Development

### Local Development

```bash
npm run dev
```

This starts a local development server at `http://localhost:8787`.

### Testing

```bash
# Test the health endpoint
curl http://localhost:8787/health

# Test sponsorship (with valid userOp)
curl -X POST http://localhost:8787/sponsor \
  -H "Content-Type: application/json" \
  -d '{"userOp": {...}, "userOpHash": "0x...", "maxCost": "0x...", "entryPoint": "0x...", "chainId": "1"}'
```

## Deployment

### Cloudflare Workers

1. Install Wrangler CLI: `npm install -g wrangler`
2. Login: `wrangler login`
3. Deploy: `npm run deploy`

### Environment Variables

Set these in Cloudflare Workers dashboard:

- `PRIVATE_KEY`: Paymaster private key
- `WALLET_FACTORY_ADDRESS`: Smart wallet factory address
- `ENTRY_POINT_ADDRESS`: ERC-4337 entry point address
- `SUPPORTED_CHAINS`: JSON array of supported chain IDs

## Monitoring

The worker includes built-in monitoring:

- Health check endpoint
- Error logging
- Request/response logging
- Rate limiting metrics

## Rate Limiting

Simple rate limiting is implemented:

- **Window**: 1 minute
- **Limit**: 10 operations per wallet per window
- **Storage**: Cloudflare KV (optional)

## Future Enhancements

- Advanced rate limiting with sliding windows
- Analytics and monitoring dashboard
- Multi-chain support with chain-specific validation
- Advanced signature verification
- Gas price optimization
- Transaction batching

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure CORS headers are properly set
2. **Signature Verification**: Check that userOp signature is valid
3. **Rate Limiting**: Check if wallet is rate limited
4. **Whitelist**: Ensure wallet is whitelisted

### Debug Mode

Enable debug logging by setting `DEBUG=true` in environment variables.

## License

MIT License - see LICENSE file for details.
