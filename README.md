# USDTBANC - Non-Custodial Crypto Banking Platform

A secure, non-custodial crypto banking web application that allows users to manage multi-chain wallets with client-side encryption. All private keys and mnemonics are encrypted and stored locally—never sent to the server.

## Features

🔐 **Non-Custodial Design**
- Private keys/mnemonics encrypted client-side with AES-GCM
- PBKDF2 key derivation with 150k iterations
- Stored securely in browser localStorage

🌍 **Multi-Chain Support**
- **EVM chains**: Ethereum, Binance Smart Chain (BSC), Polygon
- **Solana**: Full Solana wallet integration
- **XRP Ledger**: Native XRP wallet support
- **Bitcoin**: BTC wallet with BIP32/BIP39 support

💳 **Fiat On-Ramp**
- Paybis widget integration for USD (Americas) and EUR (Eurozone)
- Buy crypto directly with fiat currency
- Real-time exchange rates via CoinGecko API

🔐 **Two-Factor Authentication (2FA)**
- TOTP-based authentication
- Required for all send operations
- Secure transaction verification

📊 **Live Market Data**
- Real-time market prices and trends
- Portfolio tracking across all chains
- Transaction history with on-chain verification

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite + TypeScript 5 |
| **Routing** | react-router-dom v6 |
| **State Management** | TanStack React Query + Custom Hooks |
| **Backend/Database** | Supabase (Postgres + Auth + Realtime + Edge Functions) |
| **Embedded Wallets** | Privy (@privy-io/react-auth) |
| **Styling** | Tailwind CSS v3 + shadcn/ui |
| **UI Components** | Radix UI + Framer Motion animations |
| **Forms** | react-hook-form + Zod validation |
| **Crypto** | ethers, @solana/web3.js, xrpl, bitcoinjs-lib |
| **Notifications** | Sonner toast notifications |

## Quick Start

### Prerequisites
- Node.js 16+ (install via [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/m-Jawa-d/usdtbanc.git

# Navigate to project directory
cd usdtbanc

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Privy (Embedded Wallets)
VITE_PRIVY_APP_ID=your_privy_app_id

# Paybis (Fiat On-Ramp)
VITE_PAYBIS_PARTNER_ID=your_paybis_partner_id
VITE_PAYBIS_SANDBOX=true|false

# Supabase (Backend)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build in development mode
npm run lint         # Run ESLint
npm run preview      # Preview production build locally
```

## Project Structure

```
src/
├── components/        # Reusable UI components
├── pages/            # Page components (Auth, Home, Market, Wallet, etc.)
├── hooks/            # Custom React hooks (wallet, auth, data fetching)
├── lib/              # Utility functions and crypto operations
├── integrations/     # Supabase client and types
├── assets/           # Static assets (images, SVGs)
└── App.tsx           # Root component with routing
```

## Key Features Explained

### Non-Custodial Architecture
Private keys are never transmitted to servers. They are encrypted client-side using WebCrypto API:
- Algorithm: AES-GCM (256-bit)
- Key Derivation: PBKDF2 (150k iterations, SHA-256)
- Storage: Browser localStorage (encrypted vault)

### Two-Layer Authentication
1. **Supabase Auth**: Email/password authentication for primary identity
2. **Privy Embedded Wallets**: Embedded wallet with one-time OTP verification

### Real-Time Updates
Supabase Realtime subscriptions provide:
- Live transaction updates
- Instant balance synchronization
- Real-time market price feeds

### Secure Transactions
Every send operation requires:
- TOTP 2FA verification
- Gas fee estimation
- Transaction confirmation

## Deployment

### Netlify

```bash
# Build the project
npm run build

# Deploy to Netlify
# Connect your GitHub repo to Netlify for automatic deployments
```

**Deployment URL**: https://usdtbanc.netlify.app

### Manual Deployment

```bash
# Build production bundle
npm run build

# Deploy the 'dist' folder to your hosting provider
```

## Security Considerations

✅ **What's Secure**
- Private keys encrypted with AES-GCM
- No keys transmitted to backend
- 2FA required for transactions
- Client-side validation and signing

⚠️ **User Responsibility**
- Keep your mnemonic seed phrase safe
- Never share your recovery phrase
- Use strong passwords
- Keep your device secure

## Contributing

Contributions are welcome! Please ensure:
- Code follows the existing style conventions
- Changes are tested locally (`npm run dev`)
- Commits are clear and descriptive

## License

This project is part of the USDTBANC platform.

## Support

For issues, feature requests, or questions, please open an issue on GitHub or contact support@usdtbanc.app

---

**Made with ❤️ for secure crypto banking**
