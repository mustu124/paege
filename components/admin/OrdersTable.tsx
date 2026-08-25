"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { AdminOrderListItem } from "@/lib/data/admin/orders";
import { AdminTable, AdminTableHead, AdminTh, AdminTr, AdminTd } from "@/components/admin/AdminTable";
import { Input } from "@/components/ui/Input";
import { formatPaise, cn } from "@/lib/utils";
import type { OrderStatus, PaymentStatus } from "@/lib/types/database";

// pending_payment/payment_failed are excluded — getAllOrdersAdmin()
// only ever returns orders whose payment completed, so those two
// statuses would never match anything here.
const ORDER_STATUSES: OrderStatus[] = ["confirmed", "processing", "shipped", "delivered", "cancelled"];

const PAYMENT_STATUSES: PaymentStatus[] = ["created", "pending", "authorized", "captured", "failed", "refunded"];

function statusLabel(status: string) {
  return status.replace(/_/g, " ");
}

export function OrdersTable({ orders }: { orders: AdminOrderListItem[] }) {
  const [search, setSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (q) {
        const haystack = `${order.id} ${order.customerEmail ?? ""} ${order.customerName}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (orderStatus && order.status !== orderStatus) return false;
      if (paymentStatus && order.latestPaymentStatus !== paymentStatus) return false;
      if (fromDate && new Date(order.createdAt) < new Date(fromDate)) return false;
      if (toDate && new Date(order.createdAt) > new Date(`${toDate}T23:59:59`)) return false;
      return true;
    });
  }, [orders, search, orderStatus, paymentStatus, fromDate, toDate]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <Input
          placeholder="Search by order ID, email, or name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />

        <label className="flex flex-col gap-1.5">
          <span className="font-sans text-xs uppercase tracking-wider text-charcoal-700">Order Status</span>
          <select
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
            className="border border-border bg-cream-50 px-3 py-2.5 font-sans text-sm text-charcoal-900 outline-none focus:border-charcoal-900"
          >
            <option value="">All</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-sans text-xs uppercase tracking-wider text-charcoal-700">Payment Status</span>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="border border-border bg-cream-50 px-3 py-2.5 font-sans text-sm text-charcoal-900 outline-none focus:border-charcoal-900"
          >
            <option value="">All</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-sans text-xs uppercase tracking-wider text-charcoal-700">From</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-border bg-cream-50 px-3 py-2 font-sans text-sm text-charcoal-900 outline-none focus:border-charcoal-900"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-sans text-xs uppercase tracking-wider text-charcoal-700">To</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-border bg-cream-50 px-3 py-2 font-sans text-sm text-charcoal-900 outline-none focus:border-charcoal-900"
          />
        </label>
      </div>

      <p className="mb-3 font-sans text-xs text-charcoal-500">
        {filtered.length} of {orders.length} orders
      </p>

      <AdminTable>
        <AdminTableHead>
          <AdminTh>Order</AdminTh>
          <AdminTh>Customer</AdminTh>
          <AdminTh>Items</AdminTh>
          <AdminTh>Total</AdminTh>
          <AdminTh>Order Status</AdminTh>
          <AdminTh>Payment</AdminTh>
          <AdminTh>Placed</AdminTh>
          <AdminTh className="text-right">Actions</AdminTh>
        </AdminTableHead>
        <tbody>
          {filtered.map((order) => (
            <AdminTr key={order.id}>
              <AdminTd className="font-mono text-xs">{order.id.slice(0, 8)}…</AdminTd>
              <AdminTd>
                <div>{order.customerName}</div>
                <div className="text-xs text-charcoal-500">{order.customerEmail ?? "—"}</div>
              </AdminTd>
              <AdminTd className="text-charcoal-500">{order.itemCount}</AdminTd>
              <AdminTd>{formatPaise(order.totalPaise)}</AdminTd>
              <AdminTd>
                <span
                  className={cn(
                    "font-sans text-xs uppercase tracking-wider",
                    order.status === "cancelled" || order.status === "payment_failed" ? "text-burgundy" : "text-charcoal-900",
                  )}
                >
                  {statusLabel(order.status)}
                </span>
              </AdminTd>
              <AdminTd className="text-charcoal-500">
                {order.latestPaymentStatus ? statusLabel(order.latestPaymentStatus) : "—"}
              </AdminTd>
              <AdminTd className="text-charcoal-500">
                {order.placedAt ? new Date(order.placedAt).toLocaleDateString("en-IN") : "—"}
              </AdminTd>
              <AdminTd className="text-right">
                <Link href={`/admin/orders/${order.id}`} className="link-underline font-sans text-xs uppercase tracking-wider">
                  View
                </Link>
              </AdminTd>
            </AdminTr>
          ))}
        </tbody>
      </AdminTable>
    </div>
  );
}
