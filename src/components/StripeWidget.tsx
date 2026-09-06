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
 * Pulls a human-readable message out of a failed supabase.functions.invoke() call.
 * `error.context` (when present) is the raw fetch Response from the edge function, so
 * its body has to be read to get our own function's actual { error: ... } payload —
 * `error.message` alone is just a generic "non-2xx status code" string.
 */
async function extractErrorDetail(
  error: { message?: string; context?: Response } | null | undefined,
  data: unknown,
): Promise<string> {
  if (error?.context instanceof Response) {
    try {
      const body = await error.context.clone().json();
      return typeof body === 'string' ? body : JSON.stringify(body);
    } catch {
      try {
        return await error.context.clone().text();
      } catch {
        // fall through to error.message below
      }
    }
  }
  if (error?.message) return error.message;
  if (data) return typeof data === 'string' ? data : JSON.stringify(data);
  return 'Unknown error';
}

/**
 * Uses Stripe's hosted-redirect Crypto Onramp flow: the edge function mints a session
 * and returns a `redirect_url` on Stripe's own domain (crypto.link.com), which we send
 * the user to directly, with `finish_url` set so Stripe brings them back here afterward.
 *
 * We deliberately don't use Stripe's embedded iframe SDK (window.StripeOnramp) — that
 * flow kept failing partway through Stripe's own hosted KYC/wallet-confirm screens with
 * an opaque "unknown error" (reproduced repeatedly, first attempt only, succeeding on
 * retry), which points at something in running Stripe's hosted-mode internals inside a
 * third-party iframe rather than a fixable client-side issue. See git history on this
 * file for the embedded implementation if Stripe's iframe behavior is ever revisited.
 *
 * The wallet address is NOT pre-filled into the session (disabled in the edge function —
 * pre-filling makes Stripe's hosted page throw "Unable to register your wallet: You
 * passed an empty string for 'wallet_address'" when confirming it, a recurring Stripe-
 * side bug). We show it here with a copy button so the user can paste it manually
 * on Stripe's wallet screen.
 */
export default function StripeWidget({ fromCurrency = 'usd' }: StripeWidgetProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    setStatus('loading');
    setRedirectUrl(null);
    setWalletAddress(null);
    setErrorDetail(null);

    supabase.functions.invoke('stripe-onramp-session', {
      body: {
        sourceCurrency: fromCurrency,
        returnUrl: window.location.href,
      },
    }).then(async ({ data, error }) => {
      if (cancelled) return;

      if (error || !data?.redirectUrl) {
        console.error('[Stripe Onramp] Failed to get redirect URL', error ?? data);
        setErrorDetail(await extractErrorDetail(error, data));
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
          {errorDetail && (
            <p className="text-xs text-muted-foreground/70 max-w-md break-words font-mono bg-muted rounded px-3 py-2">
              {errorDetail}
            </p>
          )}
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
