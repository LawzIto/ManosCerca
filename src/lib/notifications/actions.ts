"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { safeNextPath } from "@/lib/auth/redirect";
import { requireProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

/** Marca la notificación como leída y lleva a su destino. */
export async function openNotification(notificationId: string) {
  if (!z.uuid().safeParse(notificationId).success) redirect("/notificaciones");

  await requireProfile();
  const supabase = await createClient();
  const { data: notification } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .is("read_at", null)
    .select("link")
    .maybeSingle();

  // Si ya estaba leída, el update no devuelve fila: se lee el enlace aparte.
  const link =
    notification?.link ??
    (await supabase.from("notifications").select("link").eq("id", notificationId).maybeSingle())
      .data?.link;

  revalidatePath("/", "layout");
  redirect(link ? safeNextPath(link) : "/notificaciones");
}

export async function markAllNotificationsRead(): Promise<{ error?: string }> {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", profile.id)
    .is("read_at", null);

  if (error) {
    console.error("markAllNotificationsRead", error);
    return { error: "No se pudieron marcar como leídas." };
  }

  revalidatePath("/", "layout");
  return {};
}
