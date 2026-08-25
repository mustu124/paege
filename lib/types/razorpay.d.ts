// Minimal shape for the window.Razorpay global injected by
// https://checkout.razorpay.com/v1/checkout.js — only the fields
// this app actually uses.
interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", handler: (response: { error: { description: string } }) => void) => void;
}

interface Window {
  Razorpay: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
}
