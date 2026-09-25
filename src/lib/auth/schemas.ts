import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Ingresa un correo válido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
  next: z.string().optional(),
});

export const signUpSchema = z.object({
  role: z.enum(["client", "professional"], "Elige cómo usarás ManosCerca"),
  fullName: z.string().trim().min(3, "Ingresa tu nombre completo").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,20}$/, "Ingresa un teléfono válido"),
  email: z.email("Ingresa un correo válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(72),
});

export type FieldErrors = Partial<Record<string, string[]>>;

/** Estado que devuelven las Server Actions de auth a `useActionState`. */
export type AuthActionState = {
  error?: string;
  fieldErrors?: FieldErrors;
  success?: string;
  /** Valores enviados, para repoblar el formulario tras un error. */
  values?: Record<string, string>;
};
