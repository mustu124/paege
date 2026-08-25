import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-sans text-xs text-charcoal-500">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={12} strokeWidth={1.5} />}
          {item.href ? (
            <Link href={item.href} className="hover:text-charcoal-900">
              {item.label}
            </Link>
          ) : (
            <span aria-current="page" className="text-charcoal-900">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
