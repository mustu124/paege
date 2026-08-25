import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { getOrderById } from "@/lib/data/orders";
import { getStorageUrl } from "@/lib/storage";
import { formatPaise } from "@/lib/utils";
import type { ShippingAddress } from "@/lib/types/database";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { SiteImage } from "@/components/ui/SiteImage";

export const metadata: Metadata = { title: "Order Confirmation" };

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  const order = await getOrderById(id);

  // An invalid/nonexistent id simply comes back null here. There's no
  // "not your order" case to distinguish — get_order_public() is
  // authorized purely by knowing this exact (unguessable) id, which
  // is also why this page's URL is the only way to find this order
  // again later (see the save-this-link note below).
  if (!order) notFound();

  const address = order.shipping_address as unknown as ShippingAddress;

  return (
    <Container className="py-10 md:py-14">
      <div className="mx-auto max-w-2xl">
        {order.status === "confirmed" && (
          <div className="mb-8 flex items-center gap-3 border border-border bg-cream-100 px-5 py-4">
            <CheckCircle2 size={20} strokeWidth={1.5} className="shrink-0 text-burgundy" />
            <p className="font-sans text-sm text-charcoal-900">
              Thank you — your order has been confirmed.
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="font-serif text-3xl italic text-charcoal-900 md:text-4xl">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="mt-1 font-sans text-xs text-charcoal-500">
              Placed{" "}
              {new Date(order.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="mt-8 flex flex-col gap-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-cream-100">
                <SiteImage
                  src={getStorageUrl("product-images", item.primary_image_path)}
                  alt={item.product_name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-sans text-sm text-charcoal-900">{item.product_name}</p>
                <p className="mt-0.5 font-sans text-xs text-charcoal-500">
                  Size {item.size} · Qty {item.quantity}
                </p>
              </div>
              <p className="font-sans text-sm text-charcoal-900">{formatPaise(item.line_total_paise)}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4 font-sans text-sm text-charcoal-700">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPaise(order.subtotal_paise)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{order.shipping_paise === 0 ? "Free" : formatPaise(order.shipping_paise)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-border pt-3 font-sans text-base text-charcoal-900">
            <span>Total</span>
            <span>{formatPaise(order.total_paise)}</span>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="font-sans text-xs uppercase tracking-wider text-charcoal-900">Shipping Address</p>
          <div className="mt-3 font-sans text-sm leading-relaxed text-charcoal-700">
            <p>{address.name}</p>
            <p>{address.line1}</p>
            {address.line2 && <p>{address.line2}</p>}
            <p>
              {address.city}, {address.state} {address.pincode}
            </p>
            <p>{address.phone}</p>
          </div>
        </div>

        <div className="mt-10 border border-border bg-cream-100 px-5 py-4">
          <p className="font-sans text-sm text-charcoal-900">
            Save this page — bookmark it or keep the link handy. Since checkout doesn&apos;t require an
            account, this link is the only way to check this order&apos;s status again later.
          </p>
        </div>

        <Link href="/shop" className="mt-6 block">
          <Button variant="outline" className="w-full">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </Container>
  );
}
