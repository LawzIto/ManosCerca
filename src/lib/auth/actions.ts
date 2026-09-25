"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { authErrorMessage } from "@/lib/auth/errors";
import { HOME_PATH, safeNextPath } from "@/lib/auth/redirect";
import { loginSchema, signUpSchema, type AuthActionState } from "@/lib/auth/schemas";
import { createClient } from "@/lib/supabase/server";

function formValues(formData: FormData, keys: string[]) {
  return Object.fromEntries(keys.map((key) => [key, String(formData.get(key) ?? "")]));
}

async function siteOrigin() {
  const requestHeaders = await headers();
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    requestHeaders.get("origin") ??
    `https://${requestHeaders.get("host")}`
  );
}

export async function signIn(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const values = formValues(formData, ["email"]);
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return { error: authErrorMessage(error), values };

  redirect(safeNextPath(parsed.data.next));
}

export async function signUp(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const values = formValues(formData, ["role", "fullName", "phone", "email"]);
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const { role, fullName, phone, email, password } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Lo lee el trigger handle_new_user para crear el perfil.
      data: { role, full_name: fullName, phone },
      emailRedirectTo: `${await siteOrigin()}/auth/confirm?next=${HOME_PATH}`,
    },
  });
  if (error) return { error: authErrorMessage(error), values };

  // Con confirmación de correo desactivada, Supabase devuelve la sesión directamente.
  if (data.session) redirect(HOME_PATH);

  return {
    success: `Te enviamos un enlace a ${email}. Ábrelo para activar tu cuenta.`,
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
