import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { HOME_PATH } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database";

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
    .select("*")
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
