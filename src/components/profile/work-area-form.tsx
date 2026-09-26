"use client";

import { LoaderCircle, LocateFixed, MapPinCheck } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { FieldError, FormAlert } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { type Coordinates, useGeolocation } from "@/hooks/use-geolocation";
import { updateWorkArea } from "@/lib/profile/actions";
import { type ProfileFormState, WORK_RADIUS_OPTIONS } from "@/lib/profile/schemas";

export function WorkAreaForm({
  defaults,
}: {
  defaults: (Coordinates & { radiusKm: number }) | null;
}) {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(
    updateWorkArea,
    {},
  );
  const [coords, setCoords] = useState<Coordinates | null>(defaults);
  const { locate, locating, error: geoError } = useGeolocation(setCoords);
  // Tras guardar, revalidatePath trae los nuevos `defaults` y deja de haber cambios.
  const located =
    coords != null &&
    (coords.latitude !== defaults?.latitude || coords.longitude !== defaults?.longitude);

  useEffect(() => {
    if (state.success) toast.success(state.success);
  }, [state]);

  const radius = defaults?.radiusKm ?? 10;
  const locationError = state.fieldErrors?.latitude ?? state.fieldErrors?.longitude;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && <FormAlert variant="error">{state.error}</FormAlert>}

      <div className="flex flex-col gap-2">
        {coords && (
          <>
            <input type="hidden" name="latitude" value={coords.latitude} />
            <input type="hidden" name="longitude" value={coords.longitude} />
          </>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={locate}
          disabled={locating}
          className="h-9 self-start"
        >
          {locating ? (
            <LoaderCircle className="animate-spin" aria-hidden />
          ) : coords ? (
            <MapPinCheck aria-hidden />
          ) : (
            <LocateFixed aria-hidden />
          )}
          {coords ? "Actualizar a mi ubicación actual" : "Usar mi ubicación actual"}
        </Button>
        <p className="text-xs text-muted-foreground">
          {geoError ??
            (located
              ? "Ubicación lista. Guarda para aplicarla."
              : coords
                ? "Tu zona está guardada. Solo tú la ves."
                : "Usa el lugar desde donde sueles salir a trabajar. Solo tú la ves.")}
        </p>
        <FieldError id="location-error" messages={locationError} />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Distancia máxima</legend>
        <div className="flex flex-wrap gap-2">
          {WORK_RADIUS_OPTIONS.map((km) => (
            <label key={km} className="cursor-pointer">
              <input
                type="radio"
                name="radiusKm"
                value={km}
                defaultChecked={radius === km}
                className="peer sr-only"
              />
              <span className="flex rounded-full border px-3 py-1 text-sm transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50">
                {km} km
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Button type="submit" variant="outline" className="h-10" disabled={pending || !coords}>
        {pending ? "Guardando…" : "Guardar zona de trabajo"}
      </Button>
    </form>
  );
}
