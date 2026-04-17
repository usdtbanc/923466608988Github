# USDTBANC - Non-Custodial Crypto Banking Platform

Internal development repository for the USDTBANC crypto banking application.

## Project Overview

A secure, non-custodial crypto banking web application enabling multi-chain wallet management with client-side encryption. Private keys and mnemonics are encrypted and stored locally—never transmitted to servers.

**Client**: USDTBANC  
**Status**: Active Development  
**Repository Access**: Private (Team Only)

## Key Features

🔐 **Non-Custodial Architecture**
- Private keys/mnemonics encrypted client-side with AES-GCM
- PBKDF2 key derivation with 150k iterations
- Stored securely in browser localStorage only

🌍 **Multi-Chain Wallet Support**
- **EVM chains**: Ethereum, Binance Smart Chain (BSC), Polygon
- **Solana**: Full Solana wallet integration
- **XRP Ledger**: Native XRP wallet support
- **Bitcoin**: BTC wallet with BIP32/BIP39 support

💳 **Fiat On-Ramp Integration**
- Paybis widget for USD (Americas) and EUR (Eurozone)
- Buy crypto directly with fiat currency
- Real-time exchange rate integration

🔐 **Security**
- Two-Factor Authentication (TOTP) for all transactions
- Client-side transaction signing
- Encrypted vault for key storage

📊 **Portfolio Management**
- Real-time market prices via CoinGecko API
- Multi-chain balance tracking
- Transaction history with on-chain verification

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite + TypeScript 5 |
| **Routing** | react-router-dom v6 |
| **State** | TanStack React Query + Custom Hooks |
| **Backend** | Supabase (Postgres + Auth + Realtime + Edge Functions) |
| **Wallets** | Privy (Embedded Wallets) |
| **Styling** | Tailwind CSS v3 + shadcn/ui (Radix UI) |
| **Forms** | react-hook-form + Zod validation |
| **Crypto** | ethers, @solana/web3.js, xrpl, bitcoinjs-lib, bip32/bip39 |
| **Notifications** | Sonner toast notifications |
| **PDF Export** | jspdf |

See [CLAUDE.md](./CLAUDE.md) for detailed project architecture and development guidelines.

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Local Setup

```bash
# Install dependencies
npm install

# Create .env.local with required variables (see Environment Variables section)

# Start development server
npm run dev
```

Development server runs on `http://localhost:8080`

## Environment Variables

Required for local development (`.env.local`):

```env
# Privy Embedded Wallets
VITE_PRIVY_APP_ID=<from_privy_dashboard>

# Paybis Fiat On-Ramp
VITE_PAYBIS_PARTNER_ID=<from_paybis_account>
VITE_PAYBIS_SANDBOX=true

# Supabase
VITE_SUPABASE_URL=<from_supabase_project>
VITE_SUPABASE_ANON_KEY=<from_supabase_project>
```

Edge function secret (Supabase only):
```
PAYBIS_API_KEY=<from_paybis_account>
```

## Build & Deployment

### Development
```bash
npm run dev        # Start dev server with hot reload
npm run lint       # Run ESLint
```

### Production
```bash
npm run build      # Build for production
npm run preview    # Preview production build locally
```

### Deployment Targets
- **Staging**: Netlify (api-based-integration branch)
- **Production**: TBD

## Project Structure

```
src/
├── components/              # Reusable components
│   ├── Layout.tsx          # App shell & navigation
│   ├── PaybisWidget.tsx    # Fiat on-ramp iframe
│   ├── WalletSetup.tsx     # Privy OTP gate
│   ├── TwoFactorVerifyModal.tsx
│   └── ui/                 # shadcn/ui primitives
├── pages/                  # Page routes
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts          # Supabase auth
│   ├── useEvmWallet.ts     # EVM wallet state
│   ├── useBtcWallet.ts
│   ├── useSolWallet.ts
│   ├── useXrpWallet.ts
│   └── useTransactions.ts  # Transaction tracking
├── lib/
│   ├── crypto/vault.ts     # AES-GCM encryption
│   └── chain/              # Chain-specific adapters
├── integrations/supabase/  # Auto-generated Supabase types
└── assets/                 # Static files

supabase/
└── functions/
    └── paybis-request/     # Edge function for API key handling
```

## Authentication Flow

1. **Supabase Auth** - Email/password login (primary identity)
2. **Privy OTP Gate** - One-time email OTP (WalletSetup component)
3. **Embedded Wallet** - Auto-created after Privy OTP verification
4. **TOTP 2FA** - Required for every transaction

See [CLAUDE.md](./CLAUDE.md#authentication--two-layer-system) for detailed auth architecture.

## Database Schema

Key tables in Supabase:
- `profiles` - User profile data
- `transactions` - Transaction records
- `wallet_transactions` - On-chain transaction history
- `exchange_rates` - Currency conversion rates

Realtime subscriptions used for live updates on transactions and balances.

## Development Guidelines

- **No Redux/Zustand** - Use custom hooks + local state only
- **Type Safety** - Full TypeScript coverage
- **Component Convention** - Named exports, one per file
- **Path Alias** - Use `@/` for imports from `src/`
- **Error Handling** - Console errors, return null on failure
- **Testing** - Manual testing in browser; no test suite setup yet

See [CLAUDE.md](./CLAUDE.md) for complete development conventions.

## Security Considerations

### What We Do
✅ Encrypt private keys with AES-GCM client-side  
✅ Never transmit keys to backend servers  
✅ Require 2FA for all transactions  
✅ Client-side transaction signing  
✅ PBKDF2 key derivation (150k iterations)

### What Users Must Do
⚠️ Keep seed phrases secure and private  
⚠️ Use strong account passwords  
⚠️ Verify transaction details before signing  
⚠️ Protect device/browser from malware

## Current Branches

- `main` - Production-ready code
- `api-based-integration` - Active development (Paybis integration)
- Other feature branches as needed

## Troubleshooting

### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Port Already in Use
```bash
# Change dev server port
npm run dev -- --port 3000
```

### Supabase Connection Issues
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local
- Check Supabase project is active and accessible
- Verify network connectivity to Supabase servers

## Notes for Development Team

- All work should be branched from `main`
- Use descriptive commit messages following the existing pattern
- Test locally before pushing
- Keep [CLAUDE.md](./CLAUDE.md) updated as architecture changes
- Review security implications of any sensitive changes

---

**For detailed architecture and Claude Code guidelines, see [CLAUDE.md](./CLAUDE.md)**
