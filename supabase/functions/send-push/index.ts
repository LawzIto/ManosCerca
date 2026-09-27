// Envía una notificación Web Push a todos los dispositivos del usuario.
// La invoca el trigger `notifications_dispatch_push` (pg_net) con el secreto
// compartido en `x-webhook-secret`; no acepta llamadas de usuarios (verify_jwt = false).
//
// Secretos requeridos: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, PUSH_WEBHOOK_SECRET.
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los inyecta Supabase.

import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

type Payload = {
  notification_id: string;
  user_id: string;
  title: string;
  body: string | null;
  link: string | null;
};

const env = (name: string) => {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
};

const WEBHOOK_SECRET = env("PUSH_WEBHOOK_SECRET");
webpush.setVapidDetails(env("VAPID_SUBJECT"), env("VAPID_PUBLIC_KEY"), env("VAPID_PRIVATE_KEY"));

const supabase = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** Comparación en tiempo constante para no filtrar el secreto por tiempos de respuesta. */
function safeEqual(a: string, b: string) {
  const encoder = new TextEncoder();
  const [x, y] = [encoder.encode(a), encoder.encode(b)];
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  if (!safeEqual(req.headers.get("x-webhook-secret") ?? "", WEBHOOK_SECRET)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const notification = (await req.json()) as Payload;
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", notification.user_id);
  if (error) {
    console.error("send-push: select", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  const payload = JSON.stringify({
    title: notification.title,
    body: notification.body,
    link: notification.link,
    tag: notification.notification_id,
  });

  const results = await Promise.allSettled(
    subscriptions.map((subscription) =>
      webpush.sendNotification(
        { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
        payload,
        { TTL: 60 * 60 * 24, urgency: "high" },
      ),
    ),
  );

  // 404/410: el navegador anuló la suscripción (desinstaló, revocó el permiso…).
  const expired: string[] = [];
  let failed = 0;
  results.forEach((result, i) => {
    if (result.status === "fulfilled") return;
    const statusCode = (result.reason as { statusCode?: number })?.statusCode;
    if (statusCode === 404 || statusCode === 410) expired.push(subscriptions[i].id);
    else {
      failed++;
      console.error("send-push: envío", statusCode, result.reason);
    }
  });

  if (expired.length > 0) {
    await supabase.from("push_subscriptions").delete().in("id", expired);
  }

  return Response.json({
    sent: results.length - expired.length - failed,
    expired: expired.length,
    failed,
  });
});
