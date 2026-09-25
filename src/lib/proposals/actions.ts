"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/session";
import { proposalSchema, type ProposalFormState } from "@/lib/proposals/schemas";
import { createClient } from "@/lib/supabase/server";

const FORM_KEYS = ["price", "etaMinutes", "message"];

function revalidateJob(requestId: string) {
  revalidatePath("/trabajos");
  revalidatePath("/trabajos/mios");
  revalidatePath(`/trabajos/${requestId}`);
}

/** Crea la cotización, o reactiva la que el profesional había retirado. */
export async function submitProposal(
  _prev: ProposalFormState,
  formData: FormData,
): Promise<ProposalFormState> {
  const values = Object.fromEntries(FORM_KEYS.map((key) => [key, String(formData.get(key) ?? "")]));
  const parsed = proposalSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const profile = await requireRole("professional");
  const { requestId, price, etaMinutes, message } = parsed.data;
  const fields = { price, eta_minutes: etaMinutes ?? null, message: message ?? null };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("proposals")
    .select("id")
    .eq("request_id", requestId)
    .eq("professional_id", profile.id)
    .maybeSingle();

  const { error } = existing
    ? await supabase
        .from("proposals")
        .update({ ...fields, status: "pendiente" })
        .eq("id", existing.id)
    : await supabase
        .from("proposals")
        .insert({ ...fields, request_id: requestId, professional_id: profile.id });

  if (error) {
    console.error("submitProposal", error);
    return {
      error: "No pudimos enviar tu cotización. Es posible que la solicitud ya no esté disponible.",
      values,
    };
  }

  revalidateJob(requestId);
  return {};
}

export async function withdrawProposal(
  proposalId: string,
  requestId: string,
): Promise<{ error?: string }> {
  await requireRole("professional");
  const supabase = await createClient();
  const { error } = await supabase
    .from("proposals")
    .update({ status: "retirada" })
    .eq("id", proposalId);

  if (error) {
    console.error("withdrawProposal", error);
    return { error: "No se pudo retirar la cotización." };
  }

  revalidateJob(requestId);
  return {};
}
