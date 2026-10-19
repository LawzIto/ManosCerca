"use client";

import { cn } from "cn";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Enums } from "@/types/database";

const LINKS: Record<Enums<"user_role">, { href: string; label: string }[]> = {
  client: [
    { href: "/inicio", label: "Inicio" },
    { href: "/solicitudes", label: "Mis solicitudes" },
    { href: "/historial", label: "Historial" },
  ],
  professional: [
    { href: "/trabajos", label: "Disponibles" },
    { href: "/trabajos/mios", label: "Mis trabajos" },
    { href: "/historial", label: "Historial" },
  ],
  admin: [],
};

export function AppNav({ role }: { role: Enums<"user_role"> }) {
  const pathname = usePathname();
  const links = LINKS[role];
  // El enlace activo es el de prefijo más largo (para que /trabajos/mios no active /trabajos).
  const active = links
    .filter(({ href }) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav className="mx-auto flex w-full max-w-2xl gap-1 overflow-x-auto px-4">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={active === href ? "page" : undefined}
          className={cn(
            "shrink-0 border-b-2 py-3 px-3.5 text-sm font-medium transition-colors min-h-[44px] flex items-center",
            active === href
              ? "border-[#0165F0] text-[#0165F0] font-semibold"
              : "border-transparent text-[#5B6B7F] hover:text-[#062244]",
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
