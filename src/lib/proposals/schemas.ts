import { z } from "zod";

const emptyToUndefined = (value: unknown) => (value === "" || value == null ? undefined : value);

export const proposalSchema = z.object({
  requestId: z.uuid(),
  price: z.coerce
    .number("Ingresa el valor de tu cotización")
    .int("Ingresa un valor sin decimales")
    .min(1, "Ingresa el valor de tu cotización")
    .max(99_999_999, "El valor es demasiado alto"),
  etaMinutes: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number("Ingresa los minutos")
      .int("Ingresa los minutos")
      .min(5, "Mínimo 5 minutos")
      .max(1440, "Máximo 24 horas (1440 minutos)")
      .optional(),
  ),
  message: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(1000, "Máximo 1000 caracteres").optional(),
  ),
});

export type ProposalFormState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
  values?: Record<string, string>;
};
