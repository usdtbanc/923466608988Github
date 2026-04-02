import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PaybisWidgetProps {
  /** ISO fiat currency the user pays with — 'USD' or 'EUR' */
  fromCurrency?: string;
  /** Privy embedded wallet address — pre-fills the receiving address in Paybis */
  toAddress?: string;
}

const PARTNER_ID = import.meta.env.VITE_PAYBIS_PARTNER_ID as string;
const SANDBOX    = import.meta.env.VITE_PAYBIS_SANDBOX === 'true';

const WIDGET_ORIGIN = SANDBOX
  ? 'https://widget.sandbox.paybis.com'
  : 'https://widget.paybis.com';

/**
 * Fetches a Paybis requestId from our Supabase Edge Function (server-side),
 * then renders the Paybis buy-crypto iframe with the correct URL parameters.
 *
 * Paybis docs: https://docs.payb.is/docs/web-direct-url-api-integration
 */
export default function PaybisWidget({ fromCurrency = 'USD', toAddress }: PaybisWidgetProps) {
  const [requestId, setRequestId] = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);
  const iframeRef                 = useRef<HTMLIFrameElement>(null);

  // Get the current Supabase user for partnerUserId + email
  const [userData, setUserData] = useState<{ id: string; email: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserData({ id: data.user.id, email: data.user.email ?? '' });
      }
    });
  }, []);

  // Fetch requestId once we have user data
  useEffect(() => {
    if (!userData) return;

    setLoading(true);
    setError(null);

    const body = {
      partnerUserId: userData.id,
      email: userData.email,
      ...(toAddress ? { cryptoAddress: toAddress } : {}),
    };

    supabase.functions
      .invoke('paybis-request', { body })
      .then(({ data, error: fnError }) => {
        if (fnError || !data?.requestId) {
          setError(fnError?.message ?? 'Failed to initialise payment widget.');
        } else {
          setRequestId(data.requestId);
        }
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [userData, toAddress]);

  // Listen to Paybis postMessage events
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.origin !== WIDGET_ORIGIN) return;
      const event = e.data?.event ?? e.data;
      if (event === 'completed') {
        // Transaction succeeded — could show a toast here
        console.log('[Paybis] payment completed', e.data);
      }
      if (event === 'rejected' || event === 'error') {
        console.warn('[Paybis] payment issue', e.data);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // ── Loading state ──────────────────────────────────────────────
  if (loading || !userData) {
    return (
      <div className="w-full min-h-[600px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <Loader2 className="w-8 h-8" />
          </motion.div>
          <p className="text-sm">Initialising payment…</p>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────
  if (error || !requestId) {
    return (
      <div className="w-full min-h-[600px] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
          <AlertCircle className="w-8 h-8 text-destructive" />
          <p className="text-sm font-medium text-destructive">Could not load payment widget</p>
          <p className="text-xs text-muted-foreground">{error ?? 'Unknown error'}</p>
          {SANDBOX && (
            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded p-2">
              Running in sandbox mode — make sure <code>PAYBIS_API_KEY</code> is set in your Supabase Edge Function secrets.
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Widget URL ─────────────────────────────────────────────────
  const params = new URLSearchParams({
    requestId,
    partnerId:        PARTNER_ID,
    currencyCodeFrom: fromCurrency,
    currencyCodeTo:   'USDT',
    transactionFlow:  'buyCrypto',
    layout:           'embed',
  });
  if (toAddress) params.set('cryptoAddress', toAddress);

  const src = `${WIDGET_ORIGIN}/?${params.toString()}`;

  return (
    <div className="w-full h-full min-h-[600px] flex flex-col">
      <iframe
        ref={iframeRef}
        src={src}
        title="Paybis – Buy USDT on Polygon"
        allow="camera; microphone; payment; clipboard-write"
        className="w-full flex-1 border-0"
        style={{ minHeight: '600px' }}
      />
    </div>
  );
}
