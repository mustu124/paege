import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getRazorpayClient } from "@/lib/razorpay/client";
import { createOrderRequestSchema } from "@/lib/validation/checkout.schema";

export async function POST(request: Request) {
  // Guest checkout only — no account required. Nothing here trusts
  // client-supplied identity; the order carries no user_id, and every
  // price/stock figure is still re-derived server-side by
  // create_order_for_checkout regardless of what the client sent.
  const body = await request.json().catch(() => null);
  const parsed = createOrderRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // Server-computed only: create_order_for_checkout re-derives every
  // price from live products/product_variants and re-validates stock
  // with row locks — the client never supplies a price or a trusted
  // stock claim, only variant ids + quantities.
  const { data: orderId, error: rpcError } = await admin.rpc("create_order_for_checkout", {
    p_user_id: null,
    p_items: parsed.data.items.map((item) => ({ variant_id: item.variantId, quantity: item.quantity })),
    p_shipping_address: parsed.data.shippingAddress,
    p_shipping_paise: 0,
    p_customer_email: parsed.data.shippingAddress.email,
  });

  if (rpcError || !orderId) {
    const message = rpcError?.message ?? "";
    if (message.startsWith("insufficient_stock")) {
      return NextResponse.json(
        { error: "One or more items in your cart just sold out. Please review your cart and try again." },
        { status: 409 },
      );
    }
    if (message.startsWith("variant_not_found") || message.startsWith("product_unavailable")) {
      return NextResponse.json(
        { error: "One or more items in your cart are no longer available. Please review your cart." },
        { status: 409 },
      );
    }
    console.error("create-order RPC:", message);
    return NextResponse.json({ error: "Couldn't create your order. Please try again." }, { status: 500 });
  }

  const { data: order, error: orderFetchError } = await admin
    .from("orders")
    .select("total_paise, currency")
    .eq("id", orderId)
    .single();

  if (orderFetchError || !order) {
    console.error("create-order fetch:", orderFetchError?.message);
    return NextResponse.json({ error: "Couldn't create your order. Please try again." }, { status: 500 });
  }

  try {
    const razorpay = getRazorpayClient();
    const razorpayOrder = await razorpay.orders.create({
      amount: order.total_paise,
      currency: order.currency,
      receipt: orderId,
      notes: { order_id: orderId },
      payment_capture: true,
    });

    const { error: updateError } = await admin
      .from("orders")
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq("id", orderId);

    if (updateError) {
      console.error("create-order attach razorpay_order_id:", updateError.message);
      return NextResponse.json({ error: "Couldn't start payment. Please try again." }, { status: 500 });
    }

    return NextResponse.json({
      orderId,
      razorpayOrderId: razorpayOrder.id,
      amountPaise: order.total_paise,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("create-order razorpay:", err);
    return NextResponse.json({ error: "Couldn't start payment. Please try again." }, { status: 500 });
  }
}
