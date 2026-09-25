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

export function RequestCard({ request }: { request: RequestCardData }) {
  const proposalCount = request.proposals[0]?.count ?? 0;

  return (
    <Link
      href={`/solicitudes/${request.id}`}
      className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
        <CategoryIcon slug={request.category?.slug ?? ""} className="size-5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate font-medium">{request.title}</span>
        <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <StatusBadge status={request.status} />
          {request.status === "pendiente" && (
            <span>
              {proposalCount === 1 ? "1 cotización" : `${proposalCount} cotizaciones`}
            </span>
          )}
          <span>{formatRelativeTime(request.created_at)}</span>
        </span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
}

/** Columnas para `.select()` que coinciden con `RequestCardData`. */
export const REQUEST_CARD_COLUMNS =
  "id, title, status, created_at, category:categories(slug, name), proposals!proposals_request_id_fkey(count)" as const;
