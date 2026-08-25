import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

export interface OrderWithItems extends OrderRow {
  items: OrderItemRow[];
}

// There's no login, so there's no "your own orders" list — the order
// confirmation page (the only place an order is ever looked up by a
// customer) is reached by its exact id, which is what get_order_public
// authorizes on: a SECURITY DEFINER function bounded to exactly the
// one row matching the id argument, safe to expose to anon/authenticated
// without a blanket RLS read policy on orders (see 0032_guest_checkout.sql).
export async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const supabase = await createClient();

  const { data: orders, error } = await supabase.rpc("get_order_public", { p_order_id: orderId });
  const order = orders?.[0];

  if (error || !order) {
    if (error) console.error("getOrderById:", error.message);
    return null;
  }

  const { data: items, error: itemsError } = await supabase.rpc("get_order_items_public", { p_order_id: orderId });

  if (itemsError) {
    console.error("getOrderById items:", itemsError.message);
  }

  return { ...order, items: items ?? [] };
}
