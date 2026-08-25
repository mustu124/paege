# Supabase setup (owner-configured)

This project ships its schema as plain SQL migrations. These steps
are for the project owner, whether setting up for the first time or
confirming an existing project is current.

## 1. Create the project

Create a project at https://supabase.com, then copy `.env.local.example`
to `.env.local` in the repo root and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (Settings → API → service_role — keep secret)

## 2. Run the migrations

Using the Supabase CLI (`npm i -g supabase`, then `supabase login`):

```
supabase link --project-ref <your-project-ref>
supabase db push
```

Or paste each file in `supabase/migrations/` (in numeric order,
`0001_...` through the highest-numbered file present) into the
Supabase Dashboard's SQL Editor and run them in order.
`0019_seed_products.sql` seeds the five launch products (Scarlet,
Noir, Blossom, Softwave, Margot) with variants and placeholder stock
— their `description` and `wash_care_instructions` are left NULL
pending real copy; see the comment at the top of that file for the
update statements to fill them in later. No real product/homepage
photography is seeded anywhere — every image field starts empty and
renders a labeled placeholder until an admin uploads real photos
through the admin panel (see `lib/storage.ts` for how that resolution
works).

## 3. Create Storage buckets

Three **public** buckets are referenced by the schema and app code:

- `product-images` — product gallery photos (`product_images.storage_path`)
- `homepage-slides` — homepage hero images, one per slide (`homepage_slides.image_path`)
- `category-images` — category tile photos (`categories.image_storage_path`)

Create each via Dashboard → Storage → New bucket, marked **Public**
(read access is public; uploads are restricted to admins by the
application's server-side checks — every admin mutation re-verifies
`requireAdmin()` server-side and uses the service-role client for the
actual upload, so the anon key alone can't write regardless of
whether bucket-level RLS policies are also configured).

Every image field (`product_images.storage_path`,
`homepage_slides.image_path`, `categories.image_storage_path`) can
also hold a full external `https://` URL instead of a bucket path —
the admin panel's image controls accept either an upload or a pasted
URL. Google Drive share links are rejected with a message to upload
the file or use a real direct-hosting URL instead, since Drive isn't
reliable for hotlinking in production.

## 4. Razorpay webhook (optional at first, recommended before real traffic)

The checkout flow works fully without this — `POST /api/payments/verify`
confirms most payments immediately from the browser. The webhook is a
backstop for the case where a payment succeeds but the browser never
completes that call (tab closed, network drop): without it, that
order would sit in `pending_payment` forever with no automatic
recovery.

Once the app is deployed to a real HTTPS URL:

1. Razorpay Dashboard → Settings → Webhooks → Add New Webhook.
2. URL: `https://<your-deployed-domain>/api/payments/webhook`.
3. Subscribe to at least `payment.captured` and `payment.failed`.
4. Copy the generated secret into `RAZORPAY_WEBHOOK_SECRET` in the
   deployment's environment variables (not `.env.local.example` —
   that stays a placeholder). Until this is set, the webhook route
   safely rejects every request rather than processing anything
   unverified; nothing breaks by deploying without it first.

## 5. Create your admin account

There is no customer-facing signup (checkout is guest-only, see
`0032_guest_checkout.sql`) — the only accounts in this project are
admin accounts, created directly in the dashboard:

1. Dashboard → Authentication → Users → Add User (set an email and
   password, or send an invite — either way, no app code is involved).
2. In the SQL Editor:

```sql
insert into user_roles (user_id, role) values ('<the-new-user-uuid>', 'admin');
```

Roles live in `user_roles`, not on `profiles` — there is no client
write path to this table at all (see `0008_user_roles.sql`), so this
insert can only be done from the SQL Editor or another
service-role/direct-database context, never through the app. Sign in
at `/login` afterward — that page is the admin entry point (nothing
customer-facing links to it).

## 6. Keeping TypeScript types in sync

`lib/types/database.ts` is hand-written and kept in sync with each
migration as it's added (not auto-generated) — it also carries doc
comments and Insert/Update shapes tailored to how the app actually
uses each table. If you add your own migration, update this file to
match by hand rather than regenerating it wholesale with
`supabase gen types typescript`, which would produce a differently-shaped
file and likely break existing code that relies on the current shapes.
