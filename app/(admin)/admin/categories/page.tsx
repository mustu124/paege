import type { Metadata } from "next";
import Link from "next/link";

import { getAllCategoriesAdmin } from "@/lib/data/admin/categories";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable, AdminTableHead, AdminTh, AdminTr, AdminTd } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/Button";
import { ToggleActiveButton } from "@/components/admin/ToggleActiveButton";
import { ReorderButtons } from "@/components/admin/ReorderButtons";
import { toggleCategoryActiveAction, reorderCategoryAction } from "@/app/(admin)/admin/categories/actions";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const categories = await getAllCategoriesAdmin();

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="Categories are fully admin-managed — nothing is hard-coded."
        action={
          <Link href="/admin/categories/new">
            <Button variant="primary">New Category</Button>
          </Link>
        }
      />

      <div className="p-8">
        <AdminTable>
          <AdminTableHead>
            <AdminTh>Order</AdminTh>
            <AdminTh>Name</AdminTh>
            <AdminTh>Slug</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh className="text-right">Actions</AdminTh>
          </AdminTableHead>
          <tbody>
            {categories.map((category, i) => (
              <AdminTr key={category.id}>
                <AdminTd>
                  <ReorderButtons
                    id={category.id}
                    disableUp={i === 0}
                    disableDown={i === categories.length - 1}
                    action={reorderCategoryAction}
                  />
                </AdminTd>
                <AdminTd>{category.name}</AdminTd>
                <AdminTd className="text-charcoal-500">{category.slug}</AdminTd>
                <AdminTd>
                  <ToggleActiveButton
                    id={category.id}
                    isActive={category.is_active}
                    action={toggleCategoryActiveAction}
                  />
                </AdminTd>
                <AdminTd className="text-right">
                  <Link href={`/admin/categories/${category.id}`} className="link-underline font-sans text-xs uppercase tracking-wider">
                    Edit
                  </Link>
                </AdminTd>
              </AdminTr>
            ))}
          </tbody>
        </AdminTable>
      </div>
    </div>
  );
}
