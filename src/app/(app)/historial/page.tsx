import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CategoryIcon } from "@/components/category-icon";
import { StatsGrid } from "@/components/profile/stats-grid";
import { Stars } from "@/components/reviews/stars";
import { Badge } from "@/components/ui/badge";
import { HOME_PATH } from "@/lib/auth/redirect";
import { requireProfile } from "@/lib/auth/session";
import { formatCurrency, formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Historial" };

export default async function HistoryPage() {
  const profile = await requireProfile();
  if (profile.role === "admin") redirect(HOME_PATH);
  const isProfessional = profile.role === "professional";
  const supabase = await createClient();

  const [servicesResult, reviewsResult] = await Promise.all([
    supabase
      .from("service_requests")
      .select(
        `id, title, completed_at,
         category:categories(slug, name),
         accepted:proposals!service_requests_accepted_proposal_fk(price),
         client:profiles!service_requests_client_id_fkey(full_name),
         professional:profiles!service_requests_professional_id_fkey(full_name)`,
      )
      .eq(isProfessional ? "professional_id" : "client_id", profile.id)
      .eq("status", "completado")
      .order("completed_at", { ascending: false })
      .limit(50),
    supabase.from("reviews").select("request_id, rating").eq("reviewer_id", profile.id),
  ]);

  if (servicesResult.error) throw servicesResult.error;
  if (reviewsResult.error) throw reviewsResult.error;

  const services = servicesResult.data;
  const myRatings = new Map(reviewsResult.data.map((review) => [review.request_id, review.rating]));
  const basePath = isProfessional ? "/trabajos" : "/solicitudes";

  return (
    <>
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Historial</h1>
        <p className="text-sm text-muted-foreground">
          {isProfessional ? "Tus trabajos completados." : "Los servicios que ya recibiste."}
        </p>
      </header>

      <StatsGrid profile={profile} />

      <section className="space-y-3">
        <h2 className="font-semibold">Completados</h2>
        {services.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {services.map((service) => {
              const counterpart = isProfessional ? service.client : service.professional;
              const myRating = myRatings.get(service.id);
              return (
                <li key={service.id}>
                  <Link
                    href={`${basePath}/${service.id}`}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      <CategoryIcon slug={service.category?.slug ?? ""} className="size-5" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate font-medium">{service.title}</span>
                        {service.accepted && (
                          <span className="shrink-0 font-semibold tabular-nums">
                            {formatCurrency(service.accepted.price)}
                          </span>
                        )}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {counterpart?.full_name || (isProfessional ? "Cliente" : "Profesional")}
                        {service.completed_at && ` · ${formatDate(service.completed_at)}`}
                      </span>
                      {myRating ? (
                        <Stars rating={myRating} className="self-start [&_svg]:size-3" />
                      ) : (
                        <Badge className="self-start border-transparent bg-amber-500/15 text-amber-800 dark:text-amber-300">
                          Pendiente de calificar
                        </Badge>
                      )}
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            {isProfessional
              ? "Aún no has completado trabajos. "
              : "Aún no tienes servicios completados. "}
            <Link
              href={isProfessional ? "/trabajos" : "/solicitudes/nueva"}
              className="underline underline-offset-4"
            >
              {isProfessional ? "Ver trabajos disponibles" : "Pedir un servicio"}
            </Link>
          </p>
        )}
      </section>
    </>
  );
}
