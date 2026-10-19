import Link from "next/link";

import { BrandLogo } from "@/components/brand";
import { TrustBanner } from "@/components/brand/trust-banner";
import { CategoryIcon } from "@/components/category-icon";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, name")
    .order("sort_order");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-between gap-8 px-4 py-10">
      <div className="space-y-6">
        <header className="space-y-4 text-center">
          <div className="flex justify-center">
            <BrandLogo variant="horizontal" color="color" className="h-14 w-auto" priority />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#062244]">
              Técnicos del hogar cerca de ti
            </h1>
            <p className="text-base text-[#5B6B7F]">
              Pide un servicio y recibe cotizaciones directas de profesionales verificados.
            </p>
          </div>
        </header>

        <TrustBanner variant="verified" />

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-[#062244]">Servicios disponibles</h2>
          <ul className="grid grid-cols-2 gap-3">
            {(categories ?? []).map((category) => (
              <li
                key={category.id}
                className="flex flex-col items-center justify-center gap-2.5 rounded-3xl bg-[#EAF2FF] p-5 text-center transition-all hover:shadow-[0_4px_20px_rgba(6,34,68,0.08)] active:scale-[0.98]"
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-[#062244] shadow-sm">
                  <CategoryIcon slug={category.slug} className="size-7 text-[#062244]" />
                </span>
                <span className="text-sm font-medium text-[#062244]">{category.name}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-3xl bg-white/90 p-3 shadow-[0_8px_24px_rgba(6,34,68,0.08)] backdrop-blur-md">
        <Link
          href="/login"
          className={buttonVariants({ variant: "default", size: "default", className: "w-full text-base font-semibold" })}
        >
          Ingresar
        </Link>
        <Link
          href="/registro"
          className={buttonVariants({ variant: "outline", size: "default", className: "w-full text-base font-semibold" })}
        >
          Crear cuenta
        </Link>
      </div>
    </main>
  );
}
