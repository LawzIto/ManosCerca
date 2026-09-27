import {
  BadgeCheck,
  CircleX,
  FileText,
  MapPin,
  type LucideIcon,
  PartyPopper,
  Play,
  Star,
} from "lucide-react";

import type { Enums } from "@/types/database";

const ICONS: Record<Enums<"notification_type">, LucideIcon> = {
  solicitud_cercana: MapPin,
  cotizacion_nueva: FileText,
  cotizacion_aceptada: PartyPopper,
  cotizacion_rechazada: CircleX,
  servicio_iniciado: Play,
  servicio_completado: BadgeCheck,
  servicio_cancelado: CircleX,
  resena_recibida: Star,
};

export function NotificationIcon({
  type,
  className,
}: {
  type: Enums<"notification_type">;
  className?: string;
}) {
  const Icon = ICONS[type];
  return <Icon className={className} aria-hidden />;
}
