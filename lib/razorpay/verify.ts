import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

// Razorpay Checkout's payment-success signature: HMAC-SHA256 of
// "<razorpay_order_id>|<razorpay_payment_id>" using the key secret.
// timingSafeEqual avoids leaking match-length via response timing;
// both buffers must be equal length first or it throws, so a
// same-length check guards that.
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string,
): boolean {
  const expected = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== actualBuffer.length) return false;

  return timingSafeEqual(expectedBuffer, actualBuffer);
}

// Razorpay webhook signature: HMAC-SHA256 of the exact raw request
// body (not the parsed/re-serialized JSON — whitespace differences
// would change the hash) using the separate webhook secret configured
// in the Razorpay Dashboard. Caller must pass the untouched body
// string read via request.text(), before any JSON.parse.
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");

  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== actualBuffer.length) return false;

  return timingSafeEqual(expectedBuffer, actualBuffer);
}
