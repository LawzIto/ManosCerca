import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Ingresar" };

const NOTICES: Record<string, string> = {
  enlace_invalido: "El enlace no es válido o expiró. Intenta ingresar o regístrate de nuevo.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Ingresar</CardTitle>
        <CardDescription>Usa el correo y la contraseña de tu cuenta.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm
          next={typeof next === "string" ? next : undefined}
          notice={typeof error === "string" ? NOTICES[error] : undefined}
        />
      </CardContent>
    </Card>
  );
}
