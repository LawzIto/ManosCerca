import { cn } from "cn";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** Foto de perfil con las iniciales como respaldo. */
export function UserAvatar({
  name,
  url,
  className,
  fallbackClassName,
}: {
  name: string;
  url: string | null | undefined;
  className?: string;
  fallbackClassName?: string;
}) {
  return (
    <Avatar className={cn(className)}>
      {url && <AvatarImage src={url} alt="" />}
      <AvatarFallback className={cn("font-medium", fallbackClassName)}>{initials(name) || "?"}</AvatarFallback>
    </Avatar>
  );
}
