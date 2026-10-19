import type { Metadata } from "next";

import { SignUpForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function SignUpPage({ searchParams }: PageProps<"/registro">) {
  const { rol } = await searchParams;

  return (
    <Card className="border border-[#EAF2FF] shadow-[0_8px_24px_rgba(6,34,68,0.06)]">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-[#062244]">Crear cuenta</CardTitle>
        <CardDescription className="text-sm text-[#5B6B7F]">Pide servicios o empieza a recibir trabajos cerca de ti.</CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpForm defaultRole={rol === "profesional" ? "professional" : undefined} />
      </CardContent>
    </Card>
  );
}
