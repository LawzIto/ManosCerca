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
        <Label htmlFor="email">Correo</Label>
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
          className="h-10"
        />
        <FieldError id="email-error" messages={errors?.email} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(errors?.password)}
          aria-describedby="password-error"
          className="h-10"
        />
        <FieldError id="password-error" messages={errors?.password} />
      </div>

      <Button type="submit" size="lg" className="h-10" disabled={pending}>
        {pending ? "Ingresando…" : "Ingresar"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-medium text-foreground underline underline-offset-4">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
