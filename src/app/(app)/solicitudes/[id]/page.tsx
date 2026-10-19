import { ArrowLeft, CircleCheck, Clock, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { ActionButton } from "@/components/action-button";
import { TrustBanner } from "@/components/brand/trust-banner";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { ContactCard } from "@/components/requests/contact-card";
import { RequestSummary } from "@/components/requests/request-summary";
import { ServiceStepper } from "@/components/requests/service-stepper";
import { ReviewSection } from "@/components/reviews/review-section";
import { Stars } from "@/components/reviews/stars";
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
      `id, title, description, address, budget_estimate, status, created_at, professional_id,
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
    <div className="flex flex-col gap-6">
      <RealtimeRefresh
        channel={`solicitud-${request.id}`}
        subscriptions={[
          { table: "service_requests", filter: `id=eq.${request.id}` },
          { table: "proposals", filter: `request_id=eq.${request.id}` },
        ]}
      />

      <div className="flex items-center justify-between">
        <Link
          href="/solicitudes"
          className="flex items-center gap-1.5 text-sm font-semibold text-[#062244] transition-colors hover:text-[#0165F0]"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver a mis solicitudes
        </Link>
      </div>

      <ServiceStepper currentStatus={request.status} />

      <RequestSummary request={request} />

      {isOpen && <TrustBanner />}

      <ContactCard requestId={request.id} title="Tu profesional asignado" />

      {request.status === "completado" && request.professional_id && (
        <ReviewSection
          requestId={request.id}
          userId={profile.id}
          counterpartName={proposals[0]?.professional?.full_name || "el profesional"}
        />
      )}

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold tracking-tight text-[#062244]">
            {isOpen
              ? `Cotizaciones recibidas${proposals.length > 0 ? ` (${proposals.length})` : ""}`
              : "Cotización aceptada"}
          </h2>
          {isOpen && proposals.length > 0 && (
            <span className="text-xs font-medium text-[#5B6B7F]">
              Elige la que mejor se adapte a ti
            </span>
          )}
        </div>

        {proposals.length > 0 ? (
          <ul className="flex flex-col gap-4">
            {proposals.map((proposal) => {
              const isAccepted = proposal.status === "aceptada";

              return (
                <li
                  key={proposal.id}
                  className={`flex flex-col gap-4 rounded-3xl border bg-white p-6 shadow-[0_4px_20px_rgba(6,34,68,0.06)] transition-all ${
                    isAccepted
                      ? "border-2 border-[#0165F0] bg-[#EAF2FF]/20 ring-2 ring-[#0165F0]/15"
                      : "border-[#EAF2FF] hover:border-[#0165F0]/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-bold text-[#062244]">
                          {proposal.professional?.full_name || "Profesional"}
                        </p>
                        {isAccepted && (
                          <span className="flex items-center gap-1 rounded-full bg-[#EAF2FF] px-2.5 py-0.5 text-xs font-semibold text-[#0165F0]">
                            <CircleCheck className="size-3.5" aria-hidden />
                            Aceptada
                          </span>
                        )}
                        <span className="flex items-center gap-1 rounded-full bg-[#E6F4EA] px-2.5 py-0.5 text-xs font-medium text-[#0B7A4B]">
                          <ShieldCheck className="size-3.5" aria-hidden />
                          Verificado
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#5B6B7F]">
                        {proposal.professional && proposal.professional.rating_count > 0 ? (
                          <div className="flex items-center gap-1">
                            <Stars rating={proposal.professional.rating_avg} />
                            <span className="font-semibold text-[#062244]">
                              {proposal.professional.rating_avg}
                            </span>
                            <span>({proposal.professional.rating_count} reseñas)</span>
                          </div>
                        ) : (
                          <span className="rounded-full bg-[#FEF6E6] px-2 py-0.5 text-xs font-medium text-[#062244]">
                            Nuevo profesional
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold tracking-tight text-[#062244]">
                        {formatCurrency(proposal.price)}
                      </p>
                      <p className="text-[11px] font-medium text-[#5B6B7F]">Mano de obra estimada</p>
                    </div>
                  </div>

                  {proposal.message && (
                    <div className="rounded-2xl bg-[#F3F6FA] p-3 text-sm text-[#062244]">
                      <p className="font-medium text-xs text-[#5B6B7F] mb-1">Mensaje del profesional:</p>
                      <p>{proposal.message}</p>
                    </div>
                  )}

                  {proposal.eta_minutes != null && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#062244]">
                      <span className="flex items-center gap-1 rounded-full bg-[#EAF2FF] px-3 py-1">
                        <Clock className="size-3.5 text-[#0165F0]" aria-hidden />
                        Disponible para llegar en ~{proposal.eta_minutes} minutos
                      </span>
                    </div>
                  )}

                  {isOpen && (
                    <div className="pt-2">
                      <ActionButton
                        className="w-full min-h-12 rounded-full bg-[#0165F0] hover:brightness-95 text-white font-semibold text-base shadow-sm"
                        action={acceptProposal.bind(null, proposal.id, request.id)}
                        confirmMessage={`¿Aceptar la cotización de ${formatCurrency(proposal.price)}? Se rechazarán las demás.`}
                        successMessage="¡Cotización aceptada! Ya puedes contactar al profesional."
                        pendingLabel="Aceptando…"
                      >
                        Aceptar cotización
                      </ActionButton>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#D0D9E8] bg-white p-8 text-center text-sm text-[#5B6B7F]">
            <p className="font-medium text-[#062244]">
              {isOpen
                ? "Aún no hay cotizaciones recibidas"
                : "Esta solicitud no tiene una cotización aceptada"}
            </p>
            <p className="mt-1 text-xs text-[#5B6B7F] max-w-sm">
              {isOpen
                ? "Los técnicos de tu zona están revisando tu solicitud. Recibirás una notificación en cuanto coticen."
                : ""}
            </p>
          </div>
        )}
      </section>

      {CLIENT_CANCELLABLE.includes(request.status) && (
        <div className="border-t border-[#EAF2FF] pt-4 flex justify-center">
          <ActionButton
            variant="destructive"
            className="rounded-full font-semibold px-6"
            action={cancelServiceRequest.bind(null, request.id)}
            confirmMessage="¿Seguro que quieres cancelar esta solicitud?"
            successMessage="Solicitud cancelada"
            pendingLabel="Cancelando…"
          >
            Cancelar solicitud
          </ActionButton>
        </div>
      )}
    </div>
  );
}
