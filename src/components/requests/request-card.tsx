import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { CategoryIcon } from "@/components/category-icon";
import { StatusBadge } from "@/components/requests/status-badge";
import { formatRelativeTime } from "@/lib/format";
import type { Tables } from "@/types/database";

export type RequestCardData = Pick<
  Tables<"service_requests">,
  "id" | "title" | "status" | "created_at"
> & {
  category: Pick<Tables<"categories">, "slug" | "name"> | null;
  proposals: { count: number }[];
};

export function RequestCard({ request, href }: { request: RequestCardData; href?: string }) {
  const proposalCount = request.proposals[0]?.count ?? 0;

  return (
    <Link
      href={href ?? `/solicitudes/${request.id}`}
      className="group flex items-center gap-4 rounded-3xl border border-[#EAF2FF] bg-white p-5 shadow-[0_4px_20px_rgba(6,34,68,0.05)] transition-all hover:border-[#0165F0]/30 hover:shadow-[0_8px_24px_rgba(6,34,68,0.08)] active:scale-[0.99]"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF2FF] text-[#062244] transition-colors group-hover:bg-[#0165F0] group-hover:text-white">
        <CategoryIcon slug={request.category?.slug ?? ""} className="size-6" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="truncate text-base font-semibold text-[#062244]">
          {request.title}
        </span>
        <span className="flex flex-wrap items-center gap-2 text-xs text-[#5B6B7F]">
          <StatusBadge status={request.status} />
          {request.status === "pendiente" && (
            <span className="font-medium text-[#0165F0]">
              {proposalCount === 1 ? "1 cotización recibida" : `${proposalCount} cotizaciones recibidas`}
            </span>
          )}
          <span>{formatRelativeTime(request.created_at)}</span>
        </span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-[#5B6B7F] transition-transform group-hover:translate-x-0.5 group-hover:text-[#0165F0]" aria-hidden />
    </Link>
  );
}

/** Columnas para `.select()` que coinciden con `RequestCardData`. */
export const REQUEST_CARD_COLUMNS =
  "id, title, status, created_at, category:categories(slug, name), proposals!proposals_request_id_fkey(count)" as const;
