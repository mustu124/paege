"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";

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

interface InitialVariant {
  size: string;
  quantity: number;
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Only relevant on create — once a product exists, sizes/stock are
  // managed from the edit page's VariantManager instead.
  const [variants, setVariants] = useState<InitialVariant[]>([]);
  const [sizeInput, setSizeInput] = useState("");
  const [quantityInput, setQuantityInput] = useState("");

  function addVariant() {
    const size = sizeInput.trim().toUpperCase();
    if (!size) return;
    if (variants.some((v) => v.size === size)) return;
    const quantity = Number(quantityInput) || 0;
    setVariants((prev) => [...prev, { size, quantity }]);
    setSizeInput("");
    setQuantityInput("");
  }

  function removeVariant(size: string) {
    setVariants((prev) => prev.filter((v) => v.size !== size));
  }

  function onSubmit(formData: FormData) {
    if (pending) return;
    setError(null);
    if (!product && variants.length > 0) {
      formData.set("variants", JSON.stringify(variants));
    }
    startTransition(async () => {
      const result = product ? await updateProductAction(product.id, formData) : await createProductAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={onSubmit} className="flex max-w-2xl flex-col gap-8">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input name="name" label="Name" defaultValue={product?.name} required />
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

      {!product && (
        <section className="flex flex-col gap-4">
          <span className="font-sans text-xs uppercase tracking-wider text-charcoal-700">
            Sizes &amp; Initial Stock (optional)
          </span>

          {variants.length > 0 && (
            <div className="divide-y divide-border border-y border-border">
              {variants.map((v) => (
                <div key={v.size} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-4">
                    <span className="w-12 font-sans text-sm text-charcoal-900">{v.size}</span>
                    <span className="font-sans text-xs text-charcoal-500">Stock: {v.quantity}</span>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove size ${v.size}`}
                    onClick={() => removeVariant(v.size)}
                    className="p-1 text-charcoal-500 hover:text-burgundy"
                  >
                    <X size={16} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-xs uppercase tracking-wider text-charcoal-700">Size</span>
              <input
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                placeholder="e.g. XS"
                className="w-24 border border-border bg-cream-50 px-3 py-2 font-sans text-sm text-charcoal-900 outline-none focus:border-charcoal-900"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-xs uppercase tracking-wider text-charcoal-700">Stock</span>
              <input
                type="number"
                min={0}
                value={quantityInput}
                onChange={(e) => setQuantityInput(e.target.value)}
                placeholder="0"
                className="w-24 border border-border bg-cream-50 px-3 py-2 font-sans text-sm text-charcoal-900 outline-none focus:border-charcoal-900"
              />
            </label>
            <Button type="button" variant="outline" onClick={addVariant}>
              Add
            </Button>
          </div>

          <p className="font-sans text-xs text-charcoal-500">
            You can also add or adjust sizes later from the product&apos;s edit page.
          </p>
        </section>
      )}

      {error && <p className="font-sans text-xs text-burgundy">{error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving…" : product ? "Save Changes" : "Create Product"}
      </Button>
    </form>
  );
}
