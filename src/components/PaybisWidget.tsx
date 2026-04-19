import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PaybisWidgetProps {
  /** ISO fiat currency the user pays with — 'USD' or 'EUR' */
  fromCurrency?: string;
}

const SANDBOX       = import.meta.env.VITE_PAYBIS_SANDBOX === 'true';
const WIDGET_ORIGIN = SANDBOX
  ? 'https://widget.sandbox.paybis.com'
  : 'https://widget.paybis.com';
const CRYPTO_CODE   = SANDBOX ? 'USDT-TRC20-SHASTA' : 'USDT-TRC20';

type Status = 'loading' | 'ready' | 'error';

export default function PaybisWidget({ fromCurrency = 'USD' }: PaybisWidgetProps) {
  const { user } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [status, setStatus]       = useState<Status>('loading');
  const [retryCount, setRetryCount] = useState(0);

  // Fetch a fresh requestId from the Paybis API via the edge function
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    setStatus('loading');
    setRequestId(null);

    supabase.functions.invoke('paybis-request', {
      body: {
        currencyCodeFrom: fromCurrency,
        currencyCode:     CRYPTO_CODE,
      },
    }).then(({ data, error }) => {
      if (cancelled) return;

      if (error || !data?.requestId) {
        console.error('[Paybis] Failed to get requestId', error ?? data);
        setStatus('error');
        return;
      }

      setRequestId(data.requestId);
      setStatus('ready');
    });

    return () => { cancelled = true; };
  }, [user?.id, fromCurrency, retryCount]);

  // Listen to Paybis postMessage events from the widget iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.origin !== WIDGET_ORIGIN) return;
      const event = e.data?.event ?? e.data;
      if (event === 'completed') {
        console.log('[Paybis] payment completed', e.data);
      }
      if (event === 'rejected' || event === 'error') {
        console.warn('[Paybis] payment issue', e.data);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const src = requestId ? `${WIDGET_ORIGIN}/?requestId=${requestId}&layout=embed` : null;

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
            <button
              onClick={() => setRetryCount(c => c + 1)}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {status === 'ready' && src && (
        <iframe
          ref={iframeRef}
          src={src}
          title="Paybis – Buy USDT"
          allow="camera; microphone; payment; clipboard-write"
          className="w-full flex-1 border-0"
          style={{ minHeight: '600px' }}
        />
      )}

    </div>
  );
}
