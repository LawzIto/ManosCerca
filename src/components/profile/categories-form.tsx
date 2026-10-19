"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { CategoryIcon } from "@/components/category-icon";
import { FormAlert } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { updateMyCategories } from "@/lib/profile/actions";
import type { ProfileFormState } from "@/lib/profile/schemas";
import type { Tables } from "@/types/database";

type Category = Pick<Tables<"categories">, "id" | "slug" | "name">;

export function CategoriesForm({
  categories,
  selectedIds,
}: {
  categories: Category[];
  selectedIds: number[];
}) {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(
    updateMyCategories,
    {},
  );

  useEffect(() => {
    if (state.success) toast.success(state.success);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && <FormAlert variant="error">{state.error}</FormAlert>}

      <fieldset className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <legend className="sr-only">Especialidades</legend>
        {categories.map((category) => (
          <label key={category.id} className="cursor-pointer">
            <input
              type="checkbox"
              name="categoryIds"
              value={category.id}
              defaultChecked={selectedIds.includes(category.id)}
              className="peer sr-only"
            />
            <span className="flex h-full flex-col items-center gap-2 rounded-2xl border border-[#EAF2FF] bg-[#F3F6FA] p-3.5 text-center transition-all peer-checked:border-[#0165F0] peer-checked:bg-[#EAF2FF] peer-checked:shadow-xs peer-focus-visible:ring-2 peer-focus-visible:ring-[#0165F0]/30">
              <span className="flex size-9 items-center justify-center rounded-xl bg-white text-[#062244] shadow-2xs">
                <CategoryIcon slug={category.slug} className="size-5" />
              </span>
              <span className="text-xs font-semibold text-[#062244]">{category.name}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <Button type="submit" variant="default" size="default" className="w-full font-semibold shadow-sm" disabled={pending}>
        {pending ? "Guardando…" : "Guardar especialidades"}
      </Button>
    </form>
  );
}
