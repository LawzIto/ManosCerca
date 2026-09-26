import type { Metadata } from "next";

import { CategoriesForm } from "@/components/profile/categories-form";
import { ProfileForm } from "@/components/profile/profile-form";
import { StatsGrid } from "@/components/profile/stats-grid";
import { UserAvatar } from "@/components/profile/user-avatar";
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

  const [phoneResult, reviewsResult, categoriesResult, mineResult] = await Promise.all([
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
  ]);

  if (reviewsResult.error) throw reviewsResult.error;
  if (categoriesResult?.error) throw categoriesResult.error;
  if (mineResult?.error) throw mineResult.error;

  return (
    <>
      <header className="flex items-center gap-4">
        <UserAvatar
          name={profile.full_name}
          url={profile.avatar_url}
          className="size-16"
          fallbackClassName="text-xl"
        />
        <div className="min-w-0 space-y-1">
          <h1 className="truncate text-2xl font-bold tracking-tight">
            {profile.full_name || "Mi perfil"}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{ROLE_LABELS[profile.role]}</Badge>
            <RatingSummary avg={profile.rating_avg} count={profile.rating_count} />
          </div>
        </div>
      </header>

      <StatsGrid profile={profile} />

      <section className="space-y-3">
        <h2 className="font-semibold">Tus datos</h2>
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
        <section className="space-y-3">
          <div>
            <h2 className="font-semibold">Especialidades</h2>
            <p className="text-sm text-muted-foreground">
              Verás primero las solicitudes de estas categorías.
            </p>
          </div>
          <CategoriesForm
            categories={categoriesResult.data}
            selectedIds={mineResult.data.map((row) => row.category_id)}
          />
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-semibold">Reseñas recibidas</h2>
        {reviewsResult.data.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {reviewsResult.data.map((review) => (
              <li key={review.id} className="space-y-2 rounded-lg border p-3 text-sm">
                <div className="flex items-center gap-2">
                  <UserAvatar
                    name={review.reviewer?.full_name ?? ""}
                    url={review.reviewer?.avatar_url}
                    className="size-7"
                    fallbackClassName="text-xs"
                  />
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {review.reviewer?.full_name || "Usuario"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(review.created_at)}
                  </span>
                </div>
                <Stars rating={review.rating} />
                {review.comment && <p className="text-muted-foreground">{review.comment}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Aún no tienes reseñas. Aparecerán cuando completes tu primer servicio.
          </p>
        )}
      </section>
    </>
  );
}
