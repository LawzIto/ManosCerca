import { z } from "zod";

import { signUpSchema } from "@/lib/auth/schemas";

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const profileSchema = z.object({
  fullName: signUpSchema.shape.fullName,
  phone: signUpSchema.shape.phone,
  bio: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.string().trim().max(500, "Máximo 500 caracteres").optional(),
  ),
});

export const categoriesSchema = z
  .array(z.coerce.number().int().positive())
  .max(20, "Demasiadas especialidades");

export type ProfileFormState = {
  error?: string;
  success?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
  values?: Record<string, string>;
};
