import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase session cookie on every request. This is a
// UX convenience (keeps sessions alive across server navigations),
// NOT the authorization boundary — admin route protection is
// re-verified server-side in the (admin) layout regardless. There is
// no customer-facing account system — checkout doesn't require a
// session, so /admin is the only path gated here.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Supabase isn't configured yet (no .env.local) — skip session
  // refresh so the app still renders instead of throwing. /admin
  // stays reachable in this state; the authoritative server-side
  // check (requireAdmin()) still gates real access once Supabase is
  // connected.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const requiresAuth = path.startsWith("/admin");

  if (requiresAuth && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
