import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/razorpay/verify";

interface RazorpayWebhookPayload {
  event: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        status?: string;
      };
    };
  };
}

// Backstop for the client-side /api/payments/verify flow: if the
// browser tab closes or the network drops right after a successful
// Razorpay payment but before the client's verify call completes, the
// order would otherwise sit in pending_payment forever despite the
// customer having actually paid. Razorpay retries webhook delivery
// independently of the browser, so this is what actually closes that
// gap. Signature is verified over the raw body with a webhook-specific
// secret (distinct from the checkout-signature secret usage above),
// per Razorpay's documented webhook contract. Reuses the same
// confirm_paid_order / mark_order_payment_failed RPCs the client-side
// route uses, so both paths converge on the same idempotent state
// regardless of which one wins the race.
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  let body: RazorpayWebhookPayload;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const payment = body.payload?.payment?.entity;
  const eventId = request.headers.get("x-razorpay-event-id") ?? (payment?.id ? `${body.event}:${payment.id}` : null);

  if (!eventId) {
    // Nothing to dedupe or act on (an event type with no payment
    // entity) — acknowledge so Razorpay doesn't retry indefinitely.
    return NextResponse.json({ ok: true });
  }

  const admin = createAdminClient();

  // webhook_events.id is the primary key — a retried/replayed
  // delivery hits it and is rejected before any side effect runs.
  const { error: dedupeError } = await admin
    .from("webhook_events")
    .insert({ id: eventId, event_type: body.event, payload: body as unknown as Record<string, unknown> });

  if (dedupeError) {
    // Unique violation = already processed this exact event; any
    // other insert failure is logged but still acknowledged, since
    // retrying a broken insert won't fix itself and Razorpay would
    // otherwise hammer this endpoint indefinitely.
    if (dedupeError.code !== "23505") {
      console.error("webhook: dedupe insert failed", dedupeError.message);
    }
    return NextResponse.json({ ok: true, deduped: dedupeError.code === "23505" });
  }

  if (body.event === "payment.captured" && payment?.order_id && payment.id) {
    const { data: order } = await admin
      .from("orders")
      .select("id, total_paise")
      .eq("razorpay_order_id", payment.order_id)
      .maybeSingle();

    if (order) {
      const { error: confirmError } = await admin
        .rpc("confirm_paid_order", {
          p_order_id: order.id,
          p_razorpay_payment_id: payment.id,
          p_razorpay_signature: signature,
          p_amount_paise: order.total_paise,
        })
        .single();

      if (confirmError && !confirmError.message.startsWith("insufficient_stock")) {
        console.error("webhook: confirm_paid_order failed", confirmError.message);
      }
      // insufficient_stock here means the client-side verify path
      // already handled the refund-and-fail flow for this order, or
      // will when it runs — nothing further for the webhook to do.
    }
  }

  if (body.event === "payment.failed" && payment?.order_id) {
    const { data: order } = await admin
      .from("orders")
      .select("id")
      .eq("razorpay_order_id", payment.order_id)
      .maybeSingle();

    if (order) {
      await admin.rpc("mark_order_payment_failed", { p_order_id: order.id });
    }
  }

  return NextResponse.json({ ok: true });
}
