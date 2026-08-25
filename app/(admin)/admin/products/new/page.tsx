import type { Metadata } from "next";

import { getAllCategoriesAdmin } from "@/lib/data/admin/categories";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "New Product" };

export default async function NewProductPage() {
  const categories = await getAllCategoriesAdmin();

  return (
    <div>
      <AdminPageHeader title="New Product" />
      <div className="p-8">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
