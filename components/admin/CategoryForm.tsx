"use client";

import { useRef, useState, useTransition } from "react";

import type { Category } from "@/lib/data/categories";
import { getStorageUrl } from "@/lib/storage";
import { createCategoryAction, updateCategoryAction } from "@/app/(admin)/admin/categories/actions";
import type { ActionResult } from "@/lib/types/admin-actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SiteImage } from "@/components/ui/SiteImage";

export function CategoryForm({ category }: { category?: Category }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [useUrl, setUseUrl] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const currentImageUrl = category?.image_storage_path ? getStorageUrl("category-images", category.image_storage_path) : null;

  return (
    <form action={onSubmit} className="flex max-w-lg flex-col gap-4">
      <div className="flex items-end gap-4">
        {(filePreview ?? currentImageUrl) && (
          <div className="relative aspect-[4/5] w-28 shrink-0 overflow-hidden border border-border bg-cream-100">
            <SiteImage src={filePreview ?? currentImageUrl!} alt="" fill sizes="112px" className="object-cover" />
          </div>
        )}

        <div className="flex flex-1 flex-col gap-3">
          {!useUrl ? (
            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-xs uppercase tracking-wider text-charcoal-700">
                {category ? "Replace Tile Image" : "Tile Image (optional)"}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                name="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setFilePreview(file ? URL.createObjectURL(file) : null);
                }}
                className="font-sans text-sm text-charcoal-900"
              />
            </label>
          ) : (
            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-xs uppercase tracking-wider text-charcoal-700">Image URL</span>
              <input
                type="url"
                name="imageUrl"
                placeholder="https://…"
                className="border border-border bg-cream-50 px-3 py-2 font-sans text-sm text-charcoal-900 outline-none focus:border-charcoal-900"
              />
            </label>
          )}
          <button
            type="button"
            onClick={() => {
              setUseUrl((v) => !v);
              setFilePreview(null);
            }}
            className="link-underline w-fit font-sans text-xs uppercase tracking-wider text-charcoal-700"
          >
            {useUrl ? "Upload a file instead" : "Use an image URL instead"}
          </button>
        </div>
      </div>

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
