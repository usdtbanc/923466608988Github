import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';
import { useWalletActivation } from '@/hooks/useWalletActivation';

/**
 * Blocks entry into the authenticated app until the user's Privy embedded wallet is
 * activated — shown once, immediately after Supabase login, so the wallet already
 * exists (and is already synced to the `wallets` table) by the time the user reaches
 * Home. Never shown again on this device once activated.
 *
 * Replaces the old flow where activation was only ever discoverable by manually
 * opening the Wallet page.
 */
export const WalletActivationGate = ({ children }: { children: ReactNode }) => {
  const { privyReady, privyAuthenticated, login } = useWalletActivation();

  if (!privyReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
