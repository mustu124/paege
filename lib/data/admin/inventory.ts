import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { AvailabilityStatus } from "@/lib/types/database";

export interface InventoryRow {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  size: string;
  quantity: number;
  lowStockThreshold: number;
  status: AvailabilityStatus;
}

export async function getAllInventory(): Promise<InventoryRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("inventory")
    .select(
      "variant_id, quantity, low_stock_threshold, product_variants!inner ( size, product_id, products!inner ( name, slug ) )",
    );

  if (error || !data) {
    console.error("getAllInventory:", error?.message);
    return [];
  }

  return data
    .map((row) => {
      const variant = row.product_variants as unknown as {
        size: string;
        product_id: string;
        products: { name: string; slug: string };
      };

      const status: AvailabilityStatus =
        row.quantity <= 0 ? "out_of_stock" : row.quantity <= row.low_stock_threshold ? "low_stock" : "in_stock";

      return {
        variantId: row.variant_id,
        productId: variant.product_id,
        productName: variant.products.name,
        productSlug: variant.products.slug,
        size: variant.size,
        quantity: row.quantity,
        lowStockThreshold: row.low_stock_threshold,
        status,
      };
    })
    .sort((a, b) => a.productName.localeCompare(b.productName) || a.size.localeCompare(b.size));
}
