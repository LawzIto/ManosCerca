"use client";

import Link from "next/link";
import { useActionState } from "react";

import { FieldError, FormAlert } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth/actions";
import type { AuthActionState } from "@/lib/auth/schemas";

export function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(signIn, {});
  const errors = state.fieldErrors;
  const alert = state.error ?? notice;

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      {alert && <FormAlert variant="error">{alert}</FormAlert>}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email" className="font-medium text-[#062244]">Correo</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          defaultValue={state.values?.email}
          aria-invalid={Boolean(errors?.email)}
          aria-describedby="email-error"
          className="h-12"
        />
        <FieldError id="email-error" messages={errors?.email} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className="font-medium text-[#062244]">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(errors?.password)}
          aria-describedby="password-error"
          className="h-12"
        />
        <FieldError id="password-error" messages={errors?.password} />
      </div>

      <Button type="submit" size="default" className="w-full text-base font-semibold shadow-sm" disabled={pending}>
        {pending ? "Ingresando…" : "Ingresar"}
      </Button>

      <p className="text-center text-sm text-[#5B6B7F]">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-semibold text-[#0165F0] hover:underline">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
