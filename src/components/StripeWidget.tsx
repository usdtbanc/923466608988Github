import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface StripeWidgetProps {
  /** ISO fiat currency the user pays with — 'usd' or 'eur' */
  fromCurrency?: string;
}

type Status = 'loading' | 'ready' | 'error';

// The Stripe Onramp script (loaded in index.html) exposes this global.
declare global {
  interface Window {
    StripeOnramp?: (publishableKey: string) => {
      createSession: (opts: { clientSecret: string }) => {
        mount: (el: HTMLElement) => void;
        addEventListener: (type: string, cb: (e: { payload: { session: { status: string } } }) => void) => void;
      };
    };
  }
}

const PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

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

/** Waits for the async Stripe Onramp script (index.html) to attach window.StripeOnramp. */
function waitForStripeOnramp(timeoutMs = 10000): Promise<NonNullable<Window['StripeOnramp']>> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const poll = () => {
      if (window.StripeOnramp) return resolve(window.StripeOnramp);
      if (Date.now() - start > timeoutMs) return reject(new Error('Stripe Onramp script failed to load'));
      setTimeout(poll, 100);
    };
    poll();
  });
}

/**
 * Uses Stripe's embedded Crypto Onramp widget (window.StripeOnramp, loaded via <script>
 * tags in index.html) — the session's client_secret is used to mount Stripe's UI directly
 * into this page, so the purchase flow never leaves the site. The wallet address is
 * pre-filled by the edge function (confirmed working after a Stripe-side fix).
 */
export default function StripeWidget({ fromCurrency = 'usd' }: StripeWidgetProps) {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  // Fetch a fresh client secret from Stripe via the edge function
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    setStatus('loading');
    setClientSecret(null);
    setErrorDetail(null);

    supabase.functions.invoke('stripe-onramp-session', {
      body: { sourceCurrency: fromCurrency },
    }).then(async ({ data, error }) => {
      if (cancelled) return;

      if (error || !data?.clientSecret) {
        console.error('[Stripe Onramp] Failed to get client secret', error ?? data);
        setErrorDetail(await extractErrorDetail(error, data));
        setStatus('error');
        return;
      }

      setClientSecret(data.clientSecret);
    });

    return () => { cancelled = true; };
  }, [user?.id, fromCurrency, retryCount]);

  // Mount the Stripe Onramp embedded widget once we have a client secret
  useEffect(() => {
    if (!clientSecret || !containerRef.current) return;
    if (!PUBLISHABLE_KEY) {
      console.error('[Stripe Onramp] Missing VITE_STRIPE_PUBLISHABLE_KEY');
      setErrorDetail('Missing VITE_STRIPE_PUBLISHABLE_KEY — not set in this build environment.');
      setStatus('error');
      return;
    }

    let cancelled = false;
    const container = containerRef.current;
    container.innerHTML = '';

    waitForStripeOnramp()
      .then((StripeOnramp) => {
        if (cancelled) return;
        const stripeOnramp = StripeOnramp(PUBLISHABLE_KEY);
        const session = stripeOnramp.createSession({ clientSecret });
        session.addEventListener('onramp_session_updated', (e) => {
          const onrampStatus = e.payload.session.status;
          if (onrampStatus === 'fulfillment_complete') {
            console.log('[Stripe Onramp] purchase fulfilled', e.payload.session);
          }
          if (onrampStatus === 'rejected') {
            console.warn('[Stripe Onramp] session rejected', e.payload.session);
          }
        });
        session.mount(container);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[Stripe Onramp]', err);
        setErrorDetail(err?.message ?? String(err));
        setStatus('error');
      });

    return () => { cancelled = true; };
  }, [clientSecret]);

  return (
    <div className="w-full h-full min-h-[600px] flex flex-col">

      {status === 'loading' && (
        <div className="flex-1 flex items-center justify-center min-h-[600px]">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm">Initializing secure session…</p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="flex-1 flex items-center justify-center min-h-[600px]">
          <div className="flex flex-col items-center gap-4 text-center p-6">
            <p className="text-sm text-muted-foreground">
              Failed to initialize the payment widget. Please try again.
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
        </div>
      )}

      {/* Stripe mounts its own iframe into this container once the session is ready */}
      <div
        ref={containerRef}
        className="w-full flex-1"
        style={{ minHeight: '600px', display: status === 'ready' ? 'block' : 'none' }}
      />

    </div>
  );
}
