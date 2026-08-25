import type { OrderStatus } from "@/lib/types/database";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Payment Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  payment_failed: "Payment Failed",
};

// Deliberately restrained — one accent color (burgundy) for
// attention-worthy states, everything else reads as plain text, to
// avoid a traffic-light UI that clashes with the rest of the palette.
const NEEDS_ATTENTION: OrderStatus[] = ["payment_failed", "cancelled"];

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "font-sans text-xs uppercase tracking-wider",
        NEEDS_ATTENTION.includes(status) ? "text-burgundy" : "text-charcoal-700",
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
