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
| Fiat on-ramp | Stripe Crypto Onramp embedded widget + Supabase Edge Function (`stripe-onramp-session`) |
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
    AmericasWidget.tsx        # Stripe Onramp buy-USDT widget (USD, Privy wallet address pre-filled)
    EurozoneWidget.tsx        # Stripe Onramp buy-USDT widget (EUR, Privy wallet address pre-filled)
    StripeWidget.tsx          # Core Stripe Onramp widget — mounts session from edge fn's client secret
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
  stripe-onramp-session/index.ts  # Deno edge function — calls Stripe /v1/crypto/onramp_sessions server-side
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

## Stripe Fiat On-Ramp (Crypto Onramp)

Stripe's hosted-redirect Crypto Onramp is linked from the Home page for two regions. It buys USDC on the Ethereum network and delivers it to the user's Privy embedded wallet address.

USES THE HOSTED REDIRECT FLOW, NOT THE EMBEDDED IFRAME SDK. The embedded flow (Stripe's `.mount()` iframe approach) was tried first but its final purchase step (`start_purchase`) consistently failed for this Stripe account — including in Incognito with no extensions — pointing to something in running Stripe's hosted-mode internals inside a third-party iframe. Switched to sending the user to Stripe's own hosted page (`redirect_url`) instead, which uses the exact same session-creation call, just without the iframe.

CONFIRMED WORKING END-TO-END (full sandbox test purchase completed successfully — payment confirmed, USDC delivered to wallet, receipt emailed, wallet address pre-fill working).

RESOLVED ISSUES (both were Stripe-side bugs for this account, not this codebase — kept here for history):
1. Pre-filling `wallet_addresses` at session creation used to break Stripe's own "Add a new wallet" screen with `"You passed an empty string for 'wallet_address'"`, even though the UI displayed the address correctly as valid. Worked around at the time by NOT pre-filling it (`StripeWidget` showed a copy-to-clipboard box instead). Stripe fixed this — pre-fill is re-enabled and confirmed working again.
2. `start_purchase` (an internal Stripe endpoint, not something we call directly) used to fail with `499` on every attempt. ROOT CAUSE (confirmed by Stripe developer support): Stripe rejects `first_name` values containing characters outside `[A-Za-z ',.-]` with `"invalid first_name format"`, but was silently returning a generic `499` instead of that actionable error. Not a bug in this codebase — we don't send `first_name` at all (KYC is entered directly in Stripe's hosted UI). Just make sure names entered during KYC only use Latin letters, spaces, `'`, `-`, or `.`.

NOTE: USDT is not enabled for this Stripe account's Crypto Onramp — confirmed against the live API, supported currencies are currently `btc, eth, matic, sol, xlm, avax, wld, usdc`. USDC was chosen as the closest stablecoin substitute; swap `DESTINATION_CURRENCY` back to `usdt` in the edge function if/when Stripe enables it for this account.

### Flow
1. User clicks **AMERICAS** or **EUROZONE** on `Home.tsx`
2. The matching widget component (`AmericasWidget` / `EurozoneWidget`) reads the Privy embedded wallet address via `useWallets()`
3. It renders `<StripeWidget fromCurrency="usd|eur" />`
4. `StripeWidget` calls the Supabase Edge Function `stripe-onramp-session` (server-side) to get a `redirect_url`, passing `returnUrl: window.location.href` so Stripe brings the user back here when done. The edge function looks the destination wallet address up server-side from the `wallets` table
5. The edge function POSTs to Stripe `/v1/crypto/onramp_sessions` with `wallet_addresses`, `destination_currency`/`destination_network` (locked to `usdc`/`ethereum`), `source_currency`, and `finish_url` (the return URL), keeping the secret key server-side only
6. `StripeWidget` renders a "Continue to Stripe" link/button pointing at the returned `redirect_url` (`https://crypto.link.com?session_hash=...`) — clicking it navigates the whole page there; no client-side Stripe SDK or `<script>` tags are needed for this flow

### Files
- `src/components/StripeWidget.tsx` — fetches the redirect URL, renders the "Continue to Stripe" link, handles loading/error states
- `src/components/AmericasWidget.tsx` — USD region, uses Privy wallet address
- `src/components/EurozoneWidget.tsx` — EUR region, uses Privy wallet address
- `supabase/functions/stripe-onramp-session/index.ts` — Deno edge function, server-side secret key holder

### Env vars required
```
STRIPE_SECRET_KEY=... # Secret key, sk_test_/sk_live_ (Supabase edge function secret only)
```
`VITE_STRIPE_PUBLISHABLE_KEY` is NOT needed for this flow (only the embedded-SDK approach would need it) — safe to leave unset. Test vs. live mode is determined purely by which key prefix you use — there is no separate sandbox toggle, unlike the old Paybis setup.

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
