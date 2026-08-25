"use client";

import { useState, useTransition } from "react";

import type { Category } from "@/lib/data/categories";
import type { Database } from "@/lib/types/database";
import { createProductAction, updateProductAction } from "@/app/(admin)/admin/products/actions";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

interface ProductFormProps {
  categories: Category[];
  product?: ProductRow;
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = product ? await updateProductAction(product.id, formData) : await createProductAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={onSubmit} className="flex max-w-2xl flex-col gap-8">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input name="name" label="Name" defaultValue={product?.name} required />
        <Input name="slug" label="Slug" defaultValue={product?.slug} required />
        <Select name="categoryId" label="Category" defaultValue={product?.category_id} required>
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Input name="productType" label="Type" defaultValue={product?.product_type ?? ""} placeholder="e.g. Mini Dress" />
        <Input name="colour" label="Colour" defaultValue={product?.colour ?? ""} />
        <Input name="fabric" label="Fabric" defaultValue={product?.fabric ?? ""} />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          name="pricePaise"
          type="number"
          label="Price (paise)"
          defaultValue={product?.price_paise}
          required
        />
        <Input
          name="compareAtPricePaise"
          type="number"
          label="Compare-at Price (paise, optional)"
          defaultValue={product?.compare_at_price_paise ?? ""}
        />
      </section>

      <section className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="font-sans text-xs uppercase tracking-wider text-charcoal-700">Short Description</span>
          <textarea
            name="shortDescription"
            defaultValue={product?.short_description ?? ""}
            rows={2}
            className="border border-border bg-cream-50 px-4 py-3 font-sans text-sm text-charcoal-900 outline-none focus:border-charcoal-900"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-sans text-xs uppercase tracking-wider text-charcoal-700">Description</span>
          <textarea
            name="description"
            defaultValue={product?.description ?? ""}
            rows={4}
            className="border border-border bg-cream-50 px-4 py-3 font-sans text-sm text-charcoal-900 outline-none focus:border-charcoal-900"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-sans text-xs uppercase tracking-wider text-charcoal-700">
            Wash Care (one instruction per line)
          </span>
          <textarea
            name="washCareInstructions"
            defaultValue={product?.wash_care_instructions ?? ""}
            rows={4}
            className="border border-border bg-cream-50 px-4 py-3 font-sans text-sm text-charcoal-900 outline-none focus:border-charcoal-900"
          />
        </label>
      </section>

      <section className="flex flex-wrap gap-6">
        <Input name="displayOrder" type="number" label="Display Order" defaultValue={product?.display_order ?? 0} className="w-32" />
        <label className="flex items-center gap-2 font-sans text-sm text-charcoal-900">
          <input type="checkbox" name="isActive" defaultChecked={product?.is_active ?? true} />
          Active
        </label>
        <label className="flex items-center gap-2 font-sans text-sm text-charcoal-900">
          <input type="checkbox" name="isBestseller" defaultChecked={product?.is_bestseller ?? false} />
          Bestseller tag
        </label>
        <label className="flex items-center gap-2 font-sans text-sm text-charcoal-900">
          <input type="checkbox" name="isNewArrival" defaultChecked={product?.is_new_arrival ?? false} />
          New Arrival
        </label>
      </section>

      {error && <p className="font-sans text-xs text-burgundy">{error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving…" : product ? "Save Changes" : "Create Product"}
      </Button>
    </form>
  );
}
