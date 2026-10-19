import { ReviewForm } from "@/components/reviews/review-form";
import { Stars } from "@/components/reviews/stars";
import { formatRelativeTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

/**
 * Calificación mutua de un servicio completado: el formulario para calificar a
 * la contraparte (o la calificación ya enviada) y la que el usuario recibió.
 */
export async function ReviewSection({
  requestId,
  userId,
  counterpartName,
}: {
  requestId: string;
  userId: string;
  counterpartName: string;
}) {
  const supabase = await createClient();
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("id, reviewer_id, rating, comment, created_at")
    .eq("request_id", requestId);
  if (error) throw error;

  const given = reviews.find((review) => review.reviewer_id === userId);
  const received = reviews.find((review) => review.reviewer_id !== userId);

  return (
    <section className="space-y-5 rounded-3xl border border-[#EAF2FF] bg-white p-6 shadow-[0_4px_20px_rgba(6,34,68,0.05)]">
      {given ? (
        <div className="space-y-2">
          <h2 className="text-base font-bold text-[#062244]">Tu calificación</h2>
          <Stars rating={given.rating} />
          {given.comment && <p className="text-sm text-[#5B6B7F]">{given.comment}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-center">
            <h2 className="text-lg font-bold text-[#062244]">¡Servicio completado!</h2>
            <p className="text-sm text-[#5B6B7F]">
              Tu calificación ayuda a toda la comunidad.
            </p>
          </div>
          <ReviewForm requestId={requestId} revieweeName={counterpartName} />
        </div>
      )}

      <div className="space-y-2 border-t border-[#EAF2FF] pt-4">
        <h2 className="text-sm font-semibold text-[#062244]">Calificación de {counterpartName}</h2>
        {received ? (
          <>
            <div className="flex items-center gap-2">
              <Stars rating={received.rating} />
              <span className="text-xs text-[#5B6B7F]">
                {formatRelativeTime(received.created_at)}
              </span>
            </div>
            {received.comment && (
              <p className="text-sm text-[#5B6B7F]">{received.comment}</p>
            )}
          </>
        ) : (
          <p className="text-sm text-[#5B6B7F]">Aún no te ha calificado.</p>
        )}
      </div>
    </section>
  );
}
