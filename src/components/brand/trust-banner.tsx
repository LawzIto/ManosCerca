import { Lock, ShieldCheck } from "lucide-react";
import { cn } from "cn";

export function TrustBanner({
  className,
  variant = "privacy",
}: {
  className?: string;
  variant?: "privacy" | "verified";
}) {
  if (variant === "verified") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-3xl border border-[#EAF2FF] bg-[#EAF2FF] p-4 text-left shadow-sm",
          className
        )}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#E6F4EA] text-[#0B7A4B]">
          <ShieldCheck className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#062244]">Técnicos verificados</p>
          <p className="text-xs text-[#5B6B7F]">
            Validamos documentos y antecedentes para tu seguridad.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-3xl border border-[#EAF2FF] bg-[#EAF2FF] p-4 text-left shadow-sm",
        className
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#E6F4EA] text-[#0B7A4B]">
        <Lock className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#062244]">Tu número queda oculto</p>
        <p className="text-xs text-[#5B6B7F]">
          Solo se comparte cuando aceptes una cotización.
        </p>
      </div>
    </div>
  );
}
