import { cn } from "cn";
import type { Metadata } from "next";

import { ActionButton } from "@/components/action-button";
import { NotificationIcon } from "@/components/notifications/notification-icon";
import { requireProfile } from "@/lib/auth/session";
import { formatRelativeTime } from "@/lib/format";
import { markAllNotificationsRead, openNotification } from "@/lib/notifications/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Notificaciones" };

export default async function NotificationsPage() {
  await requireProfile();
  const supabase = await createClient();

  // RLS: solo las del usuario. El layout escucha las nuevas y refresca la página.
  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("id, type, title, body, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;

  const hasUnread = notifications.some((notification) => !notification.read_at);

  return (
    <>
      <header className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Notificaciones</h1>
        {hasUnread && (
          <ActionButton
            action={markAllNotificationsRead}
            variant="ghost"
            size="sm"
            pendingLabel="Marcando…"
          >
            Marcar todas como leídas
          </ActionButton>
        )}
      </header>

      {notifications.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {notifications.map((notification) => {
            const unread = !notification.read_at;
            return (
              <li key={notification.id}>
                <form action={openNotification.bind(null, notification.id)}>
                  <button
                    type="submit"
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50",
                      unread && "border-primary/30 bg-primary/5",
                    )}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                      <NotificationIcon type={notification.type} className="size-4" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className={cn("text-sm", unread ? "font-semibold" : "font-medium")}>
                        {notification.title}
                      </span>
                      {notification.body && (
                        <span className="line-clamp-2 text-sm text-muted-foreground">
                          {notification.body}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(notification.created_at)}
                      </span>
                    </span>
                    {unread && (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary">
                        <span className="sr-only">Sin leer</span>
                      </span>
                    )}
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No tienes notificaciones todavía. Aquí verás las cotizaciones, los cambios en tus
          servicios y las calificaciones.
        </p>
      )}
    </>
  );
}
