"use server";

import { createClient } from "@/lib/supabase/server";
import type { AvailabilityStatus } from "@/lib/types/database";

export interface CartValidationItem {
  variantId: string;
  found: boolean;
  productActive: boolean;
  status: AvailabilityStatus;
  lowStockQuantity: number | null;
  currentPricePaise: number | null;
}

interface VariantRow {
  id: string;
  product_id: string;
  price_override_paise: number | null;
  products: { price_paise: number; is_active: boolean } | null;
}

// Pre-checkout stock/price revalidation for whatever's sitting in
// the client-side cart store. This is a UX layer, not the security
// boundary — a stale/tampered result here can't actually oversell
// anything, because create_order_for_checkout (called at the real
// checkout step) re-locks and re-validates every variant against
// live inventory regardless of what this returned.
export async function validateCartAction(variantIds: string[]): Promise<CartValidationItem[]> {
  if (variantIds.length === 0) return [];

  const supabase = await createClient();

  const { data: variants, error } = await supabase
    .from("product_variants")
    .select("id, product_id, price_override_paise, products ( price_paise, is_active )")
    .in("id", variantIds);

  const notFoundResult = (variantId: string): CartValidationItem => ({
    variantId,
    found: false,
    productActive: false,
    status: "out_of_stock",
    lowStockQuantity: null,
    currentPricePaise: null,
  });

  if (error || !variants) {
    console.error("validateCartAction:", error?.message);
    return variantIds.map(notFoundResult);
  }

  const typedVariants = variants as unknown as VariantRow[];
  const productIds = [...new Set(typedVariants.map((v) => v.product_id))];
  const availabilityByVariant = new Map<string, { status: AvailabilityStatus; low_stock_quantity: number | null }>();

  await Promise.all(
    productIds.map(async (productId) => {
      const { data } = await supabase.rpc("get_product_availability", { p_product_id: productId });
      for (const row of data ?? []) {
        availabilityByVariant.set(row.variant_id, { status: row.status, low_stock_quantity: row.low_stock_quantity });
      }
    }),
  );

  return variantIds.map((variantId) => {
    const variant = typedVariants.find((v) => v.id === variantId);
    if (!variant) return notFoundResult(variantId);

    const availability = availabilityByVariant.get(variantId);

    return {
      variantId,
      found: true,
      productActive: variant.products?.is_active ?? false,
      status: availability?.status ?? "out_of_stock",
      lowStockQuantity: availability?.low_stock_quantity ?? null,
      currentPricePaise: variant.price_override_paise ?? variant.products?.price_paise ?? null,
    };
  });
}
