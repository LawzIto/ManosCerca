import Link from "next/link";

import { AppNav } from "@/components/app-nav";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { UserAvatar } from "@/components/profile/user-avatar";
import { HOME_PATH } from "@/lib/auth/redirect";
import { requireProfile } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();

  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between px-4">
          <Link href={HOME_PATH} className="text-lg font-bold tracking-tight">
            ManosCerca
          </Link>
          <div className="flex items-center gap-1">
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
