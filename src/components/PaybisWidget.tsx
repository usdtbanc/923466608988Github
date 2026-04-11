import { useEffect, useRef } from 'react';

interface PaybisWidgetProps {
  /** ISO fiat currency the user pays with — 'USD' or 'EUR' */
  fromCurrency?: string;
  /** Privy embedded wallet address — pre-fills the receiving address in Paybis */
  toAddress?: string;
}

const PARTNER_ID   = import.meta.env.VITE_PAYBIS_PARTNER_ID as string;
const SANDBOX      = import.meta.env.VITE_PAYBIS_SANDBOX === 'true';
const WIDGET_ORIGIN = SANDBOX
  ? 'https://widget.sandbox.paybis.com'
  : 'https://widget.paybis.com';

export default function PaybisWidget({ fromCurrency = 'USD', toAddress }: PaybisWidgetProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen to Paybis postMessage events
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

  const params = new URLSearchParams({
    partnerId:        PARTNER_ID,
    currencyCodeFrom: fromCurrency,
    currencyCodeTo:   'USDT-TRC20-SHASTA',
    flow:             'buyCrypto',
    layout:           'embed',
    // cryptoAddress: 'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs'
  });
  if (toAddress) params.set('cryptoAddress', 'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs');

  const src = `${WIDGET_ORIGIN}/?${params.toString()}`;

  return (
    <div className="w-full h-full min-h-[600px] flex flex-col">
      <iframe
        ref={iframeRef}
        src={src}
        title="Paybis – Buy USDT"
        allow="camera; microphone; payment; clipboard-write"
        className="w-full flex-1 border-0"
        style={{ minHeight: '600px' }}
      />
    </div>
  );
}
