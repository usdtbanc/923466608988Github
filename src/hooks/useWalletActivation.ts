import { useEffect } from 'react';
import { usePrivy, useCreateWallet } from '@privy-io/react-auth';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Owns the Privy embedded-wallet activation lifecycle: creates the wallet once the
 * user is Privy-authenticated, and keeps its on-chain address synced to the `wallets`
 * Supabase table so server-side flows (e.g. the Stripe Onramp edge function) know
 * where to deliver purchased crypto.
 *
 * Shared between `WalletActivationGate` (which runs this once, at app entry, right
 * after Supabase login) and the Wallet page (which just needs `smartAddress`).
 */
export function useWalletActivation() {
  const { user: supabaseUser } = useAuth();
  const { user, ready: privyReady, authenticated: privyAuthenticated, login } = usePrivy();
  const { createWallet } = useCreateWallet();
  const { client } = useSmartWallets();
  const smartAddress: string | undefined =
    client?.account?.address ?? user?.smartWallet?.address ?? user?.wallet?.address;

  // Auto-create embedded wallet once the user is Privy-authenticated
  useEffect(() => {
    if (!privyAuthenticated) return;
    if (!user?.wallet && !user?.smartWallet) {
      createWallet().catch(() => {/* already exists */ });
    }
  }, [privyAuthenticated, user?.wallet, user?.smartWallet]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the wallet's on-chain address in sync in the DB, so server-side flows
  // (e.g. the Stripe Onramp edge function) know where to deliver purchased crypto.
  useEffect(() => {
    if (!supabaseUser || !smartAddress) return;
    supabase
      .from('wallets')
      .upsert(
        { user_id: supabaseUser.id, address: smartAddress, currency: 'ETH', network: 'ethereum' },
        { onConflict: 'user_id,currency,network' },
      )
      .then(({ error }) => {
        if (error) console.error('Failed to sync wallet address:', error);
      });
  }, [supabaseUser, smartAddress]);

  return { privyReady, privyAuthenticated, login, smartAddress } as const;
}
