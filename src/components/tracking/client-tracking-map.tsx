"use client";

import { LoaderCircle, MapPin, Navigation, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface TrackingData {
  worker_latitude: number;
  worker_longitude: number;
}

interface Props {
  requestId: string;
  workerName: string;
  /** Dirección del servicio (para mostrar en el mapa). */
  clientAddress: string;
  clientLat?: number | null;
  clientLng?: number | null;
  /** Ubicación inicial del trabajador (cargada desde el servidor si ya existe). */
  initialTracking?: TrackingData | null;
}

/**
 * Componente para el CLIENTE.
 * - Se suscribe a Supabase Realtime para recibir actualizaciones de posición del trabajador.
 * - Muestra un mapa embebido con la ubicación del trabajador en tiempo real.
 */
export function ClientTrackingMap({
  requestId,
  workerName,
  clientAddress,
  clientLat,
  clientLng,
  initialTracking,
}: Props) {
  const [tracking, setTracking] = useState<TrackingData | null>(initialTracking ?? null);
  const [open, setOpen] = useState(false);
  const supabase = createClient();

  // Suscripción Realtime a cambios en tracking_locations
  useEffect(() => {
    const channel = supabase
      .channel(`tracking-${requestId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tracking_locations",
          filter: `request_id=eq.${requestId}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setTracking(null);
          } else {
            const row = payload.new as TrackingData;
            setTracking({ worker_latitude: row.worker_latitude, worker_longitude: row.worker_longitude });
          }
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [requestId, supabase]);

  const hasWorkerLocation = Boolean(tracking);
  const hasClientLocation = Boolean(clientLat && clientLng);

  // URL del mapa embebido para el cliente (no requiere API key)
  const buildMapUrl = () => {
    if (!tracking) return null;
    const { worker_latitude: wLat, worker_longitude: wLng } = tracking;

    if (hasClientLocation) {
      // Ruta entre trabajador y cliente
      return `https://maps.google.com/maps?saddr=${wLat},${wLng}&daddr=${clientLat},${clientLng}&output=embed`;
    }
    // Sin coordenadas del cliente: solo posición del trabajador
    return `https://maps.google.com/maps?q=${wLat},${wLng}&z=15&output=embed`;
  };

  const mapUrl = buildMapUrl();

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#EAF2FF] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-full bg-[#EAF2FF]">
          <Navigation className="size-4 text-[#0165F0]" aria-hidden />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#062244]">Seguimiento del profesional</p>
          <p className="text-xs text-[#5B6B7F]">
            {hasWorkerLocation
              ? `${workerName} está compartiendo su ubicación`
              : `Esperando que ${workerName} comparta su ubicación…`}
          </p>
        </div>
        {hasWorkerLocation && (
          <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 shrink-0">
            <span className="size-1.5 animate-pulse rounded-full bg-green-500" />
            En camino
          </span>
        )}
      </div>

      {!hasWorkerLocation ? (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-[#F3F6FA] p-5 text-xs text-[#5B6B7F]">
          <LoaderCircle className="size-4 animate-spin text-[#0165F0]" aria-hidden />
          <span>El profesional aún no activó el seguimiento de ruta</span>
        </div>
      ) : !open ? (
        <Button
          type="button"
          onClick={() => setOpen(true)}
          className="h-10 rounded-full bg-[#0165F0] text-white hover:brightness-95"
        >
          <MapPin className="size-4" aria-hidden />
          Ver dónde está {workerName}
        </Button>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="overflow-hidden rounded-xl border border-[#EAF2FF]">
            {mapUrl ? (
              <iframe
                key={`${tracking?.worker_latitude}-${tracking?.worker_longitude}`}
                title={`Ubicación de ${workerName}`}
                src={mapUrl}
                className="h-64 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            ) : null}
          </div>
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-[#5B6B7F]">
              <span className="size-1.5 mr-1 inline-block animate-pulse rounded-full bg-green-500" />
              Posición en tiempo real
            </p>
            <div className="flex items-center gap-3">
              {tracking && (
                <a
                  href={
                    clientLat && clientLng
                      ? `https://www.google.com/maps/dir/?api=1&origin=${tracking.worker_latitude},${tracking.worker_longitude}&destination=${clientLat},${clientLng}&travelmode=driving`
                      : `https://www.google.com/maps/search/?api=1&query=${tracking.worker_latitude},${tracking.worker_longitude}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#0165F0] hover:underline"
                >
                  Abrir en Google Maps
                </a>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1 text-xs text-[#5B6B7F] hover:text-[#062244]"
              >
                <X className="size-3" aria-hidden />
                Cerrar mapa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

