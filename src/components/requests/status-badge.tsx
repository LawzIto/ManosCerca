import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import { REQUEST_STATUS } from "@/lib/requests/status";
import type { Enums } from "@/types/database";

export function StatusBadge({ status }: { status: Enums<"request_status"> }) {
  const { label, className } = REQUEST_STATUS[status];
  return <Badge className={cn("border-transparent", className)}>{label}</Badge>;
}
