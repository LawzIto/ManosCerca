import Link from "next/link";

import { AppNav } from "@/components/app-nav";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { BrandLogo } from "@/components/brand";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { NotificationListener } from "@/components/notifications/notification-listener";
import { UserAvatar } from "@/components/profile/user-avatar";
import { HOME_PATH } from "@/lib/auth/redirect";
import { requireProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { count: unread } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", profile.id)
    .is("read_at", null);

  return (
    <>
      <NotificationListener userId={profile.id} />
      <header className="sticky top-0 z-10 border-b border-[#EAF2FF] bg-white/95 backdrop-blur shadow-[0_2px_12px_rgba(6,34,68,0.03)]">
        <div className="mx-auto flex h-16 w-full max-w-2xl items-center justify-between px-4">
          <Link href={HOME_PATH} className="flex items-center" aria-label="ManosCerca">
            <BrandLogo variant="horizontal" color="color" className="h-8 w-auto min-w-[120px]" priority />
          </Link>
          <div className="flex items-center gap-1">
            <NotificationBell unread={unread ?? 0} />
            <SignOutButton />
            <Link href="/perfil" aria-label="Mi perfil" className="rounded-full focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
              <UserAvatar name={profile.full_name} url={profile.avatar_url} />
            </Link>
          </div>
        </div>
        <AppNav role={profile.role} />
      </header>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6">
        {children}
      </main>
    </>
  );
}
