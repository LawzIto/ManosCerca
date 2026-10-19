import { MapPin, Wallet } from "lucide-react";

import { CategoryIcon } from "@/components/category-icon";
import { StatusBadge } from "@/components/requests/status-badge";
import { formatCurrency, formatDistance, formatRelativeTime } from "@/lib/format";
import type { Tables } from "@/types/database";

type Request = Pick<
  Tables<"service_requests">,
  "title" | "description" | "address" | "budget_estimate" | "status" | "created_at"
> &
  Partial<Pick<Tables<"service_requests">, "distance_km">> & {
    category: Pick<Tables<"categories">, "slug" | "name"> | null;
  };

/** Encabezado y datos de una solicitud; común a las vistas de cliente y profesional. */
export function RequestSummary({ request }: { request: Request }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-[#EAF2FF] bg-white p-6 shadow-[0_4px_20px_rgba(6,34,68,0.05)]">
      <header className="flex items-start gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#EAF2FF] text-[#062244] shadow-xs">
          <CategoryIcon slug={request.category?.slug ?? ""} className="size-7 text-[#062244]" />
        </span>
        <div className="min-w-0 flex-1 space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight text-[#062244] break-words sm:text-2xl">
            {request.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#5B6B7F]">
            <StatusBadge status={request.status} />
            <span className="font-medium text-[#062244]">{request.category?.name}</span>
            <span aria-hidden>·</span>
            <span>{formatRelativeTime(request.created_at)}</span>
          </div>
        </div>
      </header>

      <div className="space-y-4 border-t border-[#EAF2FF] pt-4 text-sm">
        <p className="whitespace-pre-line text-base leading-relaxed text-[#062244] break-words">
          {request.description}
        </p>

        <div className="flex flex-col gap-2 rounded-2xl bg-[#F3F6FA] p-4 text-sm">
          <p className="flex items-start gap-2.5 text-[#5B6B7F]">
            <MapPin className="mt-0.5 size-4 shrink-0 text-[#0165F0]" aria-hidden />
            <span className="text-[#062244]">
              {request.address}
              {request.distance_km != null && (
                <span className="font-semibold text-[#0165F0]">
                  {" "}
                  · {formatDistance(request.distance_km)} de tu zona
                </span>
              )}
            </span>
          </p>
          {request.budget_estimate != null && (
            <p className="flex items-center gap-2.5 text-[#5B6B7F]">
              <Wallet className="size-4 shrink-0 text-[#0B7A4B]" aria-hidden />
              <span>
                Presupuesto estimado:{" "}
                <span className="font-semibold text-[#062244]">
                  {formatCurrency(request.budget_estimate)}
                </span>
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
