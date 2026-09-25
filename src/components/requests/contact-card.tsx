import { MessageCircle, Phone } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

/** Número en formato internacional para wa.me (celulares colombianos: 3XX XXX XXXX). */
function whatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 && digits.startsWith("3") ? `57${digits}` : digits;
}

/**
 * Datos de contacto de la contraparte. Solo se obtienen mientras el servicio
 * está activo (RPC get_request_contact); si no, no renderiza nada.
 */
export async function ContactCard({ requestId, title }: { requestId: string; title: string }) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_request_contact", { p_request_id: requestId });
  const contact = data?.[0];
  if (!contact) return null;

  return (
    <section className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
      <div>
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="font-semibold">{contact.full_name || "Sin nombre"}</p>
      </div>
      {contact.phone ? (
        <div className="flex gap-2">
          <a href={`tel:${contact.phone}`} className={buttonVariants({ variant: "outline", className: "flex-1" })}>
            <Phone aria-hidden />
            Llamar
          </a>
          <a
            href={`https://wa.me/${whatsappNumber(contact.phone)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", className: "flex-1" })}
          >
            <MessageCircle aria-hidden />
            WhatsApp
          </a>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No registró un teléfono.</p>
      )}
    </section>
  );
}
