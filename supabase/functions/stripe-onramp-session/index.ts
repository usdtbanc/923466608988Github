import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = new Set([
  'http://localhost:8080',
  'https://usdtbanc.com',
  'https://www.usdtbanc.com',
  'https://usdtnexus.netlify.app',
  'https://paybis-v3.netlify.app',
  'https://paybis-v3-integration.netlify.app',
]);

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : '';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

// Locked to a single destination-currency/network pair, mirroring the previous Paybis
// integration's behavior. NOTE: USDT is NOT enabled for this Stripe account's Crypto
// Onramp (confirmed against the live API — supported currencies are currently
// btc, eth, matic, sol, xlm, avax, wld, usdc). USDC is the closest stablecoin
// substitute; swap this back to 'usdt' if/when Stripe enables it for this account.
const DESTINATION_CURRENCY = 'usdc';
const DESTINATION_NETWORK = 'ethereum';

serve(async (req) => {
  const origin = req.headers.get('origin');
  const CORS = corsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const { sourceCurrency = 'usd', returnUrl } = await req.json().catch(() => ({}));

    const authHeader = req.headers.get('Authorization') ?? '';
    const jwt = authHeader.replace(/^Bearer\s+/i, '');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      return new Response(JSON.stringify({ error: 'Stripe secret key not configured' }), {
        status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const { data: walletRow } = await supabase
      .from('wallets')
      .select('address')
      .eq('user_id', user.id)
      .eq('currency', 'ETH')
      .eq('network', 'ethereum')
      .single();

    const cryptoAddress = walletRow?.address ?? null;

    const userIp =
      req.headers.get('x-real-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      undefined;

    const params = new URLSearchParams();
    params.set('source_currency', sourceCurrency);
    params.set('destination_currency', DESTINATION_CURRENCY);
    params.set('destination_network', DESTINATION_NETWORK);
    params.append('destination_currencies[]', DESTINATION_CURRENCY);
    params.append('destination_networks[]', DESTINATION_NETWORK);
    // RE-ENABLED FOR RETEST (previously confirmed broken — Stripe's "Add a new wallet"
    // screen threw "You passed an empty string for 'wallet_address'" even with a
    // correctly-formatted, correctly-displayed address). If this bug resurfaces, revert
    // to leaving this disabled and rely on StripeWidget's copy-to-clipboard fallback.
    if (cryptoAddress) {
      params.set(`wallet_addresses[${DESTINATION_NETWORK}]`, cryptoAddress);
    }
    if (userIp) {
      params.set('customer_ip_address', userIp);
    }
    if (returnUrl) {
      // Brings the user back to the app after they finish (or abandon) the purchase
      // on Stripe's hosted page.
      params.set('finish_url', returnUrl);
    }
    // NOTE: Stripe supports pre-populating KYC details (email, name, DOB, address) via a
    // `kyc_details` object — left unset here since the exact nested field names weren't
    // confirmed against the current API version. See docs.stripe.com/crypto/using-the-api.

    const res = await fetch('https://api.stripe.com/v1/crypto/onramp_sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: res.status, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    // Returns both client_secret (for the embedded iframe SDK) and redirect_url (hosted
    // fallback) from the same session — see StripeWidget.tsx for which one is active.
    return new Response(JSON.stringify({
      clientSecret: data.client_secret,
      redirectUrl: data.redirect_url,
      walletAddress: cryptoAddress,
    }), {
      status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
