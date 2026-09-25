import type { Metadata } from "next";

import { SignUpForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function SignUpPage({ searchParams }: PageProps<"/registro">) {
  const { rol } = await searchParams;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Crear cuenta</CardTitle>
        <CardDescription>Pide servicios o empieza a recibir trabajos cerca de ti.</CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpForm defaultRole={rol === "profesional" ? "professional" : undefined} />
      </CardContent>
    </Card>
  );
}
