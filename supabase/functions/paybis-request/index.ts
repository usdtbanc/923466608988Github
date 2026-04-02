import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Supabase Edge Function: POST /functions/v1/paybis-request
 *
 * Calls the Paybis /v2/request API server-side (keeps API key secret)
 * and returns the requestId to the frontend.
 *
 * Body: { partnerUserId: string, email: string, cryptoAddress?: string, locale?: string }
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const { partnerUserId, email, cryptoAddress, locale = 'en' } = await req.json();

    const apiKey  = Deno.env.get('PAYBIS_API_KEY');
    const sandbox = Deno.env.get('PAYBIS_SANDBOX') === 'true';
    const baseUrl = sandbox
      ? 'https://widget-api.sandbox.paybis.com'
      : 'https://widget-api.paybis.com';

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'PAYBIS_API_KEY not set' }), {
        status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const body: Record<string, unknown> = {
      partnerUserId,
      flow: 'buyCrypto',
      email,
      locale,
    };
    if (cryptoAddress) body.cryptoWalletAddress = cryptoAddress;

    const res = await fetch(`${baseUrl}/v2/request`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: res.status, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ requestId: data.requestId }), {
      status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
