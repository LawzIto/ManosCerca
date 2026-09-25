import {
  BrickWall,
  Flame,
  Hammer,
  KeyRound,
  PaintRoller,
  Sparkles,
  Wrench,
  Zap,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

/** Ícono por slug de categoría (ver seed en supabase/schema.sql). */
const ICONS: Record<string, LucideIcon> = {
  plomeria: Wrench,
  cerrajeria: KeyRound,
  carpinteria: Hammer,
  electricidad: Zap,
  pintura: PaintRoller,
  albanileria: BrickWall,
  gasfiteria: Flame,
  limpieza: Sparkles,
};

export function CategoryIcon({ slug, ...props }: { slug: string } & LucideProps) {
  const Icon = ICONS[slug] ?? Wrench;
  return <Icon aria-hidden {...props} />;
}
