import { z } from "zod";

export const reviewSchema = z.object({
  requestId: z.uuid(),
  rating: z.coerce
    .number("Elige de 1 a 5 estrellas")
    .int("Elige de 1 a 5 estrellas")
    .min(1, "Elige de 1 a 5 estrellas")
    .max(5, "Elige de 1 a 5 estrellas"),
  comment: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.string().trim().max(1000, "Máximo 1000 caracteres").optional(),
  ),
});

export type ReviewFormState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
  values?: Record<string, string>;
};
