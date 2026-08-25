import type { Metadata } from "next";
import Link from "next/link";

import { getAllProductsAdmin } from "@/lib/data/admin/products";
import { getStorageUrl } from "@/lib/storage";
import { formatPaise } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable, AdminTableHead, AdminTh, AdminTr, AdminTd } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/Button";
import { ToggleActiveButton } from "@/components/admin/ToggleActiveButton";
import { SiteImage } from "@/components/ui/SiteImage";
import { setProductActiveAction } from "@/app/(admin)/admin/products/actions";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin();

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description={`${products.length} product${products.length === 1 ? "" : "s"}`}
        action={
          <Link href="/admin/products/new">
            <Button variant="primary">New Product</Button>
          </Link>
        }
      />

      <div className="p-8">
        <AdminTable>
          <AdminTableHead>
            <AdminTh></AdminTh>
            <AdminTh>Name</AdminTh>
            <AdminTh>Category</AdminTh>
            <AdminTh>Sizes</AdminTh>
            <AdminTh>Price</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh className="text-right">Actions</AdminTh>
          </AdminTableHead>
          <tbody>
            {products.map((product) => (
              <AdminTr key={product.id}>
                <AdminTd>
                  <div className="relative h-12 w-10 overflow-hidden bg-cream-100">
                    <SiteImage
                      src={getStorageUrl("product-images", product.primaryImagePath)}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                </AdminTd>
                <AdminTd>
                  <div className="flex items-center gap-2">
                    {product.name}
                    {product.is_bestseller && (
                      <span className="border border-border px-1.5 py-0.5 font-sans text-[10px] uppercase text-charcoal-500">
                        Bestseller
                      </span>
                    )}
                    {product.is_new_arrival && (
                      <span className="border border-border px-1.5 py-0.5 font-sans text-[10px] uppercase text-charcoal-500">
                        New
                      </span>
                    )}
                  </div>
                </AdminTd>
                <AdminTd className="text-charcoal-500">{product.categoryName ?? "—"}</AdminTd>
                <AdminTd className="text-charcoal-500">{product.variantCount}</AdminTd>
                <AdminTd>{formatPaise(product.price_paise)}</AdminTd>
                <AdminTd>
                  <ToggleActiveButton id={product.id} isActive={product.is_active} action={setProductActiveAction} />
                </AdminTd>
                <AdminTd className="text-right">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="link-underline font-sans text-xs uppercase tracking-wider"
                  >
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
