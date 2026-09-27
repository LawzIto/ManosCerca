"use server";

import { z } from "zod";

import { requireProfile } from "@/lib/auth/session";
import { type PushSubscriptionInput, pushSubscriptionSchema } from "@/lib/push/schemas";
import { createClient } from "@/lib/supabase/server";

export async function savePushSubscription(input: PushSubscriptionInput): Promise<{ error?: string }> {
  const parsed = pushSubscriptionSchema.safeParse(input);
  if (!parsed.success) return { error: "Suscripción no válida." };

  await requireProfile();
  const { endpoint, p256dh, auth, userAgent } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.rpc("save_push_subscription", {
    p_endpoint: endpoint,
    p_p256dh: p256dh,
    p_auth: auth,
    p_user_agent: userAgent,
  });

  if (error) {
    console.error("savePushSubscription", error);
    return { error: "No pudimos activar las notificaciones. Intenta de nuevo." };
  }
  return {};
}

export async function deletePushSubscription(endpoint: string): Promise<{ error?: string }> {
  if (!z.url().safeParse(endpoint).success) return { error: "Suscripción no válida." };

  await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);

  if (error) {
    console.error("deletePushSubscription", error);
    return { error: "No pudimos desactivar las notificaciones." };
  }
  return {};
}
