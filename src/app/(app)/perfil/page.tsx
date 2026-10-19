import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

import { CategoriesForm } from "@/components/profile/categories-form";
import { ProfileForm } from "@/components/profile/profile-form";
import { StatsGrid } from "@/components/profile/stats-grid";
import { UserAvatar } from "@/components/profile/user-avatar";
import { WorkAreaForm } from "@/components/profile/work-area-form";
import { PushToggle } from "@/components/push/push-toggle";
import { RatingSummary, Stars } from "@/components/reviews/stars";
import { Badge } from "@/components/ui/badge";
import { requireProfile } from "@/lib/auth/session";
import { formatRelativeTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Mi perfil" };

const ROLE_LABELS = { client: "Cliente", professional: "Profesional", admin: "Administrador" };

export default async function ProfilePage() {
  const profile = await requireProfile();
  const isProfessional = profile.role === "professional";
  const supabase = await createClient();

  const [phoneResult, reviewsResult, categoriesResult, mineResult, workAreaResult] = await Promise.all([
    supabase.rpc("get_my_phone"),
    supabase
      .from("reviews")
      .select(
        "id, rating, comment, created_at, reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url)",
      )
      .eq("reviewee_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(10),
    isProfessional
      ? supabase.from("categories").select("id, slug, name").order("sort_order")
      : null,
    isProfessional
      ? supabase.from("professional_categories").select("category_id").eq("professional_id", profile.id)
      : null,
    isProfessional
      ? supabase
          .from("work_areas")
          .select("latitude, longitude, radius_km")
          .eq("professional_id", profile.id)
          .maybeSingle()
      : null,
  ]);

  if (reviewsResult.error) throw reviewsResult.error;
  if (categoriesResult?.error) throw categoriesResult.error;
  if (mineResult?.error) throw mineResult.error;
  if (workAreaResult?.error) throw workAreaResult.error;
  const workArea = workAreaResult?.data;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-4 rounded-3xl border border-[#EAF2FF] bg-white p-6 shadow-[0_4px_20px_rgba(6,34,68,0.05)]">
        <UserAvatar
          name={profile.full_name}
          url={profile.avatar_url}
          className="size-16 ring-4 ring-[#EAF2FF]"
          fallbackClassName="text-xl"
        />
        <div className="min-w-0 space-y-1.5 flex-1">
          <h1 className="truncate text-2xl font-bold tracking-tight text-[#062244]">
            {profile.full_name || "Mi perfil"}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="secondary">{ROLE_LABELS[profile.role]}</Badge>
            <Badge variant="verified">
              <ShieldCheck className="size-3.5" aria-hidden />
              Identidad verificada
            </Badge>
            <RatingSummary avg={profile.rating_avg} count={profile.rating_count} />
          </div>
        </div>
      </header>

      <StatsGrid profile={profile} />

      <section className="space-y-4 rounded-3xl border border-[#EAF2FF] bg-white p-6 shadow-[0_4px_20px_rgba(6,34,68,0.05)]">
        <div>
          <h2 className="text-lg font-bold text-[#062244]">Tus datos</h2>
          <p className="text-xs text-[#5B6B7F]">Información básica de tu cuenta y contacto</p>
        </div>
        <ProfileForm
          showBio={isProfessional}
          defaults={{
            fullName: profile.full_name,
            phone: phoneResult.data ?? "",
            bio: profile.bio ?? "",
            avatarUrl: profile.avatar_url,
          }}
        />
      </section>

      {categoriesResult && mineResult && (
        <section className="space-y-4 rounded-3xl border border-[#EAF2FF] bg-white p-6 shadow-[0_4px_20px_rgba(6,34,68,0.05)]">
          <div>
            <h2 className="text-lg font-bold text-[#062244]">Especialidades</h2>
            <p className="text-xs text-[#5B6B7F]">
              Verás primero las solicitudes de estas categorías en tu zona.
            </p>
          </div>
          <CategoriesForm
            categories={categoriesResult.data}
            selectedIds={mineResult.data.map((row) => row.category_id)}
          />
        </section>
      )}

      {isProfessional && (
        <section id="zona" className="scroll-mt-4 space-y-4 rounded-3xl border border-[#EAF2FF] bg-white p-6 shadow-[0_4px_20px_rgba(6,34,68,0.05)]">
          <div>
            <h2 className="text-lg font-bold text-[#062244]">Zona de trabajo</h2>
            <p className="text-xs text-[#5B6B7F]">
              Te mostraremos las solicitudes dentro de este radio de distancia.
            </p>
          </div>
          <WorkAreaForm
            defaults={
              workArea
                ? {
                    latitude: workArea.latitude,
                    longitude: workArea.longitude,
                    radiusKm: workArea.radius_km,
                  }
                : null
            }
          />
        </section>
      )}

      <section className="space-y-4 rounded-3xl border border-[#EAF2FF] bg-white p-6 shadow-[0_4px_20px_rgba(6,34,68,0.05)]">
        <div>
          <h2 className="text-lg font-bold text-[#062244]">Notificaciones</h2>
          <p className="text-xs text-[#5B6B7F]">Gestiona las alertas en tiempo real en tu dispositivo</p>
        </div>
        <PushToggle />
      </section>

      <section className="space-y-4 rounded-3xl border border-[#EAF2FF] bg-white p-6 shadow-[0_4px_20px_rgba(6,34,68,0.05)]">
        <div>
          <h2 className="text-lg font-bold text-[#062244]">Reseñas recibidas</h2>
          <p className="text-xs text-[#5B6B7F]">Opiniones de clientes que completaron servicios contigo</p>
        </div>
        {reviewsResult.data.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {reviewsResult.data.map((review) => (
              <li key={review.id} className="space-y-2 rounded-2xl border border-[#EAF2FF] bg-[#F3F6FA] p-4 text-sm">
                <div className="flex items-center gap-2.5">
                  <UserAvatar
                    name={review.reviewer?.full_name ?? ""}
                    url={review.reviewer?.avatar_url}
                    className="size-8"
                    fallbackClassName="text-xs"
                  />
                  <span className="min-w-0 flex-1 truncate font-semibold text-[#062244]">
                    {review.reviewer?.full_name || "Usuario"}
                  </span>
                  <span className="text-xs text-[#5B6B7F]">
                    {formatRelativeTime(review.created_at)}
                  </span>
                </div>
                <Stars rating={review.rating} />
                {review.comment && <p className="text-sm text-[#062244] leading-relaxed">{review.comment}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#D0D9E8] p-6 text-center text-sm text-[#5B6B7F]">
            Aún no tienes reseñas. Aparecerán cuando completes tu primer servicio.
          </div>
        )}
      </section>
    </div>
  );
}
