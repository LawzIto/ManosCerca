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
    <>
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Mis solicitudes</h1>
        <Link href="/solicitudes/nueva" className={buttonVariants({ size: "sm" })}>
          <Plus aria-hidden />
          Nueva
        </Link>
      </header>

      {requests.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {requests.map((request) => (
            <li key={request.id}>
              <RequestCard request={request} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Aún no has pedido ningún servicio.
        </p>
      )}
    </>
  );
}
