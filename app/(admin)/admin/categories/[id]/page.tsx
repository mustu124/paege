import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCategoryById } from "@/lib/data/admin/categories";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata: Metadata = { title: "Edit Category" };

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const category = await getCategoryById(id);
  if (!category) notFound();

  return (
    <div>
      <AdminPageHeader title={`Edit — ${category.name}`} />
      <div className="p-8">
        <CategoryForm category={category} />
      </div>
    </div>
  );
}
