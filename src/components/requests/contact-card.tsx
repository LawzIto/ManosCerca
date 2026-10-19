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
    <section className="space-y-4 rounded-3xl border border-[#0B7A4B]/25 bg-[#E6F4EA]/50 p-6 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0B7A4B]">{title}</p>
          <p className="text-lg font-bold text-[#062244]">{contact.full_name || "Sin nombre"}</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-[#E6F4EA] px-3 py-1 text-xs font-semibold text-[#0B7A4B]">
          Contacto directo
        </span>
      </div>
      {contact.phone ? (
        <div className="flex gap-3">
          <a
            href={`tel:${contact.phone}`}
            className={buttonVariants({
              variant: "outline",
              size: "default",
              className: "flex-1 font-semibold border-2 border-[#062244] text-[#062244] hover:bg-white",
            })}
          >
            <Phone className="size-4" aria-hidden />
            Llamar
          </a>
          <a
            href={`https://wa.me/${whatsappNumber(contact.phone)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: "default",
              size: "default",
              className: "flex-1 font-semibold bg-[#0B7A4B] hover:brightness-95 text-white shadow-sm",
            })}
          >
            <MessageCircle className="size-4" aria-hidden />
            WhatsApp
          </a>
        </div>
      ) : (
        <p className="text-sm text-[#5B6B7F]">No registró un teléfono de contacto.</p>
      )}
    </section>
  );
}
