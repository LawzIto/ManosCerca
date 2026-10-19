"use client";

import { HardHat, House } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

import { FieldError, FormAlert } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth/actions";
import type { AuthActionState } from "@/lib/auth/schemas";

const ROLES = [
  { value: "client", label: "Necesito un servicio", hint: "Soy cliente", Icon: House },
  { value: "professional", label: "Ofrezco servicios", hint: "Soy profesional", Icon: HardHat },
] as const;

const FIELDS = [
  { name: "fullName", label: "Nombre completo", type: "text", autoComplete: "name" },
  { name: "phone", label: "Teléfono", type: "tel", autoComplete: "tel", inputMode: "tel" },
  { name: "email", label: "Correo", type: "email", autoComplete: "email", inputMode: "email" },
] as const;

export function SignUpForm({ defaultRole }: { defaultRole?: "client" | "professional" }) {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(signUp, {});
  const errors = state.fieldErrors;
  const values = state.values;

  if (state.success) {
    return <FormAlert variant="success">{state.success}</FormAlert>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.error && <FormAlert variant="error">{state.error}</FormAlert>}

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">¿Cómo usarás ManosCerca?</legend>
        <div className="grid grid-cols-2 gap-3">
          {ROLES.map(({ value, label, hint, Icon }) => (
            <label key={value} className="cursor-pointer">
              <input
                type="radio"
                name="role"
                value={value}
                defaultChecked={(values?.role || defaultRole || "client") === value}
                className="peer sr-only"
              />
              <span className="flex h-full flex-col gap-1.5 rounded-2xl border border-[#EAF2FF] bg-[#F3F6FA] p-3.5 transition-all peer-checked:border-[#0165F0] peer-checked:bg-[#EAF2FF] peer-checked:shadow-xs peer-focus-visible:ring-2 peer-focus-visible:ring-[#0165F0]/30">
                <span className="flex size-8 items-center justify-center rounded-xl bg-white text-[#062244] shadow-2xs">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="text-sm font-semibold text-[#062244]">{label}</span>
                <span className="text-xs text-[#5B6B7F]">{hint}</span>
              </span>
            </label>
          ))}
        </div>
        <FieldError id="role-error" messages={errors?.role} />
      </fieldset>

      {FIELDS.map((field) => (
        <div key={field.name} className="flex flex-col gap-2">
          <Label htmlFor={field.name} className="font-medium text-[#062244]">{field.label}</Label>
          <Input
            id={field.name}
            name={field.name}
            type={field.type}
            autoComplete={field.autoComplete}
            inputMode={"inputMode" in field ? field.inputMode : undefined}
            required
            defaultValue={values?.[field.name]}
            aria-invalid={Boolean(errors?.[field.name])}
            aria-describedby={`${field.name}-error`}
            className="h-12"
          />
          <FieldError id={`${field.name}-error`} messages={errors?.[field.name]} />
        </div>
      ))}

      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className="font-medium text-[#062244]">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          aria-invalid={Boolean(errors?.password)}
          aria-describedby="password-error"
          className="h-12"
        />
        <FieldError id="password-error" messages={errors?.password} />
      </div>

      <Button type="submit" size="default" className="w-full text-base font-semibold shadow-sm" disabled={pending}>
        {pending ? "Creando cuenta…" : "Crear cuenta"}
      </Button>

      <p className="text-center text-sm text-[#5B6B7F]">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-[#0165F0] hover:underline">
          Ingresa
        </Link>
      </p>
    </form>
  );
}
