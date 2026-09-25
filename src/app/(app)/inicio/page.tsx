import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { CategoryIcon } from "@/components/category-icon";
import { REQUEST_CARD_COLUMNS, RequestCard } from "@/components/requests/request-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { requireProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export const metadata: Metadata = { title: "Inicio" };

const ROLE_LABELS = { client: "Cliente", professional: "Profesional", admin: "Administrador" };

export default async function HomePage() {
  const profile = await requireProfile();
  const firstName = profile.full_name.split(" ")[0];

  return (
    <>
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {firstName ? `Hola, ${firstName}` : "Hola"}
        </h1>
        <Badge variant="secondary">{ROLE_LABELS[profile.role]}</Badge>
      </header>

      {profile.role === "client" ? (
        <ClientHome profile={profile} />
      ) : (
        <p className="text-muted-foreground">
          Pronto verás aquí las solicitudes de servicio cerca de ti.
        </p>
      )}
    </>
  );
}

async function ClientHome({ profile }: { profile: Tables<"profiles"> }) {
  const supabase = await createClient();
  const [{ data: categories }, { data: requests }] = await Promise.all([
    supabase.from("categories").select("id, slug, name").order("sort_order"),
    supabase
      .from("service_requests")
      .select(REQUEST_CARD_COLUMNS)
      .eq("client_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  return (
    <>
      <section className="space-y-3">
        <Link href="/solicitudes/nueva" className={buttonVariants({ size: "lg", className: "h-12 w-full" })}>
          <Plus aria-hidden />
          Pedir un servicio
        </Link>
        <div className="grid grid-cols-4 gap-2">
          {(categories ?? []).map((category) => (
            <Link
              key={category.id}
              href={`/solicitudes/nueva?categoria=${category.slug}`}
              className="flex flex-col items-center gap-1.5 rounded-lg border p-2 text-center transition-colors hover:bg-muted/50"
            >
              <CategoryIcon slug={category.slug} className="size-5" />
              <span className="text-[11px] leading-tight font-medium">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">Tus solicitudes</h2>
          {requests && requests.length > 0 && (
            <Link href="/solicitudes" className="text-sm text-muted-foreground underline underline-offset-4">
              Ver todas
            </Link>
          )}
        </div>
        {requests && requests.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {requests.map((request) => (
              <li key={request.id}>
                <RequestCard request={request} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Aún no has pedido ningún servicio.
          </p>
        )}
      </section>
    </>
  );
}
