"use client";

import { useActionState } from "react";

import { FieldError, FormAlert } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CURRENCY } from "@/lib/format";
import { submitProposal } from "@/lib/proposals/actions";
import type { ProposalFormState } from "@/lib/proposals/schemas";

type Defaults = { price?: number; etaMinutes?: number | null; message?: string | null };

export function ProposalForm({ requestId, defaults }: { requestId: string; defaults?: Defaults }) {
  const [state, formAction, pending] = useActionState<ProposalFormState, FormData>(
    submitProposal,
    {},
  );
  const errors = state.fieldErrors;
  const values = state.values;

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="requestId" value={requestId} />
      {state.error && <FormAlert variant="error">{state.error}</FormAlert>}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="price">Tu precio ({CURRENCY})</Label>
          <Input
            id="price"
            name="price"
            type="number"
            inputMode="numeric"
            min={1}
            step="1000"
            placeholder="80000"
            required
            defaultValue={values?.price ?? defaults?.price}
            aria-invalid={Boolean(errors?.price)}
            aria-describedby="price-error"
            className="h-10"
          />
          <FieldError id="price-error" messages={errors?.price} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="etaMinutes">Llego en (min)</Label>
          <Input
            id="etaMinutes"
            name="etaMinutes"
            type="number"
            inputMode="numeric"
            min={5}
            step="5"
            placeholder="Opcional"
            defaultValue={values?.etaMinutes ?? defaults?.etaMinutes ?? undefined}
            aria-invalid={Boolean(errors?.etaMinutes)}
            aria-describedby="etaMinutes-error"
            className="h-10"
          />
          <FieldError id="etaMinutes-error" messages={errors?.etaMinutes} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="message">Mensaje para el cliente</Label>
        <Textarea
          id="message"
          name="message"
          rows={3}
          maxLength={1000}
          placeholder="Opcional. Ej.: Incluye materiales. Tengo 10 años de experiencia."
          defaultValue={values?.message ?? defaults?.message ?? undefined}
          aria-invalid={Boolean(errors?.message)}
          aria-describedby="message-error"
        />
        <FieldError id="message-error" messages={errors?.message} />
      </div>

      <Button type="submit" size="lg" className="h-11" disabled={pending}>
        {pending ? "Enviando…" : defaults ? "Volver a cotizar" : "Enviar cotización"}
      </Button>
    </form>
  );
}
