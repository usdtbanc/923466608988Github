import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = new Set([
  'http://localhost:8080',
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

/**
 * Signs the request body using RSASSA-PSS with SHA-512.
 * Algorithm per Paybis docs:
 *   1. SHA-512 hex digest of the raw JSON body string
 *   2. Sign that hex string with RSA-PSS (SHA-512, MGF1-SHA-512, salt=64)
 *   3. Base64-encode the binary signature
 */
async function signRequestBody(bodyString: string, privateKeyPem: string): Promise<string> {
  // Strip PEM headers/footers and decode base64 to DER
  const pemBody = privateKeyPem
    .replace(/-----BEGIN [A-Z ]+-----/g, '')
    .replace(/-----END [A-Z ]+-----/g, '')
    .replace(/\s+/g, '');
  const derBuffer = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    derBuffer.buffer,
    { name: 'RSA-PSS', hash: 'SHA-512' },
    false,
    ['sign'],
  );

  // Step 1: SHA-512 hash of the body, hex-encoded
  const bodyBytes = new TextEncoder().encode(bodyString);
  const hashBuffer = await crypto.subtle.digest('SHA-512', bodyBytes);
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Step 2: Sign the hex string (as UTF-8 bytes) with RSA-PSS
  const messageBytes = new TextEncoder().encode(hashHex);
  const signature = await crypto.subtle.sign(
    { name: 'RSA-PSS', saltLength: 64 },
    privateKey,
    messageBytes,
  );

  // Step 3: Base64-encode
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const CORS = corsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const { currencyCodeFrom, currencyCode, locale = 'en' } = await req.json();

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

    const partnerUserId = user.id;
    const email = user.email;

    const { data: settings, error: settingsError } = await supabase
      .from('paybis_settings')
      .select('paybis_api_key, paybis_sandbox')
      .single();

    if (settingsError || !settings?.paybis_api_key) {
      return new Response(JSON.stringify({ error: 'Paybis settings not configured' }), {
        status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const privateKeyPem = Deno.env.get('PAYBIS_PRIVATE_KEY');
    if (!privateKeyPem) {
      return new Response(JSON.stringify({ error: 'Paybis signing key not configured' }), {
        status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const apiKey  = settings.paybis_api_key as string;
    const sandbox = settings.paybis_sandbox as boolean;
    const baseUrl = sandbox
      ? 'https://widget-api.sandbox.paybis.com'
      : 'https://widget-api.paybis.com';

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
      '0.0.0.0';

    const body: Record<string, unknown> = {
      partnerUserId,
      flow: 'buyCrypto',
      email,
      locale,
      userIp,
    };
    if (currencyCodeFrom) {
      body.currencyCodeFrom = currencyCodeFrom;
    }
    if (cryptoAddress && currencyCode) {
      body.cryptoWalletAddress = { address: cryptoAddress, currencyCode };
    }

    const bodyString = JSON.stringify(body);
    const signature = await signRequestBody(bodyString, privateKeyPem);

    const res = await fetch(`${baseUrl}/v3/request`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Request-Signature': signature,
      },
      body: bodyString,
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
