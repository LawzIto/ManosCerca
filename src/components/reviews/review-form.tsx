"use client";

import { cn } from "cn";
import { Star } from "lucide-react";
import { useActionState, useState } from "react";

import { FieldError, FormAlert } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitReview } from "@/lib/reviews/actions";
import type { ReviewFormState } from "@/lib/reviews/schemas";

const LABELS = ["", "Muy malo", "Malo", "Regular", "Bueno", "Excelente"];

export function ReviewForm({ requestId, revieweeName }: { requestId: string; revieweeName: string }) {
  const [state, formAction, pending] = useActionState<ReviewFormState, FormData>(submitReview, {});
  const errors = state.fieldErrors;
  const [rating, setRating] = useState(Number(state.values?.rating) || 0);
  const [hover, setHover] = useState(0);
  const shown = hover || rating;

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="requestId" value={requestId} />
      {state.error && <FormAlert variant="error">{state.error}</FormAlert>}

      <fieldset className="flex flex-col items-center gap-2">
        <legend className="mb-2 w-full text-center text-sm font-medium">
          ¿Cómo te fue con {revieweeName}?
        </legend>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <label
              key={value}
              className="cursor-pointer rounded-md p-1 has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
              onMouseEnter={() => setHover(value)}
            >
              <input
                type="radio"
                name="rating"
                value={value}
                checked={rating === value}
                onChange={() => setRating(value)}
                className="sr-only"
                aria-label={`${value} ${value === 1 ? "estrella" : "estrellas"}: ${LABELS[value]}`}
              />
              <Star
                aria-hidden
                className={cn(
                  "size-9 transition-colors",
                  value <= shown ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
                )}
              />
            </label>
          ))}
        </div>
        <p className="h-5 text-sm text-muted-foreground" aria-live="polite">
          {LABELS[shown]}
        </p>
        <FieldError id="rating-error" messages={errors?.rating} />
      </fieldset>

      <div className="flex flex-col gap-2">
        <Label htmlFor="comment">Comentario</Label>
        <Textarea
          id="comment"
          name="comment"
          rows={3}
          maxLength={1000}
          placeholder="Opcional. Cuéntale a otros cómo fue el servicio."
          defaultValue={state.values?.comment}
          aria-invalid={Boolean(errors?.comment)}
          aria-describedby="comment-error"
        />
        <FieldError id="comment-error" messages={errors?.comment} />
      </div>

      <Button type="submit" size="lg" className="h-11" disabled={pending || rating === 0}>
        {pending ? "Enviando…" : "Enviar calificación"}
      </Button>
    </form>
  );
}
