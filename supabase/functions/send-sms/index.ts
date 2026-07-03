// send-sms: Africa's Talking SMS sender.
// External integration only. Callers: server functions / DB triggers.
// Body: { to: string | string[]; message: string; parcelId?: string }

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: CORS });

  const username = Deno.env.get("AFRICASTALKING_USERNAME");
  const apiKey = Deno.env.get("AFRICASTALKING_API_KEY");
  const senderId = Deno.env.get("AFRICASTALKING_SENDER_ID");
  if (!username || !apiKey) {
    return new Response(JSON.stringify({ error: "Africa's Talking not configured" }), { status: 500, headers: { ...CORS, "content-type": "application/json" } });
  }

  let payload: { to?: string | string[]; message?: string; parcelId?: string };
  try { payload = await req.json(); }
  catch { return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { ...CORS, "content-type": "application/json" } }); }

  const rawTo = payload.to;
  const message = (payload.message ?? "").trim();
  if (!rawTo || !message) {
    return new Response(JSON.stringify({ error: "to and message required" }), { status: 400, headers: { ...CORS, "content-type": "application/json" } });
  }

  const recipients = (Array.isArray(rawTo) ? rawTo : [rawTo])
    .map(n => normalizeKenyaPhone(n))
    .filter((n): n is string => !!n);
  if (recipients.length === 0) {
    return new Response(JSON.stringify({ error: "No valid phone numbers" }), { status: 400, headers: { ...CORS, "content-type": "application/json" } });
  }

  const form = new URLSearchParams();
  form.set("username", username);
  form.set("to", recipients.join(","));
  form.set("message", message);
  if (senderId) form.set("from", senderId);

  const atRes = await fetch("https://api.africastalking.com/version1/messaging", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json", "apiKey": apiKey },
    body: form.toString(),
  });
  const atJson: unknown = await atRes.json().catch(() => ({}));
  const ok = atRes.ok;

  // Best-effort logging to notifications_log via service role (fire and forget)
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (supabaseUrl && serviceKey) {
      await fetch(`${supabaseUrl}/rest/v1/notifications_log`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": serviceKey, "Authorization": `Bearer ${serviceKey}`, "Prefer": "return=minimal" },
        body: JSON.stringify({
          channel: "sms",
          recipient: recipients.join(","),
          message,
          status: ok ? "sent" : "failed",
          parcel_id: payload.parcelId ?? null,
          provider: "africastalking",
          provider_response: atJson,
        }),
      });
    }
  } catch (e) { console.warn("log failed", (e as Error).message); }

  return new Response(JSON.stringify({ ok, provider: atJson }), {
    status: ok ? 200 : 502,
    headers: { ...CORS, "content-type": "application/json" },
  });
});

function normalizeKenyaPhone(raw: string): string | null {
  const s = String(raw ?? "").replace(/[^\d+]/g, "");
  if (!s) return null;
  if (s.startsWith("+")) return s;
  if (s.startsWith("254")) return "+" + s;
  if (s.startsWith("0") && s.length >= 10) return "+254" + s.slice(1);
  if (s.length === 9) return "+254" + s;
  return null;
}
