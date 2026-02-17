const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Download-Gate",
};

const textEncoder = new TextEncoder();
const GATE_TOKEN_TTL_SECONDS = 10 * 60;

function isEnvTrue(value: string | undefined | null): boolean {
  if (!value) return false;
  const normalized = value.trim().replace(/^"+|"+$/g, "").toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

function toBase64Url(bytes: Uint8Array): string {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string): Uint8Array {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padLength);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function signPayload(payloadEncoded: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(payloadEncoded));
  return toBase64Url(new Uint8Array(signature));
}

async function createGateToken(secret: string): Promise<string> {
  const payload = {
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + GATE_TOKEN_TTL_SECONDS,
    nonce: crypto.randomUUID(),
    purpose: "download-catalog",
  };

  const payloadEncoded = toBase64Url(textEncoder.encode(JSON.stringify(payload)));
  const signatureEncoded = await signPayload(payloadEncoded, secret);
  return `${payloadEncoded}.${signatureEncoded}`;
}

async function verifyGateToken(token: string, secret: string): Promise<boolean> {
  const [payloadEncoded, signatureEncoded] = token.split(".");
  if (!payloadEncoded || !signatureEncoded) return false;

  const expectedSignature = await signPayload(payloadEncoded, secret);
  if (expectedSignature !== signatureEncoded) return false;

  try {
    const payloadJson = new TextDecoder().decode(fromBase64Url(payloadEncoded));
    const payload = JSON.parse(payloadJson) as { exp?: number; purpose?: string };
    if (payload.purpose !== "download-catalog") return false;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}

function isGateTokenFormat(token: string): boolean {
  if (!token) return false;
  const dotCount = (token.match(/\./g) || []).length;
  return dotCount === 1;
}

async function verifyRecaptcha(captchaToken: string, recaptchaSecret: string): Promise<boolean> {
  const body = new URLSearchParams({
    secret: recaptchaSecret,
    response: captchaToken,
  });

  const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const verifyJson = await verifyRes.json();
  return !!verifyJson.success;
}

async function loadDownloadCatalog(supabaseUrl: string, serviceRoleKey: string) {
  const endpoint = `${supabaseUrl}/rest/v1/download_versions?select=id,version,file_name,architecture,download_url,sort_order,is_active&is_active=eq.true&order=sort_order.asc,updated_at.desc`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch download catalog: ${errorText}`);
  }

  return await response.json();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const recaptchaSecret = Deno.env.get("RECAPTCHA_SECRET_KEY");
  const allowRecaptchaBypass = isEnvTrue(Deno.env.get("ALLOW_RECAPTCHA_BYPASS"));
  const downloadGateSecret = Deno.env.get("DOWNLOAD_GATE_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!downloadGateSecret || !supabaseUrl || !serviceRoleKey) {
    const missing: string[] = [];
    if (!downloadGateSecret) missing.push("DOWNLOAD_GATE_SECRET");
    if (!supabaseUrl) missing.push("SUPABASE_URL");
    if (!serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");

    return new Response(
      JSON.stringify({ error: "Server misconfigured", missing }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    if (req.method === "POST") {
      let body: { captchaToken?: string } = {};
      try {
        body = await req.json();
      } catch {
        body = {};
      }
      const captchaToken = body.captchaToken || "";

      if (!captchaToken && !allowRecaptchaBypass) {
        return new Response(
          JSON.stringify({ error: "Missing captcha token", bypassEnabled: allowRecaptchaBypass }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!recaptchaSecret && !allowRecaptchaBypass) {
        return new Response(
          JSON.stringify({ error: "reCAPTCHA secret not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!allowRecaptchaBypass && recaptchaSecret) {
        const recaptchaPassed = await verifyRecaptcha(captchaToken, recaptchaSecret);
        if (!recaptchaPassed) {
          return new Response(
            JSON.stringify({ error: "reCAPTCHA verification failed" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      if (allowRecaptchaBypass) {
        return new Response(
          JSON.stringify({ success: true, bypass: true, gateToken: await createGateToken(downloadGateSecret) }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } }
        );
      }

      const gateToken = await createGateToken(downloadGateSecret);
      return new Response(
        JSON.stringify({ success: true, gateToken }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    if (req.method === "GET") {
      const auth = req.headers.get("Authorization") || "";
      const bearerToken = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
      const gateHeaderToken = (req.headers.get("X-Download-Gate") || "").trim();
      const gateQueryToken = new URL(req.url).searchParams.get("gate")?.trim() || "";
      const gateToken =
        gateHeaderToken ||
        gateQueryToken ||
        (isGateTokenFormat(bearerToken) ? bearerToken : "");

      if (!gateToken) {
        return new Response(
          JSON.stringify({ error: "Missing gate token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const valid = await verifyGateToken(gateToken, downloadGateSecret);
      if (!valid) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired gate token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await loadDownloadCatalog(supabaseUrl, serviceRoleKey);
      return new Response(
        JSON.stringify({ success: true, data }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("download-catalog error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
