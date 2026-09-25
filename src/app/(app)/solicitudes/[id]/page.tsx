import { ArrowLeft, CircleCheck, Clock, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { ActionButton } from "@/components/action-button";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { ContactCard } from "@/components/requests/contact-card";
import { RequestSummary } from "@/components/requests/request-summary";
import { requireRole } from "@/lib/auth/session";
import { formatCurrency } from "@/lib/format";
import { acceptProposal, cancelServiceRequest } from "@/lib/requests/actions";
import { CLIENT_CANCELLABLE } from "@/lib/requests/status";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Solicitud" };

export default async function RequestDetailPage({ params }: PageProps<"/solicitudes/[id]">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const profile = await requireRole("client");
  const supabase = await createClient();

  const { data: request, error } = await supabase
    .from("service_requests")
    .select(
      `id, title, description, address, budget_estimate, status, created_at,
       category:categories(slug, name),
       proposals!proposals_request_id_fkey(
         id, price, message, eta_minutes, status, created_at,
         professional:profiles!proposals_professional_id_fkey(full_name, rating_avg, rating_count)
       )`,
    )
    .eq("id", id)
    .eq("client_id", profile.id)
    .order("created_at", { referencedTable: "proposals", ascending: true })
    .maybeSingle();

  if (error) throw error;
  if (!request) notFound();

  const isOpen = request.status === "pendiente";
  // Abierta: las cotizaciones vigentes. Después: solo la aceptada.
  const proposals = request.proposals.filter((proposal) =>
    isOpen ? proposal.status === "pendiente" : proposal.status === "aceptada",
  );

  return (
    <>
      <RealtimeRefresh
        channel={`solicitud-${request.id}`}
        subscriptions={[
          { table: "service_requests", filter: `id=eq.${request.id}` },
          { table: "proposals", filter: `request_id=eq.${request.id}` },
        ]}
      />

      <Link
        href="/solicitudes"
        className="flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Mis solicitudes
      </Link>

      <RequestSummary request={request} />

      <ContactCard requestId={request.id} title="Tu profesional" />

      <section className="space-y-3">
        <h2 className="font-semibold">
          {isOpen
            ? `Cotizaciones${proposals.length > 0 ? ` (${proposals.length})` : ""}`
            : "Cotización aceptada"}
        </h2>
        {proposals.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {proposals.map((proposal) => (
              <li key={proposal.id} className="space-y-2 rounded-lg border p-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 truncate font-medium">
                      {proposal.status === "aceptada" && (
                        <CircleCheck className="size-4 shrink-0 text-emerald-600" aria-hidden />
                      )}
                      {proposal.professional?.full_name || "Profesional"}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="size-3 fill-current" aria-hidden />
                      {proposal.professional && proposal.professional.rating_count > 0
                        ? `${proposal.professional.rating_avg} (${proposal.professional.rating_count})`
                        : "Nuevo"}
                    </p>
                  </div>
                  <p className="text-base font-semibold">{formatCurrency(proposal.price)}</p>
                </div>
                {proposal.message && <p className="text-muted-foreground">{proposal.message}</p>}
                {proposal.eta_minutes != null && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" aria-hidden />
                    Llega en ~{proposal.eta_minutes} min
                  </p>
                )}
                {isOpen && (
                  <ActionButton
                    className="w-full"
                    action={acceptProposal.bind(null, proposal.id, request.id)}
                    confirmMessage={`¿Aceptar la cotización de ${formatCurrency(proposal.price)}? Se rechazarán las demás.`}
                    successMessage="¡Cotización aceptada! Ya puedes contactar al profesional."
                    pendingLabel="Aceptando…"
                  >
                    Aceptar cotización
                  </ActionButton>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            {isOpen
              ? "Aún no hay cotizaciones. Aparecerán aquí automáticamente."
              : "Esta solicitud no tiene una cotización aceptada."}
          </p>
        )}
      </section>

      {CLIENT_CANCELLABLE.includes(request.status) && (
        <div className="border-t pt-4">
          <ActionButton
            variant="destructive"
            action={cancelServiceRequest.bind(null, request.id)}
            confirmMessage="¿Seguro que quieres cancelar esta solicitud?"
            successMessage="Solicitud cancelada"
            pendingLabel="Cancelando…"
          >
            Cancelar solicitud
          </ActionButton>
        </div>
      )}
    </>
  );
}
