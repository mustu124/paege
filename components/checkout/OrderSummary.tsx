import type { CartItem } from "@/lib/store/cart";
import { getStorageUrl } from "@/lib/storage";
import { formatPaise } from "@/lib/utils";
import { SiteImage } from "@/components/ui/SiteImage";

interface OrderSummaryProps {
  items: CartItem[];
  subtotalPaise: number;
  shippingPaise: number;
  totalPaise: number;
}

export function OrderSummary({ items, subtotalPaise, shippingPaise, totalPaise }: OrderSummaryProps) {
  return (
    <div className="border border-border p-6">
      <p className="font-sans text-xs uppercase tracking-wider text-charcoal-900">4. Order Summary</p>

      <div className="mt-5 flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.variantId} className="flex gap-3">
            <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-cream-100">
              <SiteImage
                src={getStorageUrl("product-images", item.imagePath)}
                alt={item.productName}
                fill
                sizes="56px"
                className="object-cover"
              />
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-charcoal-900 font-sans text-[10px] text-cream-50">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-sans text-sm text-charcoal-900">{item.productName}</p>
              <p className="font-sans text-xs text-charcoal-500">Size {item.size}</p>
            </div>
            <p className="font-sans text-sm text-charcoal-900">{formatPaise(item.unitPricePaise * item.quantity)}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4 font-sans text-sm text-charcoal-700">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatPaise(subtotalPaise)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{shippingPaise === 0 ? "Free" : formatPaise(shippingPaise)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-border pt-3 font-sans text-base text-charcoal-900">
          <span>Total</span>
          <span>{formatPaise(totalPaise)}</span>
        </div>
      </div>
    </div>
  );
}
