"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";

/**
 * Escucha las notificaciones del usuario en tiempo real: muestra un toast con
 * cada nueva y refresca los Server Components (contador de la campana, etc.).
 */
export function NotificationListener({ userId }: { userId: string }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const filter = `user_id=eq.${userId}`;

    const channel = supabase
      .channel(`notificaciones-${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter }, (payload) => {
        const notification = payload.new as Tables<"notifications">;
        const { link } = notification;
        toast(notification.title, {
          description: notification.body ?? undefined,
          action: link ? { label: "Ver", onClick: () => router.push(link) } : undefined,
        });
        router.refresh();
      })
      // Leídas desde otra pestaña o dispositivo.
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "notifications", filter }, () =>
        router.refresh(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, router]);

  return null;
}
