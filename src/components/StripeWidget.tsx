import { useState, useEffect } from 'react';
import { Loader2, ExternalLink, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface StripeWidgetProps {
  /** ISO fiat currency the user pays with — 'usd' or 'eur' */
  fromCurrency?: string;
}

type Status = 'loading' | 'ready' | 'error';

/**
 * Uses Stripe's hosted-redirect Crypto Onramp flow: the edge function mints a session
 * and returns a `redirect_url` on Stripe's own domain (crypto.link.com), which we send
 * the user to directly. We deliberately don't use Stripe's embedded iframe SDK here —
 * for this account, the embedded flow's final purchase step consistently failed
 * (including in Incognito), which points to something in running Stripe's hosted-mode
 * internals inside a third-party iframe rather than a fixable client-side issue.
 *
 * The wallet address is pre-filled into the session by the edge function (previously
 * disabled due to a Stripe-side bug on their "Add a new wallet" screen — confirmed
 * fixed by Stripe, re-enabled). We still show it here with a copy button as a
 * convenience/fallback in case the user needs to paste it in manually for any reason.
 */
export default function StripeWidget({ fromCurrency = 'usd' }: StripeWidgetProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    setStatus('loading');
    setRedirectUrl(null);
    setWalletAddress(null);

    supabase.functions.invoke('stripe-onramp-session', {
      body: {
        sourceCurrency: fromCurrency,
        returnUrl: window.location.href,
      },
    }).then(({ data, error }) => {
      if (cancelled) return;

      if (error || !data?.redirectUrl) {
        console.error('[Stripe Onramp] Failed to get redirect URL', error ?? data);
        setStatus('error');
        return;
      }

      setRedirectUrl(data.redirectUrl);
      setWalletAddress(data.walletAddress ?? null);
      setStatus('ready');
    });

    return () => { cancelled = true; };
  }, [user?.id, fromCurrency, retryCount]);

  const copyAddress = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress).then(() => {
      setCopied(true);
      toast({ title: 'Address copied' });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center p-6 text-center gap-4">

      {status === 'loading' && (
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm">Initializing secure session…</p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Failed to initialize the payment session. Please try again.
          </p>
          <button
            onClick={() => setRetryCount(c => c + 1)}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {status === 'ready' && redirectUrl && (
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
          <p className="text-sm text-muted-foreground">
            You'll be securely redirected to Stripe to complete your purchase. Once finished, you'll be brought back here.
          </p>

          {walletAddress && (
            <div className="w-full space-y-1.5">
              <p className="text-xs text-muted-foreground">
                Your destination wallet address (pre-filled automatically on Stripe's page):
              </p>
              <button
                onClick={copyAddress}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-primary/20 bg-card font-mono text-xs hover:border-primary/40 transition-colors"
              >
                <span className="truncate">{walletAddress}</span>
                {copied ? (
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </button>
            </div>
          )}

          <a
            href={redirectUrl}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
          >
            Continue to Stripe <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

    </div>
  );
}
