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
  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, name")
    .order("sort_order");
  const selected = categories?.find((category) => category.slug === categoria);

  let query = supabase
    .from("service_requests")
    .select(JOB_CARD_COLUMNS)
    .eq("status", "pendiente")
    .neq("client_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (selected) query = query.eq("category_id", selected.id);

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
        <Link href="/trabajos" className={chipClass(!selected)}>
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
          No hay solicitudes pendientes{selected ? ` de ${selected.name.toLowerCase()}` : ""} por
          ahora. Te mostraremos las nuevas apenas lleguen.
        </p>
      )}
    </>
  );
}
