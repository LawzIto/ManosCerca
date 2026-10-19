import { formatCurrency } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type Profile = Pick<Tables<"profiles">, "role" | "rating_avg" | "rating_count">;

/** Resumen de servicios completados, montos y calificación del usuario. */
export async function StatsGrid({ profile }: { profile: Profile }) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_my_stats");
  if (error) throw error;
  const stats = data[0] ?? { completed_count: 0, total_amount: 0, month_amount: 0 };
  const isProfessional = profile.role === "professional";

  const items = [
    {
      label: isProfessional ? "Trabajos completados" : "Servicios completados",
      value: stats.completed_count.toString(),
    },
    {
      label: "Calificación",
      value: profile.rating_count > 0 ? `${Number(profile.rating_avg).toFixed(1)} ★` : "—",
      hint:
        profile.rating_count === 1 ? "1 reseña" : `${profile.rating_count} reseñas`,
    },
    {
      label: isProfessional ? "Ganado este mes" : "Gastado este mes",
      value: formatCurrency(Number(stats.month_amount)),
    },
    {
      label: isProfessional ? "Ganado en total" : "Gastado en total",
      value: formatCurrency(Number(stats.total_amount)),
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3">
      {items.map(({ label, value, hint }) => (
        <div
          key={label}
          className="rounded-3xl border border-[#EAF2FF] bg-white p-5 shadow-[0_4px_20px_rgba(6,34,68,0.05)] transition-all"
        >
          <dt className="text-xs font-medium text-[#5B6B7F]">{label}</dt>
          <dd className="mt-1.5 text-xl font-bold text-[#062244] tabular-nums">{value}</dd>
          {hint && <dd className="mt-0.5 text-xs text-[#5B6B7F]">{hint}</dd>}
        </div>
      ))}
    </dl>
  );
}
