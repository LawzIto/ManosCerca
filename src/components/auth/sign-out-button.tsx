"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import { unsubscribeThisDevice } from "@/lib/push/client";

export function SignOutButton() {
  async function handleSignOut() {
    // Sin esto, el dispositivo seguiría recibiendo los avisos de la cuenta que salió.
    await unsubscribeThisDevice().catch((error) => console.error("unsubscribeThisDevice", error));
    await signOut();
  }

  return (
    <form action={handleSignOut}>
      <Button type="submit" variant="ghost" size="sm">
        <LogOut aria-hidden />
        Salir
      </Button>
    </form>
  );
}
