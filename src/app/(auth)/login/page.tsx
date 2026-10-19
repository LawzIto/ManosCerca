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
    <Card className="border border-[#EAF2FF] shadow-[0_8px_24px_rgba(6,34,68,0.06)]">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-[#062244]">Ingresar</CardTitle>
        <CardDescription className="text-sm text-[#5B6B7F]">Usa el correo y la contraseña de tu cuenta.</CardDescription>
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
