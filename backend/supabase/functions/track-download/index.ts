import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const textEncoder = new TextEncoder();

interface DownloadStatsRow {
  id: string;
  total_downloads: number;
}

function responseJson(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

async function hashIp(ip: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(ip));
  const bytes = new Uint8Array(digest);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function getOrCreateStats(supabase: ReturnType<typeof createClient>): Promise<DownloadStatsRow> {
  const { data, error } = await supabase
    .from("download_stats")
    .select("id,total_downloads")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (data) {
    return data as DownloadStatsRow;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("download_stats")
    .insert({ total_downloads: 0 })
    .select("id,total_downloads")
    .single();

  if (insertError) throw insertError;
  return inserted as DownloadStatsRow;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return responseJson({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    const missing: string[] = [];
    if (!supabaseUrl) missing.push("SUPABASE_URL");
    if (!serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
    return responseJson({ error: "Server misconfigured", missing }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  try {
    const stats = await getOrCreateStats(supabase);

    if (req.method === "GET") {
      return responseJson({ success: true, downloads: stats.total_downloads });
    }

    const nextDownloads = (stats.total_downloads || 0) + 1;

    const { error: updateError } = await supabase
      .from("download_stats")
      .update({
        total_downloads: nextDownloads,
        last_updated: new Date().toISOString(),
      })
      .eq("id", stats.id);

    if (updateError) throw updateError;

    const ip = getClientIp(req);
    const ipHash = await hashIp(ip);
    const userAgent = req.headers.get("user-agent") || "unknown";

    const { error: logError } = await supabase
      .from("download_logs")
      .insert({
        ip_hash: ipHash,
        user_agent: userAgent,
        downloaded_at: new Date().toISOString(),
      });

    if (logError) {
      console.error("track-download log insert failed:", logError);
    }

    return responseJson({ success: true, downloads: nextDownloads });
  } catch (error) {
    console.error("track-download error:", error);
    return responseJson({ error: "Internal server error" }, 500);
  }
});
