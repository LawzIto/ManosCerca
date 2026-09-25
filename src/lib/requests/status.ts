import type { Enums } from "@/types/database";

type RequestStatus = Enums<"request_status">;

export const REQUEST_STATUS: Record<RequestStatus, { label: string; className: string }> = {
  pendiente: {
    label: "Esperando cotizaciones",
    className: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  },
  aceptado: {
    label: "Profesional asignado",
    className: "bg-sky-500/15 text-sky-800 dark:text-sky-300",
  },
  en_progreso: {
    label: "En progreso",
    className: "bg-violet-500/15 text-violet-800 dark:text-violet-300",
  },
  completado: {
    label: "Completado",
    className: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
  },
  cancelado: {
    label: "Cancelado",
    className: "bg-muted text-muted-foreground",
  },
};

/** Estados desde los que el cliente puede cancelar (igual que en `update_request_status`). */
export const CLIENT_CANCELLABLE: RequestStatus[] = ["pendiente", "aceptado"];
