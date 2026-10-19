import { ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";

import { CategoryIcon } from "@/components/category-icon";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDistance, formatRelativeTime } from "@/lib/format";
import type { Tables } from "@/types/database";

export type JobCardData = Pick<
  Tables<"service_requests">,
  "id" | "title" | "address" | "budget_estimate" | "created_at" | "distance_km"
> & {
  category: Pick<Tables<"categories">, "slug" | "name"> | null;
  /** Por RLS, solo contiene la cotización del propio profesional (si existe). */
  proposals: Pick<Tables<"proposals">, "status">[];
};

/** Columnas para `.select()` que coinciden con `JobCardData`. */
export const JOB_CARD_COLUMNS =
  "id, title, address, budget_estimate, created_at, distance_km, category:categories(slug, name), proposals!proposals_request_id_fkey(status)" as const;

export function JobCard({ job }: { job: JobCardData }) {
  const quoted = job.proposals.some((proposal) => proposal.status === "pendiente");

  return (
    <Link
      href={`/trabajos/${job.id}`}
      className="group flex items-center gap-4 rounded-3xl border border-[#EAF2FF] bg-white p-5 shadow-[0_4px_20px_rgba(6,34,68,0.05)] transition-all hover:border-[#0165F0]/30 hover:shadow-[0_8px_24px_rgba(6,34,68,0.08)] active:scale-[0.99]"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF2FF] text-[#062244] transition-colors group-hover:bg-[#0165F0] group-hover:text-white">
        <CategoryIcon slug={job.category?.slug ?? ""} className="size-6" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="flex items-center gap-2">
          <span className="truncate text-base font-semibold text-[#062244]">{job.title}</span>
          {quoted && <Badge variant="secondary">Ya cotizaste</Badge>}
        </span>
        <span className="flex items-center gap-1.5 truncate text-xs text-[#5B6B7F]">
          <MapPin className="size-3.5 shrink-0 text-[#0165F0]" aria-hidden />
          {job.distance_km != null && (
            <span className="shrink-0 font-semibold text-[#0165F0]">
              {formatDistance(job.distance_km)} ·
            </span>
          )}
          <span className="truncate">{job.address}</span>
        </span>
        <span className="flex flex-wrap items-center gap-2 text-xs text-[#5B6B7F]">
          {job.budget_estimate != null && (
            <span className="font-semibold text-[#0B7A4B]">{formatCurrency(job.budget_estimate)}</span>
          )}
          <span>{formatRelativeTime(job.created_at)}</span>
        </span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-[#5B6B7F] transition-transform group-hover:translate-x-0.5 group-hover:text-[#0165F0]" aria-hidden />
    </Link>
  );
}
