"use client";

import { useState, useTransition } from "react";

import type { Category } from "@/lib/data/categories";
import { createCategoryAction, updateCategoryAction } from "@/app/(admin)/admin/categories/actions";
import type { ActionResult } from "@/lib/types/admin-actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function CategoryForm({ category }: { category?: Category }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const action: (fd: FormData) => Promise<ActionResult> = category
        ? (fd) => updateCategoryAction(category.id, fd)
        : createCategoryAction;
      const result = await action(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={onSubmit} className="flex max-w-lg flex-col gap-4">
      <Input name="name" label="Name" defaultValue={category?.name} required />
      <Input name="slug" label="Slug" defaultValue={category?.slug} required />
      <Input name="description" label="Description (optional)" defaultValue={category?.description ?? ""} />
      <Input
        name="displayOrder"
        type="number"
        label="Display Order"
        defaultValue={category?.display_order ?? 0}
      />
      <label className="flex items-center gap-2 font-sans text-sm text-charcoal-900">
        <input type="checkbox" name="isActive" defaultChecked={category?.is_active ?? true} />
        Active
      </label>

      {error && <p className="font-sans text-xs text-burgundy">{error}</p>}

      <Button type="submit" disabled={pending} className="mt-2 w-fit">
        {pending ? "Saving…" : category ? "Save Changes" : "Create Category"}
      </Button>
    </form>
  );
}
