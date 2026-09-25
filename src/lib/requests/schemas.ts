import { z } from "zod";

/** Campo opcional de formulario: la cadena vacía se trata como ausente. */
const optionalNumber = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === "" || value == null ? undefined : value), schema.optional());

export const createRequestSchema = z.object({
  categoryId: z.coerce.number("Elige una categoría").int().positive("Elige una categoría"),
  title: z
    .string()
    .trim()
    .min(3, "Describe el problema en pocas palabras")
    .max(120, "Máximo 120 caracteres"),
  description: z
    .string()
    .trim()
    .min(10, "Cuéntanos un poco más (mínimo 10 caracteres)")
    .max(2000, "Máximo 2000 caracteres"),
  address: z.string().trim().min(5, "Ingresa la dirección del servicio").max(200),
  budgetEstimate: optionalNumber(
    z.coerce.number("Ingresa un monto válido").min(0, "El monto no puede ser negativo").max(99_999_999),
  ),
  latitude: optionalNumber(z.coerce.number().min(-90).max(90)),
  longitude: optionalNumber(z.coerce.number().min(-180).max(180)),
});

export type RequestFormState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
  values?: Record<string, string>;
};
