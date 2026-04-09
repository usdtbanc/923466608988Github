import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const { partnerUserId, email, cryptoAddress, currencyCode, locale = 'en' } = await req.json();

    // Read API key + sandbox flag from paybis_settings table
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: settings, error: settingsError } = await supabase
      .from('paybis_settings')
      .select('paybis_api_key, paybis_sandbox')
      .single();

    if (settingsError || !settings?.paybis_api_key) {
      return new Response(JSON.stringify({ error: 'Paybis settings not configured' }), {
        status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const apiKey  = settings.paybis_api_key as string;
    const sandbox = settings.paybis_sandbox as boolean;
    const baseUrl = sandbox
      ? 'https://widget-api.sandbox.paybis.com'
      : 'https://widget-api.paybis.com';

    const body: Record<string, unknown> = {
      partnerUserId,
      flow: 'buyCrypto',
      email,
      locale,
    };
    if (cryptoAddress && currencyCode) {
      body.cryptoWalletAddress = { address: cryptoAddress, currencyCode };
    }

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
