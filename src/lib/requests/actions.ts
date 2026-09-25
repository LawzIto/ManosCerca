"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth/session";
import { createRequestSchema, type RequestFormState } from "@/lib/requests/schemas";
import { createClient } from "@/lib/supabase/server";

const FORM_KEYS = ["categoryId", "title", "description", "address", "budgetEstimate"];

export async function createServiceRequest(
  _prev: RequestFormState,
  formData: FormData,
): Promise<RequestFormState> {
  const values = Object.fromEntries(FORM_KEYS.map((key) => [key, String(formData.get(key) ?? "")]));
  const parsed = createRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const profile = await requireRole("client");
  const { categoryId, title, description, address, budgetEstimate, latitude, longitude } =
    parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("service_requests")
    .insert({
      client_id: profile.id,
      category_id: categoryId,
      title,
      description,
      address,
      budget_estimate: budgetEstimate ?? null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("createServiceRequest", error);
    return { error: "No pudimos publicar tu solicitud. Intenta de nuevo.", values };
  }

  revalidatePath("/solicitudes");
  redirect(`/solicitudes/${data.id}`);
}

export async function cancelServiceRequest(requestId: string): Promise<{ error?: string }> {
  await requireRole("client");
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_request_status", {
    p_request_id: requestId,
    p_status: "cancelado",
  });

  if (error) {
    console.error("cancelServiceRequest", error);
    return { error: "No se pudo cancelar la solicitud." };
  }

  revalidatePath("/solicitudes");
  revalidatePath(`/solicitudes/${requestId}`);
  return {};
}
