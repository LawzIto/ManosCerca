"use client";

import { useState } from "react";

export type Coordinates = { latitude: number; longitude: number };

const GEO_ERRORS: Record<number, string> = {
  1: "Permite el acceso a tu ubicación para usar esta opción.",
  2: "No pudimos obtener tu ubicación.",
  3: "La ubicación tardó demasiado. Intenta de nuevo.",
};

/** Pide la ubicación actual del navegador y expone el estado de carga y error. */
export function useGeolocation(onLocate: (coords: Coordinates) => void) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string>();

  function locate() {
    if (!("geolocation" in navigator)) {
      setError("Tu navegador no permite obtener la ubicación.");
      return;
    }
    setLocating(true);
    setError(undefined);
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        onLocate({ latitude, longitude });
        setLocating(false);
      },
      (geoError) => {
        setError(GEO_ERRORS[geoError.code] ?? GEO_ERRORS[2]);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  return { locate, locating, error };
}
