"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { cartSubtotalPaise, useCartStore } from "@/lib/store/cart";
import { shippingAddressSchema, type ShippingAddressInput } from "@/lib/validation/checkout.schema";
import { validateCartAction } from "@/app/(storefront)/cart/actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { OrderSummary } from "@/components/checkout/OrderSummary";

type Stage = "idle" | "validating" | "creating" | "paying" | "verifying";

const STAGE_LABEL: Record<Stage, string> = {
  idle: "Pay Now",
  validating: "Checking availability…",
  creating: "Creating your order…",
  paying: "Waiting for payment…",
  verifying: "Confirming your payment…",
};

interface CreateOrderResponse {
  orderId: string;
  razorpayOrderId: string;
  amountPaise: number;
  currency: string;
  keyId: string;
}

export function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const clear = useCartStore((s) => s.clear);
  const syncPrice = useCartStore((s) => s.syncPrice);

  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  // clear()-ing the cart after a successful payment also drops items
  // to 0, which would otherwise trip the empty-cart redirect below
  // right as we're navigating away on purpose — this flag tells that
  // effect to stand down once an order has actually gone through.
  const orderCompletedRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingAddressInput>({
    resolver: zodResolver(shippingAddressSchema),
  });

  useEffect(() => {
    if (orderCompletedRef.current) return;
    if (hasHydrated && items.length === 0) router.replace("/cart");
  }, [hasHydrated, items.length, router]);

  // A cart can arrive here still holding prices cached at add-to-cart
  // time — if the admin changed a price since, the summary/total shown
  // below would otherwise silently disagree with what Razorpay actually
  // charges once "Pay Now" recomputes the amount server-side.
  const variantKey = items.map((i) => i.variantId).join(",");
  useEffect(() => {
    if (!hasHydrated || items.length === 0) return;
    let cancelled = false;
    validateCartAction(items.map((i) => i.variantId)).then((results) => {
      if (cancelled) return;
      for (const item of items) {
        const result = results.find((r) => r.variantId === item.variantId);
        if (result?.currentPricePaise != null && result.currentPricePaise !== item.unitPricePaise) {
          syncPrice(item.variantId, result.currentPricePaise);
        }
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, variantKey]);

  useEffect(() => {
    if (document.getElementById("razorpay-checkout-js")) return;
    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  if (!hasHydrated || items.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  const subtotal = cartSubtotalPaise(items);
  const shipping = 0;
  const total = subtotal + shipping;

  async function onSubmit(shippingAddress: ShippingAddressInput) {
    setError(null);
    setStage("validating");

    const validation = await validateCartAction(items.map((i) => i.variantId));
    const blocking = validation.some((v) => !v.found || !v.productActive || v.status === "out_of_stock");
    if (blocking) {
      setError("Some items in your cart are no longer available. Please review your cart before continuing.");
      setStage("idle");
      return;
    }

    setStage("creating");

    let createRes: Response;
    try {
      createRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          shippingAddress,
        }),
      });
    } catch {
      setError("Network error. Please check your connection and try again.");
      setStage("idle");
      return;
    }

    const createData = await createRes.json().catch(() => ({}));

    if (!createRes.ok) {
      setError(createData.error ?? "Something went wrong. Please try again.");
      setStage("idle");
      return;
    }

    const order = createData as CreateOrderResponse;
    setStage("paying");

    if (typeof window === "undefined" || !window.Razorpay) {
      setError("Payment could not be loaded. Please refresh the page and try again.");
      setStage("idle");
      return;
    }

    const razorpay = new window.Razorpay({
      key: order.keyId,
      amount: order.amountPaise,
      currency: order.currency,
      order_id: order.razorpayOrderId,
      name: "PAEGE",
      description: `Order ${order.orderId.slice(0, 8).toUpperCase()}`,
      prefill: { name: shippingAddress.name, email: shippingAddress.email, contact: shippingAddress.phone },
      theme: { color: "#4a141c" },
      handler: async (response) => {
        setStage("verifying");
        try {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, order_id: order.orderId }),
          });
          const verifyData = await verifyRes.json().catch(() => ({}));

          if (!verifyRes.ok) {
            setError(verifyData.error ?? "We couldn't confirm your payment. Please contact support.");
            setStage("idle");
            return;
          }

          orderCompletedRef.current = true;
          clear();
          router.push("/");
        } catch {
          setError("We couldn't confirm your payment. If you were charged, please contact support.");
          setStage("idle");
        }
      },
      modal: {
        ondismiss: () => setStage("idle"),
      },
    });

    razorpay.on("payment.failed", (response) => {
      setError(response.error.description || "Payment failed. Please try again.");
      setStage("idle");
    });

    razorpay.open();
  }

  const busy = stage !== "idle";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
      <div className="flex flex-col gap-10">
        <section>
          <h2 className="mb-4 font-sans text-xs uppercase tracking-wider text-charcoal-900">
            1. Customer Information
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Full Name" error={errors.name?.message} {...register("name")} />
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Phone"
              type="tel"
              placeholder="10-digit mobile number"
              error={errors.phone?.message}
              {...register("phone")}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-sans text-xs uppercase tracking-wider text-charcoal-900">2. Shipping Address</h2>
          <div className="grid grid-cols-1 gap-4">
            <Input label="Address Line 1" error={errors.line1?.message} {...register("line1")} />
            <Input label="Address Line 2 (optional)" error={errors.line2?.message} {...register("line2")} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input label="City" error={errors.city?.message} {...register("city")} />
              <Input label="State" error={errors.state?.message} {...register("state")} />
              <Input label="Pincode" error={errors.pincode?.message} {...register("pincode")} />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-sans text-xs uppercase tracking-wider text-charcoal-900">3. Payment</h2>
          <p className="font-sans text-sm text-charcoal-700">
            You&apos;ll be securely redirected to Razorpay to complete your payment. We never see or
            store your card details.
          </p>
        </section>
      </div>

      <div className="h-fit lg:sticky lg:top-24">
        <OrderSummary items={items} subtotalPaise={subtotal} shippingPaise={shipping} totalPaise={total} />

        {error && (
          <p role="alert" className="mt-4 font-sans text-xs text-burgundy">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" size="lg" disabled={busy} className="mt-6 w-full">
          {STAGE_LABEL[stage]}
        </Button>
      </div>
    </form>
  );
}
