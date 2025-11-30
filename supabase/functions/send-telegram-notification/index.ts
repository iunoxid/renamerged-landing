import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotificationPayload {
  type: 'failed_login' | 'account_locked' | 'suspicious_activity' | 'manual_unlock' | 'test';
  email: string;
  ip_address?: string;
  failed_attempts?: number;
  details?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Telegram config from database
    const { data: config, error: configError } = await supabase
      .from("security_config")
      .select("telegram_bot_token, telegram_chat_id")
      .single();

    if (configError || !config?.telegram_bot_token || !config?.telegram_chat_id) {
      return new Response(
        JSON.stringify({ error: "Telegram not configured" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const payload: NotificationPayload = await req.json();

    // Build message based on notification type
    let message = "";
    const timestamp = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

    switch (payload.type) {
      case "failed_login":
        message = `🚨 *Failed Login Attempt*\n\n` +
          `📧 Email: ${payload.email}\n` +
          `🌐 IP: ${payload.ip_address || 'Unknown'}\n` +
          `⏰ Time: ${timestamp}\n` +
          `${payload.details ? `\n📝 Details: ${payload.details}` : ''}`;
        break;

      case "account_locked":
        message = `🔒 *Account Locked*\n\n` +
          `📧 Email: ${payload.email}\n` +
          `🌐 IP: ${payload.ip_address || 'Unknown'}\n` +
          `❌ Failed Attempts: ${payload.failed_attempts || 0}\n` +
          `⏰ Time: ${timestamp}\n\n` +
          `⚠️ Account will auto-unlock in 1 hour or can be manually unlocked from admin dashboard.`;
        break;

      case "suspicious_activity":
        message = `⚠️ *Suspicious Activity Detected*\n\n` +
          `📧 Email: ${payload.email}\n` +
          `🌐 IP: ${payload.ip_address || 'Unknown'}\n` +
          `⏰ Time: ${timestamp}\n` +
          `${payload.details ? `\n📝 Details: ${payload.details}` : ''}`;
        break;

      case "manual_unlock":
        message = `🔓 *Account Manually Unlocked*\n\n` +
          `📧 Email: ${payload.email}\n` +
          `⏰ Time: ${timestamp}\n` +
          `${payload.details ? `\n📝 Details: ${payload.details}` : ''}`;
        break;

      case "test":
        message = `✅ *Test Notification*\n\n` +
          `Your Telegram bot is working correctly!\n\n` +
          `⏰ Time: ${timestamp}\n` +
          `📧 Admin: ${payload.email}\n\n` +
          `🎉 All security notifications will be sent to this chat.`;
        break;
    }

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${config.telegram_bot_token}/sendMessage`;
    const telegramResponse = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: config.telegram_chat_id,
        text: message,
        parse_mode: "Markdown",
      }),
    });

    if (!telegramResponse.ok) {
      const error = await telegramResponse.text();
      throw new Error(`Telegram API error: ${error}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
