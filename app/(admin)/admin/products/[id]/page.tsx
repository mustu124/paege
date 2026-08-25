import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProductForEdit } from "@/lib/data/admin/products";
import { getAllCategoriesAdmin } from "@/lib/data/admin/categories";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { VariantManager } from "@/components/admin/VariantManager";
import { ImageManager } from "@/components/admin/ImageManager";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Edit Product" };

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProductForEdit(id), getAllCategoriesAdmin()]);
  if (!product) notFound();

  return (
    <div>
      <AdminPageHeader
        title={product.name}
        description={product.is_active ? "Active" : "Archived"}
        action={
          product.is_active ? (
            <Link href={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">Preview Live Page</Button>
            </Link>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-12 p-8">
        <section>
          <h2 className="mb-4 font-sans text-xs uppercase tracking-wider text-charcoal-900">Details</h2>
          <ProductForm categories={categories} product={product} />
        </section>

        <section>
          <h2 className="mb-4 font-sans text-xs uppercase tracking-wider text-charcoal-900">Sizes &amp; Stock</h2>
          <VariantManager productId={product.id} variants={product.variants} />
        </section>

        <section>
          <h2 className="mb-4 font-sans text-xs uppercase tracking-wider text-charcoal-900">Images</h2>
          <ImageManager productId={product.id} images={product.images} />
        </section>
      </div>
    </div>
  );
}
