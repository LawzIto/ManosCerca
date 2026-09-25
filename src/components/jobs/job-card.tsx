import { ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";

import { CategoryIcon } from "@/components/category-icon";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import type { Tables } from "@/types/database";

export type JobCardData = Pick<
  Tables<"service_requests">,
  "id" | "title" | "address" | "budget_estimate" | "created_at"
> & {
  category: Pick<Tables<"categories">, "slug" | "name"> | null;
  /** Por RLS, solo contiene la cotización del propio profesional (si existe). */
  proposals: Pick<Tables<"proposals">, "status">[];
};

/** Columnas para `.select()` que coinciden con `JobCardData`. */
export const JOB_CARD_COLUMNS =
  "id, title, address, budget_estimate, created_at, category:categories(slug, name), proposals!proposals_request_id_fkey(status)" as const;

export function JobCard({ job }: { job: JobCardData }) {
  const quoted = job.proposals.some((proposal) => proposal.status === "pendiente");

  return (
    <Link
      href={`/trabajos/${job.id}`}
      className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
        <CategoryIcon slug={job.category?.slug ?? ""} className="size-5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-medium">{job.title}</span>
          {quoted && <Badge variant="secondary">Ya cotizaste</Badge>}
        </span>
        <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0" aria-hidden />
          <span className="truncate">{job.address}</span>
        </span>
        <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {job.budget_estimate != null && (
            <span className="font-medium text-foreground">{formatCurrency(job.budget_estimate)}</span>
          )}
          <span>{formatRelativeTime(job.created_at)}</span>
        </span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
}
