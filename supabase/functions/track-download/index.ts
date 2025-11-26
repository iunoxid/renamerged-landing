import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === 'POST') {
      const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
      const userAgent = req.headers.get('user-agent') || 'unknown';
      
      const ipHash = clientIp !== 'unknown' 
        ? await crypto.subtle.digest(
            'SHA-256',
            new TextEncoder().encode(clientIp + 'salt-renamerged-2024')
          ).then(buf => 
            Array.from(new Uint8Array(buf))
              .map(b => b.toString(16).padStart(2, '0'))
              .join('')
          )
        : 'unknown';

      const { error: logError } = await supabase
        .from('download_logs')
        .insert({
          ip_hash: ipHash,
          user_agent: userAgent,
        });

      if (logError) {
        console.error('Error logging download:', logError);
      }

      const { data: statsData, error: fetchError } = await supabase
        .from('download_stats')
        .select('id, total_downloads')
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (statsData) {
        const { error: updateError } = await supabase
          .from('download_stats')
          .update({
            total_downloads: statsData.total_downloads + 1,
            last_updated: new Date().toISOString(),
          })
          .eq('id', statsData.id);

        if (updateError) {
          throw updateError;
        }
      }

      return new Response(
        JSON.stringify({ success: true, downloads: (statsData?.total_downloads || 0) + 1 }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('download_stats')
        .select('total_downloads')
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ downloads: data?.total_downloads || 0 }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in track-download function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
