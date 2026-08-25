import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata: Metadata = { title: "New Category" };

export default function NewCategoryPage() {
  return (
    <div>
      <AdminPageHeader title="New Category" />
      <div className="p-8">
        <CategoryForm />
      </div>
    </div>
  );
}
