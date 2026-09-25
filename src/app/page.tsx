import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, name")
    .order("sort_order");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-4 py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">ManosCerca</h1>
        <p className="text-muted-foreground">
          Pide un técnico del hogar y recibe cotizaciones de profesionales cerca de ti.
        </p>
      </header>

      <ul className="grid grid-cols-2 gap-3">
        {(categories ?? []).map((category) => (
          <li key={category.id} className="rounded-lg border p-4 text-sm font-medium">
            {category.name}
          </li>
        ))}
      </ul>

      <div className="flex gap-3">
        <Link href="/login" className={buttonVariants({ className: "flex-1" })}>
          Ingresar
        </Link>
        <Link href="/registro" className={buttonVariants({ variant: "outline", className: "flex-1" })}>
          Crear cuenta
        </Link>
      </div>
    </main>
  );
}
