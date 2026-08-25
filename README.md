# PAEGE

A production e-commerce site for a women's fashion brand, built with
Next.js App Router, TypeScript, Tailwind CSS, Supabase, and Razorpay.

## Status

This repository is being built in phases:

- [x] **Phase 1** — project scaffold, full Supabase SQL schema/RLS/RPCs, design system, shared layout, homepage carousel.
- [x] **Database architecture** — expanded schema (`user_roles`, `inventory`, `bestsellers`, `admin_audit_log`), seeded with the launch product catalogue.
- [x] **Customer-facing UI** — refined header, 5-slide desktop/mobile hero carousel, homepage sections (category discovery, bestsellers, new arrivals, featured editorial, brand story), full shop/category page with category/size/colour/price filters + sort, sold-out/new/bestseller badges.
- [x] **Product detail page + cart** — gallery, dynamic size/stock selector, quantity, real Add to Cart / Buy It Now, wash care, "You May Also Like".
- [x] **Shopping flow** — guest checkout, no account required, nothing saved beyond the order itself; client-side cart with live stock/price revalidation, Razorpay Test Mode payment with server-side signature verification + webhook backstop, order confirmation page reachable by its own link (the only "order history" there is, by design).
- [x] **Admin panel** — dashboard, product/category/inventory management with full audit trail, homepage slide management (5 desktop + 5 mobile slots), bestseller/new-arrival curation, order management with an audited manual-confirm override.
- [x] **Image architecture** — centralized resolver supporting Supabase Storage paths or external URLs, admin upload/replace/reorder/alt-text controls, Google Drive share-link rejection.

## Getting started

```
npm install
cp .env.local.example .env.local   # then fill in real values
npm run dev
```

The site will render with empty states until a Supabase project is
connected — see [`supabase/README.md`](supabase/README.md) for setup
steps (create project, run migrations, create Storage buckets,
promote your account to admin).

## Tech stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres, Auth, Storage)
- Razorpay (payments)
- Zod + React Hook Form

## Project structure

```
app/(storefront)/   customer-facing pages (own header/footer layout)
app/(auth)/          login / signup
app/(admin)/          admin panel — requireAdmin()-gated layout + all admin routes
app/api/               route handlers (checkout, payment verify + webhook)
components/ui/        shared primitives (Button, Input, Select, SiteImage, ...)
components/layout/    header, footer, nav
components/home/      homepage carousel + product rail/card
components/admin/     admin panel client components
lib/supabase/         server / browser / middleware / admin Supabase clients
lib/data/              read-only data fetchers (storefront)
lib/data/admin/        read-only data fetchers (admin)
lib/admin/              shared admin-mutation helpers (image input resolution)
lib/auth/               requireAdmin() server-side authorization check + audit logging
lib/razorpay/           Razorpay client + signature verification (checkout + webhook)
lib/storage.ts          centralized image-URL resolution (Storage path vs external URL)
lib/types/database.ts  hand-written types matching the SQL schema
supabase/migrations/   ordered SQL migrations (schema, RLS, RPCs, seed data)
```

## Database architecture

19 ordered SQL migrations in `supabase/migrations/` — see that
directory's inline comments for full reasoning. Highlights:

- **Roles are a separate table, not a column.** `user_roles` (not
  `profiles.role`) is the single source of truth for authorization,
  checked everywhere through one `is_admin()` SQL function. No client
  write policy exists on `user_roles` at all — a role can only be
  granted by the signup trigger (`customer`) or direct
  database/service-role access, so privilege escalation via a
  compromised client request is structurally impossible, not just
  policy-guarded.
- **Stock is variant-aware and separately normalized.**
  `product_variants` holds size/SKU identity; `inventory` holds the
  count (1:1). Raw quantities are never exposed publicly — only a
  computed status (`in_stock` / `low_stock` / `out_of_stock`) via
  `get_product_availability()`, since exact stock counts are
  commercially sensitive.
- **Bestsellers vs. curation are different concerns.**
  `products.is_bestseller` is a general tag; the `bestsellers` table
  is the admin-ordered, explicitly curated homepage placement — a
  product can carry the tag without being featured, on purpose.
- **The admin audit log is append-only for everyone, including
  admins.** No UPDATE/DELETE policy exists on `admin_audit_log`, and
  the only INSERT path is `log_admin_action()`, which stamps
  `admin_id` from the caller's own session rather than trusting a
  client-supplied value.
- **The cart is client-side only** (`lib/store/cart.ts`, localStorage)
  — there's no account for it to sync to, and it's intentionally not
  stock-checked on write, since stock fluctuates constantly and a
  cart is allowed to hold more than is currently available. The one
  authoritative check is at the checkout RPC.
- **Checkout requires no account.** `orders.user_id` is nullable —
  every order is a guest order, identified only by its own id.
  `get_order_public()`/`get_order_items_public()` (SECURITY DEFINER,
  bounded to the exact id passed in) are what let the order
  confirmation page work without a login, without ever exposing a
  blanket "list all orders" read policy to anon/authenticated.

## Security notes

- `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, and
  `RAZORPAY_WEBHOOK_SECRET` are server-only and must never be
  prefixed with `NEXT_PUBLIC_`. Razorpay is Test Mode only for now —
  `NEXT_PUBLIC_RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` hold the
  test credentials directly (no separate test/prod pair); going live
  later is just swapping those two values for Live Mode credentials,
  no code changes. `RAZORPAY_WEBHOOK_SECRET` comes from the Razorpay
  Dashboard once a webhook is registered against a real deployed URL
  (see `supabase/README.md` / final report for the exact steps) — the
  webhook route safely rejects everything until it's set, so it's
  fine to deploy without it and add it after.
- `lib/supabase/admin.ts` uses the service-role key and is guarded
  with `import "server-only"` — it must only be imported from
  `app/api/**` route handlers or admin server actions.
- Every table has Row Level Security enabled (see
  `supabase/migrations/0016_rls_policies.sql`).
- Checkout stock decrement and payment confirmation happen inside a
  single idempotent Postgres function (`confirm_paid_order`, see
  `supabase/migrations/0017_rpc_checkout_functions.sql`) shared by
  both `POST /api/payments/verify` (client-side, immediate) and
  `POST /api/payments/webhook` (server-to-server backstop if the
  client never completes verification), so duplicate calls, retries,
  and webhook replays are all safe — deduped both by a unique index
  on `payments.razorpay_payment_id` and by `webhook_events`'s primary
  key on the Razorpay event id.
