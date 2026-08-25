"use client";

import { useState, useTransition } from "react";

import { updateOrderStatusAction } from "@/app/(admin)/admin/orders/actions";
import type { OrderStatus } from "@/lib/types/database";
import { Button } from "@/components/ui/Button";

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: [],
  payment_failed: [],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Payment Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  payment_failed: "Payment Failed",
};

export function OrderStatusControl({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const options = ALLOWED_TRANSITIONS[status];

  function onUpdate(newStatus: OrderStatus) {
    if (pending) return;
    if (!window.confirm(`Move this order to "${STATUS_LABEL[newStatus]}"?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, newStatus);
      if (result?.error) setError(result.error);
    });
  }

  if (options.length === 0) {
    return <p className="font-sans text-xs text-charcoal-500">No routine status change available from here.</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button key={option} type="button" variant="outline" size="sm" disabled={pending} onClick={() => onUpdate(option)}>
            Mark {STATUS_LABEL[option]}
          </Button>
        ))}
      </div>
      {error && <p className="mt-2 font-sans text-xs text-burgundy">{error}</p>}
    </div>
  );
}
