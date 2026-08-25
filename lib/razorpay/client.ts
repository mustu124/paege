import "server-only";

import Razorpay from "razorpay";

// Server-only Razorpay SDK instance. Reads whichever credentials are
// in NEXT_PUBLIC_RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET — Test Mode
// today, Live Mode later — by design there's no separate "which
// environment" branching in code; switching modes is purely an env
// var swap.
export function getRazorpayClient() {
  return new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}
