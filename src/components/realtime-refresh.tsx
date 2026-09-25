"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";

type Subscription = {
  table: "service_requests" | "proposals";
  /** Filtro de Realtime, p. ej. `request_id=eq.<uuid>`. */
  filter?: string;
};

/**
 * Refresca los Server Components de la página cuando cambian las filas
 * suscritas. Realtime aplica RLS: solo llegan cambios que el usuario puede ver.
 */
export function RealtimeRefresh({
  channel,
  subscriptions,
}: {
  channel: string;
  subscriptions: Subscription[];
}) {
  const router = useRouter();
  const key = JSON.stringify(subscriptions);

  useEffect(() => {
    const supabase = createClient();
    let timeout: ReturnType<typeof setTimeout> | undefined;
    // Agrupa ráfagas de eventos (p. ej. aceptar una cotización rechaza las demás).
    const refresh = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => router.refresh(), 300);
    };

    const realtimeChannel = supabase.channel(channel);
    for (const { table, filter } of JSON.parse(key) as Subscription[]) {
      realtimeChannel.on("postgres_changes", { event: "*", schema: "public", table, filter }, refresh);
    }
    realtimeChannel.subscribe();

    return () => {
      clearTimeout(timeout);
      supabase.removeChannel(realtimeChannel);
    };
  }, [channel, key, router]);

  return null;
}
