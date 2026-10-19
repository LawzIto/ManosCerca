import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { TrustBanner } from "@/components/brand/trust-banner";
import { CategoryIcon } from "@/components/category-icon";
import { REQUEST_CARD_COLUMNS, RequestCard } from "@/components/requests/request-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { requireProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Inicio" };

const ROLE_LABELS = { client: "Cliente", professional: "Profesional", admin: "Administrador" };

export default async function HomePage() {
  const profile = await requireProfile();
  if (profile.role === "professional") redirect("/trabajos");
  const firstName = profile.full_name.split(" ")[0];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#062244]">
            {firstName ? `Hola, ${firstName}` : "Hola"}
          </h1>
          <p className="text-sm text-[#5B6B7F]">¿Qué servicio necesitas resolver hoy?</p>
        </div>
        <Badge variant="secondary">{ROLE_LABELS[profile.role]}</Badge>
      </header>

      {profile.role === "client" && <ClientHome clientId={profile.id} />}
    </div>
  );
}

async function ClientHome({ clientId }: { clientId: string }) {
  const supabase = await createClient();
  const [{ data: categories }, { data: requests }] = await Promise.all([
    supabase.from("categories").select("id, slug, name").order("sort_order"),
    supabase
      .from("service_requests")
      .select(REQUEST_CARD_COLUMNS)
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <section className="space-y-4">
        <Link
          href="/solicitudes/nueva"
          className={buttonVariants({
            variant: "default",
            size: "default",
            className: "w-full text-base font-semibold shadow-sm",
          })}
        >
          <Plus className="size-5" aria-hidden />
          Pedir un servicio
        </Link>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold tracking-wide text-[#5B6B7F] uppercase">
            Categorías principales
          </h2>
          <div className="grid grid-cols-4 gap-2.5">
            {(categories ?? []).map((category) => (
              <Link
                key={category.id}
                href={`/solicitudes/nueva?categoria=${category.slug}`}
                className="flex flex-col items-center gap-2 rounded-2xl bg-[#EAF2FF] p-3 text-center transition-all hover:bg-[#dce9fd] hover:shadow-sm active:scale-[0.98]"
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-white text-[#062244] shadow-xs">
                  <CategoryIcon slug={category.slug} className="size-5 text-[#062244]" />
                </span>
                <span className="text-[11px] leading-tight font-medium text-[#062244]">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <TrustBanner />

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-[#062244]">Tus solicitudes</h2>
          {requests && requests.length > 0 && (
            <Link
              href="/solicitudes"
              className="text-sm font-medium text-[#0165F0] hover:underline"
            >
              Ver todas
            </Link>
          )}
        </div>
        {requests && requests.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {requests.map((request) => (
              <li key={request.id}>
                <RequestCard request={request} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#D0D9E8] bg-white p-8 text-center text-sm text-[#5B6B7F]">
            Aún no has pedido ningún servicio.
          </div>
        )}
      </section>
    </div>
  );
}
