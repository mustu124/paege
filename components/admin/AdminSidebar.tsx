"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Boxes,
  FolderTree,
  Image as ImageIcon,
  Images,
  Star,
  ClipboardList,
} from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/homepage", label: "Homepage", icon: ImageIcon },
  { href: "/admin/site-images", label: "Site Images", icon: Images },
  { href: "/admin/featured", label: "Bestsellers & New Arrivals", icon: Star },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-cream py-8">
      <Link href="/" className="mb-1 px-6 font-serif text-2xl italic text-burgundy">
        PAEGE
      </Link>
      <p className="mb-8 px-6 font-sans text-[10px] uppercase tracking-widest text-charcoal-500">Admin</p>

      <div className="flex flex-col gap-0.5 px-3">
        {NAV_ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 font-sans text-sm transition-colors duration-200",
                active ? "bg-charcoal-900 text-cream-50" : "text-charcoal-700 hover:bg-charcoal-900/5",
              )}
            >
              <Icon size={16} strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
