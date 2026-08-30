"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/shop", label: "Find Yours" },
  { href: "/shop", label: "The Edit" },
  { href: "/shop?filter=new-arrivals", label: "The New Edit" },
  { href: "/shop?filter=bestsellers", label: "The Paege Favourites" },
  { href: "/about", label: "About Paege" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        onClick={() => setOpen((v) => !v)}
        className="p-2 text-charcoal-900"
      >
        {open ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
      </button>

      {open && (
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className="fixed inset-0 top-16 z-30 bg-charcoal-900/20"
        />
      )}

      <nav
        id="mobile-nav-drawer"
        aria-label="Primary"
        aria-hidden={!open}
        className={`fixed inset-x-0 top-16 z-40 origin-top border-t border-border bg-cream transition-transform duration-300 ease-editorial ${
          open ? "scale-y-100" : "pointer-events-none scale-y-0"
        }`}
      >
        <div className="flex flex-col divide-y divide-border px-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              className="py-4 font-sans text-sm uppercase tracking-wider text-charcoal-900"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
