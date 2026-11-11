"use client";

import { MapPin, Navigation, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type WorkerCoords = { lat: number; lng: number } | null;

interface Props {
  requestId: string;
  /** Coordenadas de destino (dirección del cliente) si están disponibles. */
  clientLat?: number | null;
  clientLng?: number | null;
  clientAddress: string;
}

/**
 * Componente para el PROFESIONAL.
 * - Pide permiso de GPS.
 * - Publica su posición en `tracking_locations` cada 10 segundos mientras esté activo.
 * - Muestra un botón directo a Google Maps / Waze con ruta hacia el cliente.
 */
export function WorkerTracker({ requestId, clientLat, clientLng, clientAddress }: Props) {
  const [sharing, setSharing] = useState(false);
  const [coords, setCoords] = useState<WorkerCoords>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNav, setShowNav] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const supabase = createClient();

  const pushLocation = useCallback(
    async (lat: number, lng: number) => {
      await supabase.from("tracking_locations").upsert(
        { request_id: requestId, worker_latitude: lat, worker_longitude: lng },
        { onConflict: "request_id" },
      );
    },
    [requestId, supabase],
  );

  const startSharing = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("Tu dispositivo no soporta geolocalización.");
      return;
    }
    setError(null);
    setSharing(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });
        pushLocation(lat, lng);
      },
      (err) => {
        setError(err.code === 1 ? "Permiso de ubicación denegado." : "Error al obtener ubicación.");
        setSharing(false);
      },
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 },
    );

    // También publica cada 10 s aunque watchPosition no dispare
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });
        pushLocation(lat, lng);
      });
    }, 10_000);
  }, [pushLocation]);

  const stopSharing = useCallback(() => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    if (intervalRef.current !== null) clearInterval(intervalRef.current);
    watchIdRef.current = null;
    intervalRef.current = null;
    setSharing(false);
    setCoords(null);
  }, []);

  // Limpiar al desmontar
  useEffect(() => () => stopSharing(), [stopSharing]);

  // URLs de navegación hacia el cliente
  const destination = clientLat && clientLng
    ? `${clientLat},${clientLng}`
    : encodeURIComponent(clientAddress);

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
  const wazeUrl = clientLat && clientLng
    ? `https://waze.com/ul?ll=${clientLat},${clientLng}&navigate=yes`
    : `https://waze.com/ul?q=${encodeURIComponent(clientAddress)}&navigate=yes`;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#EAF2FF] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-full bg-[#EAF2FF]">
          <Navigation className="size-4 text-[#0165F0]" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold text-[#062244]">Ubicación en tiempo real</p>
          <p className="text-xs text-[#5B6B7F]">El cliente verá por dónde vas</p>
        </div>
        {sharing && (
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
            <span className="size-1.5 animate-pulse rounded-full bg-green-500" />
            Compartiendo
          </span>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {!sharing ? (
        <Button
          type="button"
          onClick={startSharing}
          className="h-10 rounded-full bg-[#0165F0] text-white hover:brightness-95"
        >
          <MapPin className="size-4" aria-hidden />
          Compartir mi ubicación al cliente
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={stopSharing}
          className="h-10 rounded-full border-destructive text-destructive hover:bg-destructive/5"
        >
          <X className="size-4" aria-hidden />
          Dejar de compartir
        </Button>
      )}

      {/* Navegación hacia el cliente */}
      <div className="border-t border-[#EAF2FF] pt-3">
        <p className="mb-2 text-xs font-medium text-[#5B6B7F]">Cómo llegar al cliente</p>
        {!showNav ? (
          <Button
            type="button"
            variant="outline"
            className="h-9 w-full rounded-full text-sm"
            onClick={() => setShowNav(true)}
          >
            <Navigation className="size-4" aria-hidden />
            Ver ruta al cliente
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="overflow-hidden rounded-xl border border-[#EAF2FF]">
              <iframe
                title="Mapa ruta al cliente"
                src={
                  coords && clientLat && clientLng
                    ? `https://maps.google.com/maps?saddr=${coords.lat},${coords.lng}&daddr=${clientLat},${clientLng}&output=embed`
                    : clientLat && clientLng
                      ? `https://maps.google.com/maps?q=${clientLat},${clientLng}&z=15&output=embed`
                      : `https://maps.google.com/maps?q=${encodeURIComponent(clientAddress)}&z=15&output=embed`
                }
                className="h-52 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <p className="px-3 py-1.5 text-[10px] text-[#5B6B7F]">
                {coords ? "Ruta desde tu posición GPS actual." : "Destino del cliente."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-full border border-[#EAF2FF] bg-white px-3 py-2 text-xs font-semibold text-[#062244] shadow-xs transition hover:bg-[#F3F6FA]"
              >
                <span aria-hidden>🗺️</span> Google Maps
              </a>
              <a
                href={wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-full border border-[#EAF2FF] bg-white px-3 py-2 text-xs font-semibold text-[#062244] shadow-xs transition hover:bg-[#F3F6FA]"
              >
                <span aria-hidden>🚗</span> Waze
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

