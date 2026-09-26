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
    <section className="space-y-4 rounded-lg border p-4">
      {given ? (
        <div className="space-y-1.5">
          <h2 className="font-semibold">Tu calificación</h2>
          <Stars rating={given.rating} />
          {given.comment && <p className="text-sm text-muted-foreground">{given.comment}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-center">
            <h2 className="text-lg font-semibold">¡Servicio completado!</h2>
            <p className="text-sm text-muted-foreground">
              Tu calificación ayuda a toda la comunidad.
            </p>
          </div>
          <ReviewForm requestId={requestId} revieweeName={counterpartName} />
        </div>
      )}

      <div className="space-y-1.5 border-t pt-4">
        <h2 className="text-sm font-semibold">Calificación de {counterpartName}</h2>
        {received ? (
          <>
            <div className="flex items-center gap-2">
              <Stars rating={received.rating} />
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(received.created_at)}
              </span>
            </div>
            {received.comment && (
              <p className="text-sm text-muted-foreground">{received.comment}</p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Aún no te ha calificado.</p>
        )}
      </div>
    </section>
  );
}
