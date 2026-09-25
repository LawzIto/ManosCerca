import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { HOME_PATH } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database";

/**
 * Columnas de `profiles` legibles por la API. `phone` no está: es privado
 * (ver migración protect_phone); usar las RPC get_my_phone / get_request_contact.
 */
export const PROFILE_COLUMNS =
  "id, role, full_name, avatar_url, bio, verification_status, rating_avg, rating_count, created_at, updated_at" as const;

/**
 * Perfil del usuario autenticado, o null. Memoizado por petición: se puede
 * llamar desde varios Server Components sin repetir consultas.
 */
export const getCurrentProfile = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  if (!userId) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .single();

  return profile;
});

/** Como `getCurrentProfile`, pero redirige a /login si no hay sesión. */
export async function requireProfile() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return profile;
}

/** Exige sesión y un rol concreto; si el rol no coincide, vuelve a /inicio. */
export async function requireRole(role: Enums<"user_role">) {
  const profile = await requireProfile();
  if (profile.role !== role) redirect(HOME_PATH);
  return profile;
}
