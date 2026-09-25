"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cancelServiceRequest } from "@/lib/requests/actions";

export function CancelRequestButton({ requestId }: { requestId: string }) {
  const [pending, startTransition] = useTransition();

  function handleCancel() {
    if (!window.confirm("¿Seguro que quieres cancelar esta solicitud?")) return;
    startTransition(async () => {
      const { error } = await cancelServiceRequest(requestId);
      if (error) toast.error(error);
      else toast.success("Solicitud cancelada");
    });
  }

  return (
    <Button variant="destructive" onClick={handleCancel} disabled={pending}>
      {pending ? "Cancelando…" : "Cancelar solicitud"}
    </Button>
  );
}
