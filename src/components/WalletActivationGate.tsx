import { ReactNode, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, AlertTriangle } from 'lucide-react';
import { useWalletActivation } from '@/hooks/useWalletActivation';

// How long to wait for createWallet()/the address-sync effect to finish before giving
// up on the silent spinner and offering the user a way to retry.
const WALLET_SETUP_TIMEOUT_MS = 15000;

/**
 * Blocks entry into the authenticated app until the user's Privy embedded wallet is
 * activated AND its address has finished syncing to the `wallets` table — shown once,
 * immediately after Supabase login, so the wallet is fully ready by the time the user
 * reaches Home. Never shown again on this device once activated.
 *
 * Replaces the old flow where activation was only ever discoverable by manually
 * opening the Wallet page.
 */
export const WalletActivationGate = ({ children }: { children: ReactNode }) => {
  const { privyReady, privyAuthenticated, login, smartAddress, retryWalletCreation } = useWalletActivation();
  const [timedOut, setTimedOut] = useState(false);

  // privyAuthenticated can flip true before createWallet()/the address-sync effect in
  // useWalletActivation has actually finished. Without this, a user could slip through to
  // Home (and the Stripe buy flow) with no address ever written to the `wallets` table —
  // which is exactly what surfaces as Stripe's "Failed to initialize the payment widget."
  useEffect(() => {
    if (!privyAuthenticated || smartAddress) {
      setTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setTimedOut(true), WALLET_SETUP_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [privyAuthenticated, smartAddress]);

  if (!privyReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (privyAuthenticated && !smartAddress) {
    if (timedOut) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Wallet setup is taking longer than expected</h3>
                  <p className="text-sm text-muted-foreground">
                    We couldn't finish setting up your wallet. Please retry — this won't create a duplicate wallet.
                  </p>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                  onClick={() => {
                    setTimedOut(false);
                    retryWalletCreation();
                  }}
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Setting up your wallet…</p>
        </div>
      </div>
    );
  }

  if (!privyAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-primary to-secondary p-0.5">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                  <QrCode className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Activate Your Wallet</h3>
                <p className="text-sm text-muted-foreground">
                  Connect or create your on-chain wallet to send, receive, and buy crypto.
                  This is a one-time setup — you won't be asked again on this device.
                </p>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                onClick={() => login()}
              >
                Activate Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
