"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const EDITS_LINKS = [
  { href: "/shop", label: "Find Yours (Shop All)" },
  { href: "/shop?category=dresses", label: "Dresses" },
  { href: "/shop?category=tops", label: "Tops" },
  { href: "/shop?category=bottoms", label: "Bottoms" },
];

// Desktop-only hover dropdown for "The Edits" — the only nav item
// with a submenu (per the brand's nav spec, everything else is a
// direct link). A short close delay keeps the panel open while the
// cursor crosses the small gap between the trigger and the panel.
export function EditsDropdown() {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openNow() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function closeSoon() {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  return (
    <div className="relative" onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <Link
        href="/shop"
        aria-expanded={open}
        className="link-underline flex items-center gap-1 whitespace-nowrap font-sans text-xs uppercase tracking-wider text-charcoal-900"
      >
        The Edits
        <ChevronDown size={12} strokeWidth={1.5} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </Link>

      {open && (
        <div className="absolute left-0 top-full z-10 min-w-[200px] border border-border bg-cream py-2 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.15)]">
          {EDITS_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block whitespace-nowrap px-4 py-2.5 font-sans text-xs uppercase tracking-wider text-charcoal-900 hover:bg-charcoal-900/5"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
