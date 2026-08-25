import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database, OrderStatus, PaymentStatus, ShippingAddress } from "@/lib/types/database";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

export interface AdminOrderListItem {
  id: string;
  status: OrderStatus;
  latestPaymentStatus: PaymentStatus | null;
  customerName: string;
  customerEmail: string | null;
  totalPaise: number;
  itemCount: number;
  createdAt: string;
  placedAt: string | null;
}

interface OrderListRow extends OrderRow {
  order_items: { id: string }[];
  payments: { status: PaymentStatus; created_at: string }[];
}

// Only orders whose payment has actually completed show up here —
// pending_payment (never paid, or mid-flow) and payment_failed carry
// nothing to fulfill and would just be noise in the main list.
const COMPLETED_PAYMENT_STATUSES: OrderStatus[] = ["confirmed", "processing", "shipped", "delivered", "cancelled"];

export async function getAllOrdersAdmin(): Promise<AdminOrderListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items ( id ), payments ( status, created_at )")
    .in("status", COMPLETED_PAYMENT_STATUSES)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllOrdersAdmin:", error.message);
    return [];
  }

  return ((data ?? []) as unknown as OrderListRow[]).map((row) => {
    const latestPayment = [...row.payments].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0];

    return {
      id: row.id,
      status: row.status,
      latestPaymentStatus: latestPayment?.status ?? null,
      customerName: (row.shipping_address as ShippingAddress)?.name ?? "—",
      customerEmail: row.customer_email,
      totalPaise: row.total_paise,
      itemCount: row.order_items.length,
      createdAt: row.created_at,
      placedAt: row.placed_at,
    };
  });
}

export interface AdminOrderDetail extends OrderRow {
  items: OrderItemRow[];
}

export async function getOrderDetailAdmin(id: string): Promise<AdminOrderDetail | null> {
  const supabase = await createClient();

  const { data: order, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (error || !order) {
    if (error) console.error("getOrderDetailAdmin:", error.message);
    return null;
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  return {
    ...order,
    items: items ?? [],
  };
}
