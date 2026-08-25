import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types/database";

const REVENUE_STATUSES: OrderStatus[] = ["confirmed", "processing", "shipped", "delivered"];

export interface DashboardStats {
  revenuePaise: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface StockAlertRow {
  variantId: string;
  productName: string;
  productSlug: string;
  size: string;
  quantity: number;
}

export interface RecentOrderRow {
  id: string;
  status: OrderStatus;
  totalPaise: number;
  customerEmail: string | null;
  createdAt: string;
}

export interface BestsellingProductRow {
  productId: string;
  productName: string;
  productSlug: string;
  unitsSold: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const { data: orders } = await supabase.from("orders").select("status, total_paise");
  const rows = orders ?? [];

  return {
    revenuePaise: rows
      .filter((o) => REVENUE_STATUSES.includes(o.status))
      .reduce((sum, o) => sum + o.total_paise, 0),
    totalOrders: rows.length,
    pendingOrders: rows.filter((o) => o.status === "pending_payment").length,
    processingOrders: rows.filter((o) => o.status === "processing").length,
    lowStockCount: 0, // filled in by getStockAlerts, kept here for a single stats shape
    outOfStockCount: 0,
  };
}

export async function getStockAlerts(): Promise<{ lowStock: StockAlertRow[]; outOfStock: StockAlertRow[] }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("inventory")
    .select("variant_id, quantity, low_stock_threshold, product_variants!inner ( size, products!inner ( name, slug ) )");

  if (error || !data) {
    console.error("getStockAlerts:", error?.message);
    return { lowStock: [], outOfStock: [] };
  }

  const rows: (StockAlertRow & { threshold: number })[] = data.map((row) => {
    const variant = row.product_variants as unknown as {
      size: string;
      products: { name: string; slug: string };
    };
    return {
      variantId: row.variant_id,
      productName: variant.products.name,
      productSlug: variant.products.slug,
      size: variant.size,
      quantity: row.quantity,
      threshold: row.low_stock_threshold,
    };
  });

  return {
    lowStock: rows.filter((r) => r.quantity > 0 && r.quantity <= r.threshold),
    outOfStock: rows.filter((r) => r.quantity <= 0),
  };
}

export async function getRecentOrders(limit = 8): Promise<RecentOrderRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("id, status, total_paise, customer_email, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("getRecentOrders:", error?.message);
    return [];
  }

  return data.map((o) => ({
    id: o.id,
    status: o.status,
    totalPaise: o.total_paise,
    customerEmail: o.customer_email,
    createdAt: o.created_at,
  }));
}

export async function getBestsellingProducts(limit = 5): Promise<BestsellingProductRow[]> {
  const supabase = await createClient();

  // Only order_items belonging to orders with a captured payment
  // count as "sold" — a pending/failed order was never actually
  // fulfilled.
  const { data: confirmedOrders } = await supabase.from("orders").select("id").in("status", [
    "confirmed",
    "processing",
    "shipped",
    "delivered",
  ]);

  const orderIds = (confirmedOrders ?? []).map((o) => o.id);
  if (orderIds.length === 0) return [];

  const { data: items, error } = await supabase
    .from("order_items")
    .select("product_id, product_name, quantity")
    .in("order_id", orderIds);

  if (error || !items) {
    console.error("getBestsellingProducts:", error?.message);
    return [];
  }

  const totals = new Map<string, { productName: string; unitsSold: number }>();
  for (const item of items) {
    const existing = totals.get(item.product_id);
    if (existing) existing.unitsSold += item.quantity;
    else totals.set(item.product_id, { productName: item.product_name, unitsSold: item.quantity });
  }

  const productIds = [...totals.keys()];
  const { data: products } = await supabase.from("products").select("id, slug").in("id", productIds);
  const slugById = new Map((products ?? []).map((p) => [p.id, p.slug]));

  return [...totals.entries()]
    .map(([productId, v]) => ({
      productId,
      productName: v.productName,
      productSlug: slugById.get(productId) ?? "",
      unitsSold: v.unitsSold,
    }))
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, limit);
}
