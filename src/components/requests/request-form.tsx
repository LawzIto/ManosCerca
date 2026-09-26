"use client";

import { LoaderCircle, LocateFixed, MapPinCheck } from "lucide-react";
import { useActionState } from "react";

import { CategoryIcon } from "@/components/category-icon";
import { FieldError, FormAlert } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGeolocation } from "@/hooks/use-geolocation";
import { CURRENCY } from "@/lib/format";
import { createServiceRequest } from "@/lib/requests/actions";
import type { RequestFormState } from "@/lib/requests/schemas";
import { useLocationStore } from "@/stores/location-store";
import type { Tables } from "@/types/database";

type Category = Pick<Tables<"categories">, "id" | "slug" | "name">;

export function RequestForm({
  categories,
  defaultCategoryId,
}: {
  categories: Category[];
  defaultCategoryId?: number;
}) {
  const [state, formAction, pending] = useActionState<RequestFormState, FormData>(
    createServiceRequest,
    {},
  );
  const errors = state.fieldErrors;
  const values = state.values;

  const { coords, setCoords } = useLocationStore();
  const { locate, locating, error: geoError } = useGeolocation(setCoords);

  const selectedCategory = values?.categoryId ?? defaultCategoryId?.toString();

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      {state.error && <FormAlert variant="error">{state.error}</FormAlert>}

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">¿Qué necesitas?</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {categories.map((category) => (
            <label key={category.id} className="cursor-pointer">
              <input
                type="radio"
                name="categoryId"
                value={category.id}
                defaultChecked={selectedCategory === category.id.toString()}
                className="peer sr-only"
              />
              <span className="flex h-full flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors peer-checked:border-primary peer-checked:bg-primary/5 peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50">
                <CategoryIcon slug={category.slug} className="size-5" />
                <span className="text-xs font-medium">{category.name}</span>
              </span>
            </label>
          ))}
        </div>
        <FieldError id="categoryId-error" messages={errors?.categoryId} />
      </fieldset>

      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          name="title"
          placeholder="Ej.: Fuga de agua en el lavadero"
          maxLength={120}
          required
          defaultValue={values?.title}
          aria-invalid={Boolean(errors?.title)}
          aria-describedby="title-error"
          className="h-10"
        />
        <FieldError id="title-error" messages={errors?.title} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Describe el problema</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="¿Qué pasó? ¿Desde cuándo? Cualquier detalle ayuda a cotizar mejor."
          rows={4}
          maxLength={2000}
          required
          defaultValue={values?.description}
          aria-invalid={Boolean(errors?.description)}
          aria-describedby="description-error"
        />
        <FieldError id="description-error" messages={errors?.description} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          name="address"
          autoComplete="street-address"
          placeholder="Calle o carrera, número, barrio y referencia"
          required
          defaultValue={values?.address}
          aria-invalid={Boolean(errors?.address)}
          aria-describedby="address-error"
          className="h-10"
        />
        <FieldError id="address-error" messages={errors?.address} />

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
          {coords ? "Ubicación agregada" : "Usar mi ubicación actual"}
        </Button>
        <p className="text-xs text-muted-foreground">
          {geoError ??
            "Recomendado: los profesionales ven primero las solicitudes cercanas a su zona."}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="budgetEstimate">Presupuesto estimado ({CURRENCY})</Label>
        <Input
          id="budgetEstimate"
          name="budgetEstimate"
          type="number"
          inputMode="numeric"
          min={0}
          step="1000"
          placeholder="Opcional, ej.: 80000"
          defaultValue={values?.budgetEstimate}
          aria-invalid={Boolean(errors?.budgetEstimate)}
          aria-describedby="budgetEstimate-error"
          className="h-10"
        />
        <FieldError id="budgetEstimate-error" messages={errors?.budgetEstimate} />
      </div>

      <Button type="submit" size="lg" className="h-11" disabled={pending}>
        {pending ? "Publicando…" : "Publicar solicitud"}
      </Button>
    </form>
  );
}
