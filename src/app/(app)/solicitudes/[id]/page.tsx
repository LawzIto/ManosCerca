import { ArrowLeft, Clock, MapPin, Star, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { CategoryIcon } from "@/components/category-icon";
import { CancelRequestButton } from "@/components/requests/cancel-request-button";
import { StatusBadge } from "@/components/requests/status-badge";
import { requireRole } from "@/lib/auth/session";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
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
      `*,
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

  const proposals = request.proposals.filter((proposal) => proposal.status !== "retirada");

  return (
    <>
      <Link
        href="/solicitudes"
        className="flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Mis solicitudes
      </Link>

      <header className="flex items-start gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted">
          <CategoryIcon slug={request.category?.slug ?? ""} className="size-6" />
        </span>
        <div className="min-w-0 space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight break-words">{request.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <StatusBadge status={request.status} />
            <span>{request.category?.name}</span>
            <span aria-hidden>·</span>
            <span>{formatRelativeTime(request.created_at)}</span>
          </div>
        </div>
      </header>

      <section className="space-y-3 rounded-lg border p-4 text-sm">
        <p className="whitespace-pre-line">{request.description}</p>
        <p className="flex items-start gap-2 text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
          {request.address}
        </p>
        {request.budget_estimate != null && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Wallet className="size-4 shrink-0" aria-hidden />
            Presupuesto estimado: {formatCurrency(request.budget_estimate)}
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">
          Cotizaciones {proposals.length > 0 && `(${proposals.length})`}
        </h2>
        {proposals.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {proposals.map((proposal) => (
              <li key={proposal.id} className="space-y-2 rounded-lg border p-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
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
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            {request.status === "pendiente"
              ? "Aún no hay cotizaciones. Te avisaremos cuando un profesional responda."
              : "Esta solicitud no recibió cotizaciones."}
          </p>
        )}
      </section>

      {CLIENT_CANCELLABLE.includes(request.status) && (
        <div className="border-t pt-4">
          <CancelRequestButton requestId={request.id} />
        </div>
      )}
    </>
  );
}
