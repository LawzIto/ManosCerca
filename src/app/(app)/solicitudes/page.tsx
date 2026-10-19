import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { REQUEST_CARD_COLUMNS, RequestCard } from "@/components/requests/request-card";
import { buttonVariants } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Mis solicitudes" };

export default async function RequestsPage() {
  const profile = await requireRole("client");
  const supabase = await createClient();
  const { data: requests, error } = await supabase
    .from("service_requests")
    .select(REQUEST_CARD_COLUMNS)
    .eq("client_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#062244]">Mis solicitudes</h1>
          <p className="text-sm text-[#5B6B7F]">Revisa el estado y cotizaciones de tus pedidos</p>
        </div>
        <Link
          href="/solicitudes/nueva"
          className={buttonVariants({
            variant: "default",
            size: "sm",
            className: "font-semibold shadow-sm",
          })}
        >
          <Plus className="size-4" aria-hidden />
          Nueva
        </Link>
      </header>

      {requests.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {requests.map((request) => (
            <li key={request.id}>
              <RequestCard request={request} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#D0D9E8] bg-white p-10 text-center shadow-xs">
          <p className="font-semibold text-base text-[#062244]">No tienes solicitudes activas</p>
          <p className="mt-1 text-sm text-[#5B6B7F] max-w-xs">
            Publica lo que necesitas arreglar y los profesionales de tu barrio te enviarán cotizaciones.
          </p>
          <Link
            href="/solicitudes/nueva"
            className={buttonVariants({
              variant: "default",
              size: "default",
              className: "mt-5 font-semibold shadow-sm",
            })}
          >
            <Plus className="size-4" aria-hidden />
            Pedir mi primer servicio
          </Link>
        </div>
      )}
    </div>
  );
}
