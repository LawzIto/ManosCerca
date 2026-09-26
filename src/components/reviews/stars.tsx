import { cn } from "cn";
import { Star } from "lucide-react";

/** Estrellas de solo lectura (1–5). */
export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span
      role="img"
      aria-label={`${rating} de 5 estrellas`}
      className={cn("inline-flex items-center gap-0.5", className)}
    >
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          aria-hidden
          className={cn(
            "size-4",
            value <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/40",
          )}
        />
      ))}
    </span>
  );
}

/** "4.8 (12)" o "Nuevo" si aún no tiene calificaciones. */
export function RatingSummary({
  avg,
  count,
  className,
}: {
  avg: number;
  count: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden />
      {count > 0 ? `${Number(avg).toFixed(1)} (${count})` : "Nuevo"}
    </span>
  );
}
