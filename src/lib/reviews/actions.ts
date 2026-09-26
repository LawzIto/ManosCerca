"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireProfile } from "@/lib/auth/session";
import { reviewSchema, type ReviewFormState } from "@/lib/reviews/schemas";
import { createClient } from "@/lib/supabase/server";

const FORM_KEYS = ["rating", "comment"];

/** Califica a la contraparte de un servicio completado (RLS valida participantes y estado). */
export async function submitReview(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const values = Object.fromEntries(FORM_KEYS.map((key) => [key, String(formData.get(key) ?? "")]));
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const profile = await requireProfile();
  const { requestId, rating, comment } = parsed.data;

  const supabase = await createClient();
  const { data: request } = await supabase
    .from("service_requests")
    .select("client_id, professional_id, status")
    .eq("id", requestId)
    .maybeSingle();

  const revieweeId =
    request?.client_id === profile.id ? request.professional_id : request?.client_id;
  if (!request || request.status !== "completado" || !revieweeId) {
    return { error: "Solo puedes calificar servicios completados en los que participaste.", values };
  }

  const { error } = await supabase.from("reviews").insert({
    request_id: requestId,
    reviewer_id: profile.id,
    reviewee_id: revieweeId,
    rating,
    comment: comment ?? null,
  });

  if (error) {
    // 23505: unique (request_id, reviewer_id)
    if (error.code === "23505") return { error: "Ya calificaste este servicio.", values };
    console.error("submitReview", error);
    return { error: "No pudimos guardar tu calificación. Intenta de nuevo.", values };
  }

  revalidatePath(`/solicitudes/${requestId}`);
  revalidatePath(`/trabajos/${requestId}`);
  revalidatePath("/historial");
  revalidatePath("/perfil");
  return {};
}
