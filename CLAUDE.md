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
    AmericasWidget.tsx        # Stripe Onramp buy-USDT widget (USD, shows Privy wallet address to copy)
    EurozoneWidget.tsx        # Stripe Onramp buy-USDT widget (EUR, shows Privy wallet address to copy)
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

Stripe's **hosted-redirect** Crypto Onramp flow is used — the edge function mints a session and returns a `redirect_url` on Stripe's own domain (`crypto.link.com`), and the user is sent there directly (with `finish_url` set so Stripe brings them back to this app afterward). It buys USDC on the Ethereum network and delivers it to the user's Privy embedded wallet address. **The address is NOT pre-filled into the session** (see RESOLVED ISSUES #1 below — it's not actually resolved, it recurs) — `StripeWidget` shows it in a copy-to-clipboard box instead, and the user pastes it manually on Stripe's wallet screen.

HISTORY: this flow has flipped between embedded (`window.StripeOnramp` + `.mount()`, running Stripe's UI in an iframe on-site) and hosted-redirect more than once — don't re-flip it again without reading this in full.
1. Embedded, originally.
2. Switched to hosted-redirect after the embedded widget's `start_purchase` step failed with `499`.
3. That `499` was root-caused (Stripe developer support) to an invalid `first_name` in test KYC data (Stripe rejects characters outside `[A-Za-z ',.-]` but was returning a generic `499` instead of the actionable error) — unrelated to embedded vs. redirect. This was treated as a misdiagnosis and the flow was switched back to embedded.
4. Embedded then reproduced a **separate, real, recurring failure**: partway through Stripe's own hosted KYC/wallet-confirm screens (inside the iframe), confirming the wallet on the "Continue to wallet" step threw an opaque "unknown error" — consistently on the first attempt, succeeding on retry. This is Stripe's own hosted-mode UI running inside a third-party iframe, not something this codebase renders or can fix/debug directly (no error detail surfaces from inside Stripe's iframe to our console). Confirmed reproducible by multiple people, more than once.
5. **Switched back to hosted-redirect as a result (current state)** — the whole KYC/wallet-confirm flow now runs on Stripe's own full page, not embedded in our iframe, sidestepping that entire class of bug. Also incidentally removed the two blocking Stripe `<script>` tags from `index.html` entirely, since hosted-redirect never touches `window.StripeOnramp` client-side — nothing to load.

If embedded is ever reconsidered: check git history on `StripeWidget.tsx` for the embedded implementation (event-logging diagnostics were added to it right before the switch back — see commit "Log all Stripe Onramp session events for diagnosing the wallet-confirm step" — if picking embedded back up, that logging is worth restoring too), and get Stripe support to actually explain the wallet-confirm-step failure first. Don't switch back purely because embedded "looks" more polished — it failed for real, repeatedly, for real users.

KNOWN RECURRING ISSUE, currently worked around (Stripe-side bug for this account, not this codebase):
1. Pre-filling `wallet_addresses` at session creation breaks Stripe's own hosted wallet-confirm screen: clicking Continue on the pre-filled wallet throws `"Unable to register your wallet: You passed an empty string for 'wallet_address'"` from Stripe's own internal `/v1/crypto/internal/onramp_session/update` call — even though our request and the displayed address are both correct. This has been "fixed" by Stripe before (confirmed working at one point) and then regressed at least once since (confirmed broken again 2026-09-07). **Currently disabled** in the edge function (the `wallet_addresses[...]` param is commented out) — don't re-enable without confirming with Stripe support first, and expect it to regress again even if they say it's fixed.

RESOLVED ISSUES (Stripe-side bugs for this account, not this codebase — kept here for history):
1. `start_purchase` `499` — see HISTORY item 3 above.

NOTE: USDT is not enabled for this Stripe account's Crypto Onramp — confirmed against the live API, supported currencies are currently `btc, eth, matic, sol, xlm, avax, wld, usdc`. USDC was chosen as the closest stablecoin substitute; swap `DESTINATION_CURRENCY` back to `usdt` in the edge function if/when Stripe enables it for this account.

### Flow
1. `Home.tsx` auto-opens the AMERICAS widget on load (region buttons are currently commented out in favor of this)
2. The matching widget component (`AmericasWidget` / `EurozoneWidget`) reads the Privy embedded wallet address via `useWallets()` (for on-screen display only — not sent from the client)
3. It renders `<StripeWidget fromCurrency="usd|eur" />`
4. `StripeWidget` calls the Supabase Edge Function `stripe-onramp-session` with `sourceCurrency` and `returnUrl: window.location.href`, looking the destination wallet address up server-side from the `wallets` table
5. The edge function POSTs to Stripe `/v1/crypto/onramp_sessions` with `destination_currency`/`destination_network` (locked to `usdc`/`ethereum`), `source_currency`, and `finish_url` (NOT `wallet_addresses` — see KNOWN RECURRING ISSUE above), keeping the secret key server-side only, and returns both `redirect_url` and `client_secret` plus the looked-up `walletAddress` (only `redirect_url` and `walletAddress` are used currently)
6. `StripeWidget` shows the wallet address in a copy-to-clipboard box (the user pastes it manually — see above) and a "Continue to Stripe" link to `redirect_url` — clicking it navigates the user to Stripe's hosted page (`crypto.link.com`) to complete KYC and payment
7. Stripe redirects back to `finish_url` when the user finishes or abandons the flow

### Files
- `src/components/StripeWidget.tsx` — fetches the redirect URL, shows the wallet address (copy-to-clipboard) + "Continue to Stripe" link, handles loading/error states
- `src/components/AmericasWidget.tsx` — USD region, uses Privy wallet address
- `src/components/EurozoneWidget.tsx` — EUR region, uses Privy wallet address
- `supabase/functions/stripe-onramp-session/index.ts` — Deno edge function, server-side secret key holder

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
