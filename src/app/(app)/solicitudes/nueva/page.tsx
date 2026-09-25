import type { Metadata } from "next";

import { RequestForm } from "@/components/requests/request-form";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Pedir un servicio" };

export default async function NewRequestPage({ searchParams }: PageProps<"/solicitudes/nueva">) {
  await requireRole("client");
  const { categoria } = await searchParams;

  const supabase = await createClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, slug, name")
    .order("sort_order");

  if (error) throw error;

  const defaultCategoryId = categories.find((category) => category.slug === categoria)?.id;

  return (
    <>
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Pedir un servicio</h1>
        <p className="text-sm text-muted-foreground">
          Publica tu solicitud y recibe cotizaciones de profesionales cercanos.
        </p>
      </header>
      <RequestForm categories={categories} defaultCategoryId={defaultCategoryId} />
    </>
  );
}
