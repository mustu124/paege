import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getRazorpayClient } from "@/lib/razorpay/client";
import { verifyPaymentSignature } from "@/lib/razorpay/verify";
import { verifyPaymentRequestSchema } from "@/lib/validation/checkout.schema";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = verifyPaymentRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment verification request." }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = parsed.data;

  // Reject on a bad signature without touching any order state — an
  // invalid signature could just as easily be a malformed/forged
  // request as a real failed payment, so there is nothing safe to
  // conclude about the order from it.
  if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    return NextResponse.json({ error: "Payment verification failed." }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("id, razorpay_order_id, total_paise")
    .eq("id", order_id)
    .single();

  if (orderError || !order || order.razorpay_order_id !== razorpay_order_id) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const { data: result, error: confirmError } = await admin
    .rpc("confirm_paid_order", {
      p_order_id: order.id,
      p_razorpay_payment_id: razorpay_payment_id,
      p_razorpay_signature: razorpay_signature,
      p_amount_paise: order.total_paise,
    })
    .single();

  if (confirmError) {
    const message = confirmError.message ?? "";

    if (message.startsWith("insufficient_stock")) {
      await admin.rpc("mark_order_payment_failed", { p_order_id: order.id });

      // Best-effort refund: the payment was captured by Razorpay but
      // we can't fulfill it (stock ran out between checkout page
      // load and payment completion). If the refund call itself
      // fails, this is logged for manual follow-up rather than
      // silently losing track of the customer's money.
      try {
        const razorpay = getRazorpayClient();
        await razorpay.payments.refund(razorpay_payment_id, { amount: order.total_paise });
      } catch (refundErr) {
        console.error("verify: refund failed after insufficient_stock", order.id, refundErr);
      }

      return NextResponse.json(
        { error: "An item in your order sold out during checkout. Your payment is being refunded." },
        { status: 409 },
      );
    }

    if (message.startsWith("order_not_found")) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    console.error("verify confirm_paid_order:", message);
    return NextResponse.json({ error: "Couldn't confirm your payment. Please contact support." }, { status: 500 });
  }

  return NextResponse.json({ orderId: order.id, status: result?.order_status ?? "confirmed" });
}
