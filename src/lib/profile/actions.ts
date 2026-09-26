"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireProfile, requireRole } from "@/lib/auth/session";
import {
  AVATAR_MAX_BYTES,
  AVATAR_TYPES,
  categoriesSchema,
  profileSchema,
  type ProfileFormState,
} from "@/lib/profile/schemas";
import { createClient } from "@/lib/supabase/server";

const FORM_KEYS = ["fullName", "phone", "bio"];

export async function updateProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const values = Object.fromEntries(FORM_KEYS.map((key) => [key, String(formData.get(key) ?? "")]));
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const avatar = formData.get("avatar");
  const hasAvatar = avatar instanceof File && avatar.size > 0;
  if (hasAvatar && !AVATAR_TYPES.includes(avatar.type)) {
    return { fieldErrors: { avatar: ["Usa una imagen JPG, PNG o WebP"] }, values };
  }
  if (hasAvatar && avatar.size > AVATAR_MAX_BYTES) {
    return { fieldErrors: { avatar: ["La imagen no puede pesar más de 2 MB"] }, values };
  }

  const profile = await requireProfile();
  const { fullName, phone, bio } = parsed.data;
  const supabase = await createClient();

  let avatarUrl: string | undefined;
  if (hasAvatar) {
    // Ruta fija por usuario (las políticas de Storage exigen `<uid>/…`); `?v=` evita la caché.
    const path = `${profile.id}/avatar`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, avatar, { upsert: true, contentType: avatar.type, cacheControl: "3600" });
    if (uploadError) {
      console.error("updateProfile upload", uploadError);
      return { error: "No pudimos subir tu foto. Intenta con otra imagen.", values };
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    avatarUrl = `${data.publicUrl}?v=${Date.now()}`;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
      ...(profile.role === "professional" ? { bio: bio ?? null } : {}),
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    })
    .eq("id", profile.id);

  if (error) {
    console.error("updateProfile", error);
    return { error: "No pudimos guardar tus datos. Intenta de nuevo.", values };
  }

  // El layout muestra el avatar y el nombre en todas las páginas.
  revalidatePath("/", "layout");
  return { success: "Perfil actualizado" };
}

export async function updateMyCategories(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const parsed = categoriesSchema.safeParse(formData.getAll("categoryIds"));
  if (!parsed.success) return { error: "Selección de especialidades no válida." };

  await requireRole("professional");
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_my_categories", { p_category_ids: parsed.data });

  if (error) {
    console.error("updateMyCategories", error);
    return { error: "No pudimos guardar tus especialidades. Intenta de nuevo." };
  }

  revalidatePath("/perfil");
  revalidatePath("/trabajos");
  return { success: "Especialidades actualizadas" };
}
