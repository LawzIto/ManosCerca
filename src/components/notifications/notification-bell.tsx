import { Bell } from "lucide-react";
import Link from "next/link";

export function NotificationBell({ unread }: { unread: number }) {
  const label = unread > 0 ? `Notificaciones (${unread} sin leer)` : "Notificaciones";

  return (
    <Link
      href="/notificaciones"
      aria-label={label}
      className="relative flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <Bell className="size-5" aria-hidden />
      {unread > 0 && (
        <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-semibold text-white">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
