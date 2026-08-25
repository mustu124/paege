import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // The authoritative gate — redirects non-admins before anything
  // under /admin renders. Individual admin server actions re-check
  // this themselves too (defense in depth), since this layout check
  // alone only protects page renders, not a mutation invoked out of
  // band.
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-cream">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
