import { cn } from "cn";
import { MapPin } from "lucide-react";
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
  const [{ data: categories }, { data: mine }, { data: workArea }] = await Promise.all([
    supabase.from("categories").select("id, slug, name").order("sort_order"),
    supabase.from("professional_categories").select("category_id").eq("professional_id", profile.id),
    supabase.from("work_areas").select("radius_km").eq("professional_id", profile.id).maybeSingle(),
  ]);
  const selected = categories?.find((category) => category.slug === categoria);
  const myCategoryIds = (mine ?? []).map((row) => row.category_id);
  // Sin filtro explícito, se muestran las especialidades del profesional (si configuró alguna).
  const showMine = !categoria && myCategoryIds.length > 0;
  const showAll = !selected && !showMine;
  const categoryIds = selected ? [selected.id] : showMine ? myCategoryIds : undefined;

  // Con zona de trabajo: solo las solicitudes dentro del radio, las más cercanas primero.
  // Sin zona: todas las pendientes, las más recientes primero.
  let jobsQuery;
  if (workArea) {
    jobsQuery = supabase
      .rpc("get_nearby_requests", { p_category_ids: categoryIds })
      .select(JOB_CARD_COLUMNS)
      .order("distance_km", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(50);
  } else {
    jobsQuery = supabase
      .from("service_requests")
      .select(JOB_CARD_COLUMNS)
      .eq("status", "pendiente")
      .neq("client_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (categoryIds) jobsQuery = jobsQuery.in("category_id", categoryIds);
  }

  const { data: jobs, error } = await jobsQuery;
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
          {workArea ? (
            <>
              A menos de {workArea.radius_km} km de tu zona, las más cercanas primero.{" "}
              <Link href="/perfil#zona" className="underline underline-offset-4">
                Cambiar
              </Link>
            </>
          ) : (
            "Solicitudes esperando cotización. Se actualiza en tiempo real."
          )}
        </p>
      </header>

      {!workArea && (
        <Link
          href="/perfil#zona"
          className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm transition-colors hover:bg-primary/10"
        >
          <MapPin className="size-5 shrink-0 text-primary" aria-hidden />
          <span className="flex-1">
            <span className="font-medium">Configura tu zona de trabajo</span>
            <span className="block text-muted-foreground">
              Verás solo las solicitudes cercanas, ordenadas por distancia.
            </span>
          </span>
        </Link>
      )}

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
          {selected ? ` de ${selected.name.toLowerCase()}` : showMine ? " de tus especialidades" : ""}
          {workArea ? " cerca de tu zona" : ""} por ahora. Te mostraremos las nuevas apenas lleguen.
          {workArea && (
            <>
              {" "}
              También puedes{" "}
              <Link href="/perfil#zona" className="underline underline-offset-4">
                ampliar tu distancia máxima
              </Link>
              .
            </>
          )}
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
