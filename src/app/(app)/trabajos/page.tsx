import { cn } from "cn";
import type { Metadata } from "next";
import Link from "next/link";

import { JOB_CARD_COLUMNS, JobCard } from "@/components/jobs/job-card";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Trabajos disponibles" };

export default async function AvailableJobsPage({ searchParams }: PageProps<"/trabajos">) {
  const profile = await requireRole("professional");
  const { categoria } = await searchParams;

  const supabase = await createClient();
  const [{ data: categories }, { data: mine }] = await Promise.all([
    supabase.from("categories").select("id, slug, name").order("sort_order"),
    supabase.from("professional_categories").select("category_id").eq("professional_id", profile.id),
  ]);
  const selected = categories?.find((category) => category.slug === categoria);
  const myCategoryIds = (mine ?? []).map((row) => row.category_id);
  // Sin filtro explícito, se muestran las especialidades del profesional (si configuró alguna).
  const showMine = !categoria && myCategoryIds.length > 0;
  const showAll = !selected && !showMine;

  let query = supabase
    .from("service_requests")
    .select(JOB_CARD_COLUMNS)
    .eq("status", "pendiente")
    .neq("client_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (selected) query = query.eq("category_id", selected.id);
  else if (showMine) query = query.in("category_id", myCategoryIds);

  const { data: jobs, error } = await query;
  if (error) throw error;

  const chipClass = (isActive: boolean) =>
    cn(
      "shrink-0 rounded-full border px-3 py-1 text-sm transition-colors",
      isActive ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
    );

  return (
    <>
      <RealtimeRefresh channel="trabajos-disponibles" subscriptions={[{ table: "service_requests" }]} />

      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Trabajos disponibles</h1>
        <p className="text-sm text-muted-foreground">
          Solicitudes esperando cotización. Se actualiza en tiempo real.
        </p>
      </header>

      <nav aria-label="Filtrar por categoría" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {myCategoryIds.length > 0 && (
          <Link href="/trabajos" className={chipClass(showMine)}>
            Mis especialidades
          </Link>
        )}
        <Link
          href={myCategoryIds.length > 0 ? "/trabajos?categoria=todas" : "/trabajos"}
          className={chipClass(showAll)}
        >
          Todas
        </Link>
        {(categories ?? []).map((category) => (
          <Link
            key={category.id}
            href={`/trabajos?categoria=${category.slug}`}
            className={chipClass(selected?.id === category.id)}
          >
            {category.name}
          </Link>
        ))}
      </nav>

      {jobs.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {jobs.map((job) => (
            <li key={job.id}>
              <JobCard job={job} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No hay solicitudes pendientes
          {selected ? ` de ${selected.name.toLowerCase()}` : showMine ? " de tus especialidades" : ""}{" "}
          por ahora. Te mostraremos las nuevas apenas lleguen.
        </p>
      )}

      {myCategoryIds.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/perfil" className="underline underline-offset-4">
            Elige tus especialidades
          </Link>{" "}
          para ver primero las solicitudes que te interesan.
        </p>
      )}
    </>
  );
}
