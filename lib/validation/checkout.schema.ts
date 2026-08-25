import { z } from "zod";

// Backs both form-level validation (client) and the request body
// the create-order route handler re-validates server-side — the
// server never trusts a client-sent price or quantity beyond what
// this shape allows through, and the checkout RPC re-derives price
// from live product data regardless.
export const shippingAddressSchema = z.object({
  name: z.string().trim().min(2, "Enter the recipient's full name"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  line1: z.string().trim().min(3, "Enter your address"),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, "Enter your city"),
  state: z.string().trim().min(2, "Enter your state"),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;

export const checkoutItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20),
});

export const createOrderRequestSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "Your cart is empty"),
  shippingAddress: shippingAddressSchema,
});

export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;

export const verifyPaymentRequestSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  order_id: z.string().uuid(),
});

export type VerifyPaymentRequest = z.infer<typeof verifyPaymentRequestSchema>;
