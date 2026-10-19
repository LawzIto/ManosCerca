import { Check } from "lucide-react";
import { cn } from "cn";
import type { Enums } from "@/types/database";

type Status = Enums<"request_status">;

const STEPS: {
  status: Status;
  label: string;
  stepNumber: number;
  activeBg: string;
  activeText: string;
}[] = [
  {
    status: "pendiente",
    label: "Pendiente",
    stepNumber: 1,
    activeBg: "bg-[#F5A623]",
    activeText: "text-[#062244]",
  },
  {
    status: "aceptado",
    label: "Aceptado",
    stepNumber: 2,
    activeBg: "bg-[#0165F0]",
    activeText: "text-white",
  },
  {
    status: "en_progreso",
    label: "En progreso",
    stepNumber: 3,
    activeBg: "bg-[#5AA2FF]",
    activeText: "text-[#062244]",
  },
  {
    status: "completado",
    label: "Completado",
    stepNumber: 4,
    activeBg: "bg-[#0B7A4B]",
    activeText: "text-white",
  },
];

const STATUS_ORDER: Record<Status, number> = {
  pendiente: 1,
  aceptado: 2,
  en_progreso: 3,
  completado: 4,
  cancelado: 0,
};

export function ServiceStepper({ currentStatus }: { currentStatus: Status }) {
  if (currentStatus === "cancelado") {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-[#FCE8E8] p-3 text-center text-sm font-medium text-[#D93A3F]">
        Esta solicitud fue cancelada
      </div>
    );
  }

  const currentStep = STATUS_ORDER[currentStatus] ?? 1;

  return (
    <div className="w-full rounded-3xl border border-[#EAF2FF] bg-white p-4 shadow-[0_4px_20px_rgba(6,34,68,0.05)]">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isPassed = currentStep > step.stepNumber;
          const isCurrent = currentStep === step.stepNumber;

          return (
            <div key={step.status} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all",
                    isPassed
                      ? "bg-[#0B7A4B] text-white"
                      : isCurrent
                        ? `${step.activeBg} ${step.activeText} ring-4 ring-[#0165F0]/15`
                        : "bg-[#F3F6FA] text-[#5B6B7F] border border-[#D0D9E8]"
                  )}
                  aria-label={`Paso ${step.stepNumber}: ${step.label}`}
                >
                  {isPassed ? <Check className="size-4 stroke-[3]" /> : step.stepNumber}
                </div>
                <span
                  className={cn(
                    "text-[11px] leading-tight text-center font-medium",
                    isCurrent
                      ? "text-[#062244] font-semibold"
                      : isPassed
                        ? "text-[#0B7A4B]"
                        : "text-[#5B6B7F]"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 mb-4 h-0.5 flex-1 transition-all",
                    currentStep > index + 1 ? "bg-[#0B7A4B]" : "bg-[#D0D9E8]/60"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
