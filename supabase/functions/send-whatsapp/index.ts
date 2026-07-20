// CareMatch — WhatsApp sender (Supabase Edge Function).
//
// The app POSTs the same notifications it logs on-screen; this function
// delivers them for real through the Twilio WhatsApp API. Twilio secrets
// stay server-side and are never exposed to the browser.
//
// Configure (Supabase Dashboard → Edge Functions → Secrets, or CLI):
//   TWILIO_ACCOUNT_SID    ACxxxxxxxx...
//   TWILIO_AUTH_TOKEN     your auth token
//   TWILIO_WHATSAPP_FROM  whatsapp:+14155238886   (Twilio sandbox or your number)
//
// Request body: { messages: [{ toName, phone, body, toRole }], matchId }
// Response:     { ok, configured, results: [{ to, ok, sid?, error? }] }

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// "+65 8123 4567" -> "whatsapp:+6581234567"
function toWhatsApp(phone: string): string {
  const digits = String(phone || "").replace(/[^\d+]/g, "");
  return `whatsapp:${digits}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "Use POST" }, 405);

  const SID = Deno.env.get("TWILIO_ACCOUNT_SID");
  const TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
  const FROM = Deno.env.get("TWILIO_WHATSAPP_FROM");

  let payload: { messages?: Array<Record<string, string>>; matchId?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON body" }, 400);
  }
  const messages = Array.isArray(payload.messages) ? payload.messages : [];

  // Not yet configured: report cleanly so the UI still works as a log.
  if (!SID || !TOKEN || !FROM) {
    return json({
      ok: false,
      configured: false,
      reason:
        "Twilio secrets not set. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_WHATSAPP_FROM to this function's secrets to send for real.",
      results: [],
    });
  }

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${SID}/Messages.json`;
  const auth = "Basic " + btoa(`${SID}:${TOKEN}`);

  const results = [];
  for (const m of messages) {
    const to = toWhatsApp(m.phone);
    try {
      const form = new URLSearchParams({ From: FROM, To: to, Body: m.body ?? "" });
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: auth, "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      });
      const data = await res.json();
      if (res.ok) results.push({ to, ok: true, sid: data.sid });
      else results.push({ to, ok: false, error: data.message || `HTTP ${res.status}` });
    } catch (e) {
      results.push({ to, ok: false, error: String(e) });
    }
  }

  return json({ ok: results.every((r) => r.ok), configured: true, results });
});
