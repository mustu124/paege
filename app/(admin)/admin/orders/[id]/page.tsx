import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getOrderDetailAdmin } from "@/lib/data/admin/orders";
import { formatPaise } from "@/lib/utils";
import type { ShippingAddress } from "@/lib/types/database";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";
import { ForceConfirmControl } from "@/components/admin/ForceConfirmControl";
import { SiteImage } from "@/components/ui/SiteImage";
import { getStorageUrl } from "@/lib/storage";

export const metadata: Metadata = { title: "Order Detail" };

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderDetailAdmin(id);
  if (!order) notFound();

  const address = order.shipping_address as unknown as ShippingAddress;
  const canForceConfirm = order.status === "pending_payment" || order.status === "payment_failed";

  return (
    <div>
      <AdminPageHeader
        title={`Order #${order.id.slice(0, 8).toUpperCase()}`}
        description={`Placed ${new Date(order.created_at).toLocaleString("en-IN")}`}
        action={<OrderStatusBadge status={order.status} />}
      />

      <div className="grid grid-cols-1 gap-10 p-8 lg:grid-cols-3">
        <div className="flex flex-col gap-10 lg:col-span-2">
          <section>
            <h2 className="mb-4 font-sans text-xs uppercase tracking-wider text-charcoal-900">Items</h2>
            <div className="divide-y divide-border border-y border-border">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3">
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-cream-100">
                    <SiteImage
                      src={getStorageUrl("product-images", item.primary_image_path)}
                      alt={item.product_name}
                      fill
                      sizes="52px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-sans text-sm text-charcoal-900">{item.product_name}</p>
                    <p className="mt-0.5 font-sans text-xs text-charcoal-500">
                      Size {item.size} · Qty {item.quantity} · {formatPaise(item.unit_price_paise)} each
                    </p>
                  </div>
                  <p className="font-sans text-sm text-charcoal-900">{formatPaise(item.line_total_paise)}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-2 font-sans text-sm text-charcoal-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPaise(order.subtotal_paise)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{order.shipping_paise === 0 ? "Free" : formatPaise(order.shipping_paise)}</span>
              </div>
              <div className="mt-1 flex justify-between border-t border-border pt-3 font-sans text-base text-charcoal-900">
                <span>Total</span>
                <span>{formatPaise(order.total_paise)}</span>
              </div>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-8">
          <section>
            <h2 className="mb-4 font-sans text-xs uppercase tracking-wider text-charcoal-900">Customer</h2>
            <p className="font-sans text-sm text-charcoal-900">{address.name}</p>
            <p className="mt-1 font-sans text-sm text-charcoal-500">{order.customer_email ?? "—"}</p>
          </section>

          <section>
            <h2 className="mb-4 font-sans text-xs uppercase tracking-wider text-charcoal-900">Shipping Address</h2>
            <div className="font-sans text-sm leading-relaxed text-charcoal-700">
              <p>{address.line1}</p>
              {address.line2 && <p>{address.line2}</p>}
              <p>
                {address.city}, {address.state} {address.pincode}
              </p>
              <p>{address.phone}</p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-sans text-xs uppercase tracking-wider text-charcoal-900">Update Fulfillment</h2>
            <OrderStatusControl orderId={order.id} status={order.status} />
          </section>

          {canForceConfirm && (
            <section>
              <h2 className="mb-4 font-sans text-xs uppercase tracking-wider text-charcoal-900">Manual Override</h2>
              <ForceConfirmControl orderId={order.id} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
