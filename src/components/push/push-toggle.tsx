"use client";

import { BellOff, BellRing } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { savePushSubscription } from "@/lib/push/actions";
import {
  isPushSupported,
  needsIosInstall,
  registerServiceWorker,
  unsubscribeThisDevice,
  urlBase64ToUint8Array,
  VAPID_PUBLIC_KEY,
} from "@/lib/push/client";

type Status = "loading" | "unsupported" | "ios-install" | "denied" | "off" | "on";

function toInput(subscription: PushSubscription) {
  const { endpoint, keys } = subscription.toJSON();
  return {
    endpoint: endpoint ?? "",
    p256dh: keys?.p256dh ?? "",
    auth: keys?.auth ?? "",
    userAgent: navigator.userAgent,
  };
}

async function detectStatus(): Promise<Status> {
  if (!VAPID_PUBLIC_KEY) return "unsupported";
  if (!isPushSupported()) return needsIosInstall() ? "ios-install" : "unsupported";
  if (Notification.permission === "denied") return "denied";

  const registration = await registerServiceWorker();
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return "off";
  // Re-sincroniza por si otra cuenta usó este navegador antes.
  await savePushSubscription(toInput(subscription));
  return "on";
}

const DESCRIPTIONS: Record<Exclude<Status, "loading">, string> = {
  off: "Recibe avisos de cotizaciones y trabajos aunque tengas la app cerrada.",
  on: "Activados en este dispositivo.",
  denied:
    "Bloqueaste las notificaciones de ManosCerca. Actívalas en los ajustes del navegador para este sitio.",
  "ios-install":
    "En iPhone, primero instala la app: toca Compartir y luego «Agregar a inicio». Ábrela desde el ícono y activa los avisos aquí.",
  unsupported: "Este navegador no permite notificaciones push.",
};

/**
 * Activa o desactiva Web Push en este dispositivo.
 * `prompt`: versión para invitar a activarlos; se oculta si ya están activos o no se puede.
 */
export function PushToggle({ variant = "settings" }: { variant?: "settings" | "prompt" }) {
  const [status, setStatus] = useState<Status>("loading");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    detectStatus()
      .catch((error) => {
        console.error("PushToggle", error);
        return "unsupported" as const;
      })
      .then((next) => {
        if (!cancelled) setStatus(next);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function enable() {
    startTransition(async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setStatus(permission === "denied" ? "denied" : "off");
          return;
        }
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!),
        });
        const { error } = await savePushSubscription(toInput(subscription));
        if (error) {
          await subscription.unsubscribe();
          toast.error(error);
          return;
        }
        setStatus("on");
        toast.success("Notificaciones activadas");
      } catch (error) {
        console.error("PushToggle enable", error);
        toast.error("No pudimos activar las notificaciones en este dispositivo.");
      }
    });
  }

  function disable() {
    startTransition(async () => {
      try {
        await unsubscribeThisDevice();
        setStatus("off");
        toast.success("Notificaciones desactivadas en este dispositivo");
      } catch (error) {
        console.error("PushToggle disable", error);
        toast.error("No pudimos desactivar las notificaciones.");
      }
    });
  }

  if (status === "loading") return null;
  if (variant === "prompt" && !(status === "off" || status === "ios-install")) return null;

  const Icon = status === "on" ? BellRing : BellOff;

  return (
    <div className="flex items-start gap-3 rounded-lg border p-3 text-sm">
      <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div>
          <p className="font-medium">Avisos en este dispositivo</p>
          <p className="text-muted-foreground">{DESCRIPTIONS[status]}</p>
        </div>
        {status === "off" && (
          <Button size="sm" className="self-start" onClick={enable} disabled={pending}>
            {pending ? "Activando…" : "Activar avisos"}
          </Button>
        )}
        {status === "on" && (
          <Button size="sm" variant="outline" className="self-start" onClick={disable} disabled={pending}>
            {pending ? "Desactivando…" : "Desactivar"}
          </Button>
        )}
      </div>
    </div>
  );
}
