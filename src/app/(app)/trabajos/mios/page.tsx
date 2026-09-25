import type { Metadata } from "next";
import Link from "next/link";

import { CategoryIcon } from "@/components/category-icon";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { REQUEST_CARD_COLUMNS, RequestCard, type RequestCardData } from "@/components/requests/request-card";
import { requireRole } from "@/lib/auth/session";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Mis trabajos" };

export default async function MyJobsPage() {
  const profile = await requireRole("professional");
  const supabase = await createClient();

  const [jobsResult, proposalsResult] = await Promise.all([
    supabase
      .from("service_requests")
      .select(REQUEST_CARD_COLUMNS)
      .eq("professional_id", profile.id)
      .order("updated_at", { ascending: false })
      .limit(50),
    supabase
      .from("proposals")
      .select(
        `id, price, created_at,
         request:service_requests!proposals_request_id_fkey(id, title, category:categories(slug, name))`,
      )
      .eq("professional_id", profile.id)
      .eq("status", "pendiente")
      .order("created_at", { ascending: false }),
  ]);

  if (jobsResult.error) throw jobsResult.error;
  if (proposalsResult.error) throw proposalsResult.error;

  const jobs = jobsResult.data;
  const active = jobs.filter((job) => job.status === "aceptado" || job.status === "en_progreso");
  const history = jobs.filter((job) => job.status === "completado" || job.status === "cancelado");
  const proposals = proposalsResult.data.filter((proposal) => proposal.request);

  return (
    <>
      <RealtimeRefresh
        channel={`mis-trabajos-${profile.id}`}
        subscriptions={[
          { table: "proposals", filter: `professional_id=eq.${profile.id}` },
          { table: "service_requests", filter: `professional_id=eq.${profile.id}` },
        ]}
      />

      <h1 className="text-2xl font-bold tracking-tight">Mis trabajos</h1>

      <JobSection title="En curso" jobs={active} empty="No tienes trabajos en curso." />

      <section className="space-y-3">
        <h2 className="font-semibold">Cotizaciones enviadas</h2>
        {proposals.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {proposals.map((proposal) => (
              <li key={proposal.id}>
                <Link
                  href={`/trabajos/${proposal.request!.id}`}
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                    <CategoryIcon slug={proposal.request!.category?.slug ?? ""} className="size-5" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate font-medium">{proposal.request!.title}</span>
                    <span className="text-xs text-muted-foreground">
                      Enviada {formatRelativeTime(proposal.created_at)}
                    </span>
                  </span>
                  <span className="font-semibold">{formatCurrency(proposal.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>
            No tienes cotizaciones pendientes.{" "}
            <Link href="/trabajos" className="underline underline-offset-4">
              Ver trabajos disponibles
            </Link>
          </EmptyState>
        )}
      </section>

      {history.length > 0 && <JobSection title="Historial" jobs={history} />}
    </>
  );
}

function JobSection({ title, jobs, empty }: { title: string; jobs: RequestCardData[]; empty?: string }) {
  return (
    <section className="space-y-3">
      <h2 className="font-semibold">{title}</h2>
      {jobs.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {jobs.map((job) => (
            <li key={job.id}>
              <RequestCard request={job} href={`/trabajos/${job.id}`} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState>{empty}</EmptyState>
      )}
    </section>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}
