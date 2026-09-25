"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type ActionButtonProps = Omit<React.ComponentProps<typeof Button>, "onClick" | "action"> & {
  /** Server Action ya enlazada con sus argumentos (`action.bind(null, id)`). */
  action: () => Promise<{ error?: string }>;
  confirmMessage?: string;
  successMessage?: string;
  pendingLabel?: string;
};

export function ActionButton({
  action,
  confirmMessage,
  successMessage,
  pendingLabel,
  children,
  disabled,
  ...props
}: ActionButtonProps) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    startTransition(async () => {
      const { error } = await action();
      if (error) toast.error(error);
      else if (successMessage) toast.success(successMessage);
    });
  }

  return (
    <Button {...props} onClick={handleClick} disabled={disabled || pending}>
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}
