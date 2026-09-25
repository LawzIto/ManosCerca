import type { Metadata } from "next";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { requireProfile } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Inicio" };

const ROLE_LABELS = { client: "Cliente", professional: "Profesional", admin: "Administrador" };

export default async function HomePage() {
  const profile = await requireProfile();
  const firstName = profile.full_name.split(" ")[0];

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {firstName ? `Hola, ${firstName}` : "Hola"}
          </h1>
          <Badge variant="secondary">{ROLE_LABELS[profile.role]}</Badge>
        </div>
        <SignOutButton />
      </header>
      <p className="text-muted-foreground">
        {profile.role === "professional"
          ? "Pronto verás aquí las solicitudes de servicio cerca de ti."
          : "Pronto podrás pedir un servicio desde aquí."}
      </p>
    </main>
  );
}
