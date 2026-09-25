import { MapPin, Wallet } from "lucide-react";

import { CategoryIcon } from "@/components/category-icon";
import { StatusBadge } from "@/components/requests/status-badge";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import type { Tables } from "@/types/database";

type Request = Pick<
  Tables<"service_requests">,
  "title" | "description" | "address" | "budget_estimate" | "status" | "created_at"
> & { category: Pick<Tables<"categories">, "slug" | "name"> | null };

/** Encabezado y datos de una solicitud; común a las vistas de cliente y profesional. */
export function RequestSummary({ request }: { request: Request }) {
  return (
    <>
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
        <p className="whitespace-pre-line break-words">{request.description}</p>
        <p className="flex items-start gap-2 text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
          {request.address}
        </p>
        {request.budget_estimate != null && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Wallet className="size-4 shrink-0" aria-hidden />
            Presupuesto del cliente: {formatCurrency(request.budget_estimate)}
          </p>
        )}
      </section>
    </>
  );
}
