import type { Enums } from "@/types/database";

type RequestStatus = Enums<"request_status">;

export const REQUEST_STATUS: Record<RequestStatus, { label: string; className: string }> = {
  pendiente: {
    label: "Esperando cotizaciones",
    className: "bg-[#FEF6E6] text-[#062244] border-transparent font-medium",
  },
  aceptado: {
    label: "Profesional asignado",
    className: "bg-[#EAF2FF] text-[#0165F0] border-transparent font-medium",
  },
  en_progreso: {
    label: "En progreso",
    className: "bg-[#EAF2FF] text-[#062244] border-transparent font-medium",
  },
  completado: {
    label: "Completado",
    className: "bg-[#E6F4EA] text-[#0B7A4B] border-transparent font-medium",
  },
  cancelado: {
    label: "Cancelado",
    className: "bg-[#FCE8E8] text-[#D93A3F] border-transparent font-medium",
  },
};

/** Estados desde los que el cliente puede cancelar (igual que en `update_request_status`). */
export const CLIENT_CANCELLABLE: RequestStatus[] = ["pendiente", "aceptado"];
