# USDTBANC — Project Guide for Claude

## Project Overview

A non-custodial crypto banking web app built with React + Vite + TypeScript + Supabase. Users can manage multi-chain wallets (EVM, Solana, XRP, Bitcoin), view live market data, and perform transactions. All private keys/mnemonics are encrypted client-side and stored in localStorage — never sent to the server.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite (SWC) |
| Language | TypeScript 5 |
| Routing | react-router-dom v6 |
| Server state | @tanstack/react-query (staleTime 5min, no refetchOnWindowFocus) |
| Backend / DB | Supabase (Postgres + Auth + Realtime + Edge Functions) |
| Embedded wallets | Privy (`@privy-io/react-auth`) — wraps the whole app at `main.tsx` |
| Fiat on-ramp | Paybis iframe widget + Supabase Edge Function (`paybis-request`) |
| Styling | Tailwind CSS v3 + CSS variables + tailwindcss-animate |
| UI primitives | shadcn/ui (all Radix UI components) |
| Animation | framer-motion |
| Forms | react-hook-form + @hookform/resolvers + zod |
| Notifications | sonner + shadcn/ui toaster |
| Crypto chains | ethers (EVM), @solana/web3.js, xrpl, bitcoinjs-lib + bip32/bip39 |
| 2FA | otplib (TOTP) |
| PDF | jspdf |

---

## Directory Structure

```
src/
  App.tsx                     # Root: QueryClientProvider, router, dual auth guard (Supabase + Privy)
  main.tsx                    # Entry point — PrivyProvider wraps everything here
  assets/                     # Static assets (SVGs, images)
  components/
    Layout.tsx                # App shell: sidebar nav, header, WhatsApp support float
    AmericasWidget.tsx        # Paybis buy-USDT iframe (USD, Privy wallet address pre-filled)
    EurozoneWidget.tsx        # Paybis buy-USDT iframe (EUR, Privy wallet address pre-filled)
    PaybisWidget.tsx          # Core Paybis iframe component — fetches requestId from edge fn
    WalletSetup.tsx           # One-time Privy OTP gate shown after Supabase login
    TwoFactorVerifyModal.tsx  # 2FA modal (TOTP)
    ui/                       # shadcn/ui components (do not hand-edit)
  hooks/
    useAuth.ts                # Supabase auth session + isAuthenticated
    useTransactions.ts        # Supabase transactions table + Realtime subscription
    useCryptoData.ts          # Market/price data
    useCoinGecko.ts           # CoinGecko API integration
    useEvmWallet.ts           # EVM wallet state (multi-chain, vault-based)
    useBtcWallet.ts           # Bitcoin wallet state
    useSolWallet.ts           # Solana wallet state
    useXrpWallet.ts           # XRP wallet state
    use-mobile.tsx            # Responsive breakpoint hook
    use-toast.ts              # Toast hook (shadcn)
  integrations/supabase/
    client.ts                 # Typed supabase client (auto-generated, don't edit)
    types.ts                  # Database types (auto-generated, don't edit)
  lib/
    chain/
      types.ts                # EvmChainKey, ChainConfig, EVM_CHAINS config, EvmAdapter interface
      evmAdapter.ts           # ethers-based EVM adapter implementation
    crypto/
      vault.ts                # WebCrypto AES-GCM vault (PBKDF2 key derivation, localStorage)
    utils.ts                  # cn() utility (clsx + tailwind-merge)
  pages/
    Auth.tsx Home.tsx Market.tsx Wallet.tsx Profile.tsx
    About.tsx Terms.tsx Privacy.tsx NotFound.tsx Index.tsx

supabase/functions/
  paybis-request/index.ts    # Deno edge function — calls Paybis /v2/request server-side
```

---

## Authentication — Two-Layer System

The app uses **two auth systems in parallel**; both must be satisfied before the user enters the app.

### 1. Supabase Auth (primary identity)
- **Provider:** email/password
- **Hook:** `useAuth` — exposes `{ user, session, loading, signOut, isAuthenticated }`
- **Session:** persisted in localStorage, auto-refreshed via Supabase client config

### 2. Privy (embedded wallet)
- **Package:** `@privy-io/react-auth`
- **Provider:** `<PrivyProvider>` wraps the entire app in `main.tsx`
- **Config:** `loginMethods: ['email', 'wallet']`, dark theme, `embeddedWallets: { createOnLogin: 'users-without-wallets' }`
- **Key hooks:**
  - `usePrivy()` → `{ ready, authenticated }` — `ready` means SDK initialized, `authenticated` means Privy session exists
  - `useWallets()` → `wallets[]` — access embedded wallet via `wallets.find(w => w.walletClientType === 'privy')`
  - `useLoginWithEmail()` → `{ sendCode, loginWithCode }` — used in `WalletSetup`

### Auth flow (`AppRoutes` in `App.tsx`)
```
loading || !privyReady  →  <LoadingScreen />
!isAuthenticated        →  <Auth />              (Supabase login)
!privyAuthenticated     →  <WalletSetup />       (one-time Privy OTP gate)
both authenticated      →  <Layout /> + routes
```

`WalletSetup` auto-sends an OTP to the user's email via `sendCode`, user enters it, `loginWithCode` creates the Privy embedded wallet. This only happens once per device.

### Env vars required
```
VITE_PRIVY_APP_ID=...
```

---

## Database (Supabase)

