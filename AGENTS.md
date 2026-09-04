# USDTBANC — Project Guide for Codex

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
    WalletActivationGate.tsx  # Blocks entry into the app until the Privy wallet is activated
    TwoFactorVerifyModal.tsx  # 2FA modal (TOTP)
    ui/                       # shadcn/ui components (do not hand-edit)
  hooks/
    useAuth.ts                # Supabase auth session + isAuthenticated
    useWalletActivation.ts    # Privy activation lifecycle: login state, createWallet, DB address sync
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
  - `usePrivy()` → `{ ready, authenticated, login }` — `ready` means SDK initialized, `authenticated` means Privy session exists, `login()` opens Privy's own login modal
  - `useCreateWallet()` / `useSmartWallets()` — wallet creation + smart-account address, wrapped by `useWalletActivation`
  - Both consumed via the shared `useWalletActivation` hook (`src/hooks/useWalletActivation.ts`) — do not call these directly in a page; use the hook so activation logic stays in one place

### Auth flow (`AppRoutes` in `App.tsx`)
```
loading                 →  <LoadingScreen />
!isAuthenticated        →  <Auth />                  (Supabase login)
isAuthenticated         →  <WalletActivationGate>     (blocks until Privy wallet activated)
                              !privyReady    → spinner
                              !privyAuthenticated → "Activate Your Wallet" card (calls Privy's login())
                              both ready     → renders children
                            <Layout /> + routes
                           </WalletActivationGate>
```

`WalletActivationGate` runs once, immediately after Supabase login, **before** the user ever sees Home — this is what makes wallet activation "seamless": the user is never expected to discover it by manually opening the Wallet page. Once `useWalletActivation`'s effects fire (`createWallet()` if no wallet exists yet, then syncing the resulting address to the `wallets` table), the gate never shows again on that device, and `Wallet.tsx` reuses the same hook purely to read `smartAddress` — it no longer duplicates any activation logic itself.

HISTORY: there used to be a `WalletSetup.tsx` component intended to do this (a custom email-OTP screen), but it was never actually wired into `App.tsx` — dead code that looked load-bearing but wasn't. The real activation trigger lived only inside `Wallet.tsx` (an "Activate Wallet" button, calling Privy's native `login()`), meaning a user could reach Home and even attempt a Stripe purchase before ever creating a wallet. `WalletSetup.tsx` has been deleted; the fix moves that same proven `Wallet.tsx` logic up to `WalletActivationGate` instead of resurrecting the old broken component.

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

Stripe's embedded Crypto Onramp widget (`window.StripeOnramp` + `.mount()`) is embedded directly into the Home page for two regions — the purchase flow stays on-site, no redirect to a separate page. It buys USDC on the Ethereum network and delivers it to the user's Privy embedded wallet address.

HISTORY / MISDIAGNOSIS NOTE: this was briefly switched to a hosted-redirect flow (sending the user to `crypto.link.com`) after the embedded widget's `start_purchase` step failed with `499`. That was a misdiagnosis — the failure was actually caused by an invalid `first_name` in the test KYC data (see below), unrelated to embedded vs. redirect. Once that was fixed, the embedded widget was confirmed to work and is the flow in use — kept on-site as originally intended, matching Stripe's documented embedded integration.

CONFIRMED WORKING END-TO-END (full sandbox test purchase completed successfully via the hosted-redirect flow — payment confirmed, USDC delivered to wallet, receipt emailed, wallet address pre-fill working. Re-verify after reverting to embedded, since embedded wasn't re-tested post-fix as of this note).

RESOLVED ISSUES (both were Stripe-side bugs for this account, not this codebase — kept here for history):
1. Pre-filling `wallet_addresses` at session creation used to break Stripe's own "Add a new wallet" screen with `"You passed an empty string for 'wallet_address'"`, even though the UI displayed the address correctly as valid. Worked around at the time by NOT pre-filling it (`StripeWidget` showed a copy-to-clipboard box instead). Stripe fixed this — pre-fill is re-enabled and confirmed working again.
2. `start_purchase` (an internal Stripe endpoint, not something we call directly) used to fail with `499` on every attempt. ROOT CAUSE (confirmed by Stripe developer support): Stripe rejects `first_name` values containing characters outside `[A-Za-z ',.-]` with `"invalid first_name format"`, but was silently returning a generic `499` instead of that actionable error. Not a bug in this codebase — we don't send `first_name` at all (KYC is entered directly in Stripe's hosted UI). Just make sure names entered during KYC only use Latin letters, spaces, `'`, `-`, or `.`.

NOTE: USDT is not enabled for this Stripe account's Crypto Onramp — confirmed against the live API, supported currencies are currently `btc, eth, matic, sol, xlm, avax, wld, usdc`. USDC was chosen as the closest stablecoin substitute; swap `DESTINATION_CURRENCY` back to `usdt` in the edge function if/when Stripe enables it for this account.

### Flow
1. User clicks **AMERICAS** or **EUROZONE** on `Home.tsx`
2. The matching widget component (`AmericasWidget` / `EurozoneWidget`) reads the Privy embedded wallet address via `useWallets()`
3. It renders `<StripeWidget fromCurrency="usd|eur" />`
4. `StripeWidget` calls the Supabase Edge Function `stripe-onramp-session` (server-side) to get a `client_secret`, looking the destination wallet address up server-side from the `wallets` table
5. The edge function POSTs to Stripe `/v1/crypto/onramp_sessions` with `wallet_addresses`, `destination_currency`/`destination_network` (locked to `usdc`/`ethereum`), and `source_currency`, keeping the secret key server-side only
6. The Stripe Onramp JS SDK (`window.StripeOnramp`, loaded via `<script>` tags in `index.html` — see PCI compliance note there) creates a session from the `client_secret` and mounts it into a container div; Stripe manages its own iframe internally
7. `session.addEventListener('onramp_session_updated', ...)` is used to observe status transitions (`fulfillment_complete`, `rejected`, etc.)

### Files
- `src/components/StripeWidget.tsx` — mounts the Stripe Onramp embedded widget, handles loading/error states
- `src/components/AmericasWidget.tsx` — USD region, uses Privy wallet address
- `src/components/EurozoneWidget.tsx` — EUR region, uses Privy wallet address
- `supabase/functions/stripe-onramp-session/index.ts` — Deno edge function, server-side secret key holder
- `index.html` — loads the required Stripe onramp `<script>` tags (must load directly from Stripe's domains, never bundled)

### Env vars required
```
VITE_STRIPE_PUBLISHABLE_KEY=... # Publishable key, pk_test_/pk_live_ (frontend)
STRIPE_SECRET_KEY=...           # Secret key, sk_test_/sk_live_ (Supabase edge function secret only)
```
Test vs. live mode is determined purely by which key prefix you use — there is no separate sandbox toggle, unlike the old Paybis setup.

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
