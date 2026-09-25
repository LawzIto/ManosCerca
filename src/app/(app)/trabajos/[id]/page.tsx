import { ArrowLeft, Clock, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { ActionButton } from "@/components/action-button";
import { ProposalForm } from "@/components/proposals/proposal-form";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { ContactCard } from "@/components/requests/contact-card";
import { RequestSummary } from "@/components/requests/request-summary";
import { requireRole } from "@/lib/auth/session";
import { formatCurrency } from "@/lib/format";
import { withdrawProposal } from "@/lib/proposals/actions";
import { updateJobStatus } from "@/lib/requests/actions";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database";

export const metadata: Metadata = { title: "Trabajo" };

export default async function JobDetailPage({ params }: PageProps<"/trabajos/[id]">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const profile = await requireRole("professional");
  const supabase = await createClient();

  // RLS: visible si está pendiente o si está asignada a este profesional.
  // `proposals` solo trae la cotización propia.
  const { data: job, error } = await supabase
    .from("service_requests")
    .select(
      `id, title, description, address, budget_estimate, status, created_at, professional_id,
       category:categories(slug, name),
       client:profiles!service_requests_client_id_fkey(full_name, rating_avg, rating_count),
       proposals!proposals_request_id_fkey(id, price, message, eta_minutes, status)`,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!job) notFound();

  const isAssignedToMe = job.professional_id === profile.id;
  const myProposal = job.proposals[0];

  return (
    <>
      <RealtimeRefresh
        channel={`trabajo-${job.id}`}
        subscriptions={[
          { table: "service_requests", filter: `id=eq.${job.id}` },
          { table: "proposals", filter: `request_id=eq.${job.id}` },
        ]}
      />

      <Link
        href={isAssignedToMe ? "/trabajos/mios" : "/trabajos"}
        className="flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {isAssignedToMe ? "Mis trabajos" : "Trabajos disponibles"}
      </Link>

      <RequestSummary request={job} />

      {job.client && (
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          Cliente: <span className="font-medium text-foreground">{job.client.full_name || "Sin nombre"}</span>
          {job.client.rating_count > 0 && (
            <>
              <Star className="ml-1 size-3 fill-current" aria-hidden />
              {job.client.rating_avg} ({job.client.rating_count})
            </>
          )}
        </p>
      )}

      {isAssignedToMe ? (
        <AssignedJobActions jobId={job.id} status={job.status} />
      ) : myProposal?.status === "pendiente" ? (
        <section className="space-y-3 rounded-lg border p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">Tu cotización</h2>
              <p className="text-sm text-muted-foreground">Esperando la respuesta del cliente.</p>
            </div>
            <p className="text-lg font-semibold">{formatCurrency(myProposal.price)}</p>
          </div>
          {myProposal.message && <p className="text-sm text-muted-foreground">{myProposal.message}</p>}
          {myProposal.eta_minutes != null && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" aria-hidden />
              Llegas en ~{myProposal.eta_minutes} min
            </p>
          )}
          <ActionButton
            variant="outline"
            action={withdrawProposal.bind(null, myProposal.id, job.id)}
            confirmMessage="¿Retirar tu cotización? Podrás volver a cotizar mientras la solicitud siga abierta."
            successMessage="Cotización retirada"
            pendingLabel="Retirando…"
          >
            Retirar cotización
          </ActionButton>
        </section>
      ) : job.status === "pendiente" ? (
        <section className="space-y-3">
          <h2 className="font-semibold">
            {myProposal ? "Volver a cotizar" : "Envía tu cotización"}
          </h2>
          <ProposalForm
            requestId={job.id}
            defaults={
              myProposal
                ? { price: myProposal.price, etaMinutes: myProposal.eta_minutes, message: myProposal.message }
                : undefined
            }
          />
        </section>
      ) : (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Esta solicitud ya no está disponible.
        </p>
      )}
    </>
  );
}

function AssignedJobActions({ jobId, status }: { jobId: string; status: Enums<"request_status"> }) {
  if (status === "completado") {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Trabajo completado. ¡Buen trabajo!
      </p>
    );
  }
  if (status === "cancelado") {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        El cliente canceló este servicio.
      </p>
    );
  }

  return (
    <>
      <ContactCard requestId={jobId} title="Contacto del cliente" />
      {status === "aceptado" ? (
        <ActionButton
          size="lg"
          className="h-11"
          action={updateJobStatus.bind(null, jobId, "en_progreso")}
          successMessage="Trabajo iniciado"
          pendingLabel="Iniciando…"
        >
          Iniciar trabajo
        </ActionButton>
      ) : (
        <ActionButton
          size="lg"
          className="h-11"
          action={updateJobStatus.bind(null, jobId, "completado")}
          confirmMessage="¿Confirmas que terminaste el trabajo?"
          successMessage="¡Trabajo completado!"
          pendingLabel="Guardando…"
        >
          Marcar como completado
        </ActionButton>
      )}
    </>
  );
}