Tables:
- `profiles` — `user_id`, `full_name`, `first_name`, `last_name`, `phone_number`, `country_code`, `user_id_display`, `withdrawal_password_hash`
- `transactions` — `user_id`, `type`, `crypto_type`, `amount`, `status`, `timestamp`
- `wallet_transactions` — on-chain tx records: `chain`, `currency`, `direction`, `tx_hash`, `from_address`, `to_address`, `amount`, `status`, `confirmations`, `metadata`
- `exchange_rates` — `from_currency`, `to_currency`, `rate`

Realtime is used in `useTransactions` — subscribes to `postgres_changes` on `transactions` filtered by `user_id`.

Always import supabase via:
```ts
import { supabase } from "@/integrations/supabase/client";
```

---

## Paybis Fiat On-Ramp

Paybis is a buy-crypto iframe widget embedded in the Home page for two regions.

### Flow
1. User clicks **AMERICAS** or **EUROZONE** on `Home.tsx`
2. The matching widget component (`AmericasWidget` / `EurozoneWidget`) reads the Privy embedded wallet address via `useWallets()`
3. It renders `<PaybisWidget fromCurrency="USD|EUR" toAddress={privyAddress} />`
4. `PaybisWidget` calls the Supabase Edge Function `paybis-request` (server-side) to get a `requestId`
5. The edge function POSTs to Paybis `/v2/request` with `partnerUserId`, `email`, `cryptoWalletAddress`, keeping the API key secret
6. The iframe is rendered at `https://widget[.sandbox].paybis.com/?requestId=...&partnerId=...`
7. `window.postMessage` events (`completed`, `rejected`, `error`) are listened to from the iframe

### Files
- `src/components/PaybisWidget.tsx` — iframe component, handles loading/error states
- `src/components/AmericasWidget.tsx` — USD region, uses Privy wallet address
- `src/components/EurozoneWidget.tsx` — EUR region, uses Privy wallet address
- `supabase/functions/paybis-request/index.ts` — Deno edge function, server-side API key holder

### Env vars required
```
VITE_PAYBIS_PARTNER_ID=...     # Public partner ID (frontend)
VITE_PAYBIS_SANDBOX=true|false # Toggle sandbox mode (frontend)
PAYBIS_API_KEY=...             # Secret API key (Supabase edge function secret only)
PAYBIS_SANDBOX=true|false      # Edge function sandbox toggle
```

---

## Wallet / Crypto Architecture

**Non-custodial design:** mnemonics are never sent to the server.

- `src/lib/crypto/vault.ts` — encrypts mnemonic with AES-GCM (WebCrypto), PBKDF2 key derivation (150k iterations, SHA-256), stores as `{ salt, iv, data }` in localStorage at key `usdtbanc:vault:{chain}`
- Each chain hook (`useEvmWallet`, `useBtcWallet`, `useSolWallet`, `useXrpWallet`) manages: vault state, address derivation, balance fetch, send with 2FA check
- **2FA (TOTP):** `otplib` authenticator; secret stored in localStorage at `usdtbanc:totp:secret`; required for every send
- EVM supports: `ethereum` (chainId 1), `bsc` (chainId 56), `polygon` (chainId 137)
- EVM adapter uses public RPC endpoints (Cloudflare, Binance, Polygon public)

---

## Routing

All routes are nested under `<Layout />` (which renders `<Outlet />`):

```
/          → Home
/market    → Market
/wallet    → Wallet
/profile   → Profile
/about     → About
/terms     → Terms
/privacy   → Privacy
*          → NotFound
```

---

## Styling Conventions

- **Tailwind CSS** with CSS variables for theming (`hsl(var(--primary))`, etc.)
- Dark mode via `darkMode: ["class"]`
- Colors: `primary`, `secondary`, `muted`, `accent`, `card`, `border`, `destructive` — all CSS variable–driven
- Font: Inter / Space Grotesk (`font-sans`, `font-futuristic`)
- Use `cn()` from `@/lib/utils` for conditional classNames
- Responsive breakpoints: mobile-first; sidebar is fixed + animated on mobile, static at `xl:`
- Custom animations: `glow-effect`, `hover-scale`, `pulse` utility classes in CSS

---

## Component Conventions

- Named exports for all components (not default, except pages)
- Pages in `src/pages/`, reusable components in `src/components/`
- UI primitives from `src/components/ui/` (shadcn) — do not modify these directly
- Path alias `@/` maps to `src/`
- Hooks in `src/hooks/` — one concern per hook file
- Hook return shape for wallet hooks: `{ state: {...}, actions: {...} } as const`

---

## Key Patterns

- **Data fetching:** Prefer custom hooks with Supabase directly over TanStack Query for user-specific data; use TanStack Query for market/price data
- **Error handling:** `console.error` + re-throw or return null — no global error boundary
- **Types:** Inline interfaces in hook files; shared types in `src/lib/chain/types.ts`; DB types auto-generated in `src/integrations/supabase/types.ts`
- **No Redux/Zustand** — local state + custom hooks only
- **No server-side rendering** — pure SPA (Vite)
- **QueryClient config:** `staleTime: 300000`, `gcTime: 600000`, `refetchOnWindowFocus: false`, `retry: 1`

---

## Dev Commands

```bash
npm run dev        # Start dev server (port 8080)
npm run build      # Production build
npm run build:dev  # Dev-mode build
npm run lint       # ESLint
npm run preview    # Preview production build
```
