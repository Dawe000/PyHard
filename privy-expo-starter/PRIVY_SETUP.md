# Privy App Secret Setup

To enable EIP-7702 authorization signing, you need to get your Privy App Secret:

## Steps:

1. **Go to your Privy Dashboard**
2. **Navigate to App settings > Basics tab**
3. **Copy the App Secret**
4. **Set it as an environment variable:**

```bash
export PRIVY_APP_SECRET="your-actual-app-secret-here"
```

## Alternative: Update the code directly

You can also update the `PRIVY_APP_SECRET` constant in `services/sendService.ts`:

```typescript
const PRIVY_APP_SECRET = "your-actual-app-secret-here";
```

## Current Status:

- ✅ App ID is set: `cmgtb4vg702vqld0da5wktriq`
- ⚠️ App Secret needs to be set for EIP-7702 signing
- 🔄 Currently using mock authorization when secret is not available

## Testing:

Once the app secret is set, the EIP-7702 authorization will be signed using the Privy REST API instead of the mock authorization.
