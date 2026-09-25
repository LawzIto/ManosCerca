import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { HOME_PATH } from "@/lib/auth/redirect";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between px-4">
          <Link href={HOME_PATH} className="text-lg font-bold tracking-tight">
            ManosCerca
          </Link>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6">
        {children}
      </main>
    </>
  );
}
