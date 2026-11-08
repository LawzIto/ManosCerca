"use client";

import { LoaderCircle, LocateFixed, MapPinCheck, Sparkles } from "lucide-react";
import { useActionState, useState } from "react";

import { CategoryIcon } from "@/components/category-icon";
import { FieldError, FormAlert } from "@/components/form-message";
import { ImageUploader } from "@/components/requests/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGeolocation } from "@/hooks/use-geolocation";
import { CURRENCY } from "@/lib/format";
import { createServiceRequest } from "@/lib/requests/actions";
import type { RequestFormState } from "@/lib/requests/schemas";
import { CATEGORY_TEMPLATES, type QuickTemplate } from "@/lib/requests/templates";
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

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(
    values?.categoryId ? Number(values.categoryId) : defaultCategoryId,
  );
  const [title, setTitle] = useState(values?.title ?? "");
  const [description, setDescription] = useState(values?.description ?? "");

  const { coords, setCoords } = useLocationStore();
  const { locate, locating, error: geoError } = useGeolocation(setCoords);

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategoryId);
  const availableTemplates: QuickTemplate[] = selectedCategoryObj
    ? CATEGORY_TEMPLATES[selectedCategoryObj.slug] ?? []
    : [];

  const applyTemplate = (template: QuickTemplate) => {
    setTitle(template.title);
    setDescription(template.description);
  };

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
                checked={selectedCategoryId === category.id}
                onChange={() => setSelectedCategoryId(category.id)}
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

      {/* Sugerencias rápidas basadas en la categoría elegida */}
      {availableTemplates.length > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" aria-hidden />
            <span>Opciones rápidas para autocompletar:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {availableTemplates.map((template) => (
              <button
                key={template.label}
                type="button"
                onClick={() => applyTemplate(template)}
                className="rounded-full border border-primary/25 bg-white px-3 py-1 text-xs font-medium text-[#062244] shadow-xs transition-colors hover:border-primary hover:bg-primary/10 active:scale-95"
              >
                + {template.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          name="title"
          placeholder="Ej.: Fuga de agua en el lavadero"
          maxLength={120}
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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

      <div className="flex flex-col gap-2">
        <Label>
          Fotos del problema{" "}
          <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <p className="text-xs text-muted-foreground -mt-1">
          Las imágenes ayudan a los profesionales a cotizar mejor y llegar preparados.
        </p>
        <ImageUploader fieldName="imageUrl" />
        <FieldError id="imageUrl-error" messages={errors?.imageUrls} />
      </div>

      <Button type="submit" size="lg" className="h-11" disabled={pending}>
        {pending ? "Publicando…" : "Publicar solicitud"}
      </Button>
    </form>
  );
}
