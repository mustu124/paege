"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop?filter=new-arrivals", label: "The New Edit" },
];

const EDITS_LINKS = [
  { href: "/shop", label: "Find Yours (Shop All)" },
  { href: "/shop?category=dresses", label: "Dresses" },
  { href: "/shop?category=tops", label: "Tops" },
  { href: "/shop?category=bottoms", label: "Bottoms" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [editsOpen, setEditsOpen] = useState(false);

  // The drawer is portaled to document.body below — rendering it in
  // place would nest it inside <header>, which sets backdrop-blur-sm.
  // A backdrop-filter (like transform/filter/contain) makes its box
  // the containing block for `position: fixed` descendants, so the
  // drawer's `inset-0` would resolve against the header's own ~90px
  // box instead of the viewport: only the header-height sliver gets
  // painted, and everything below it overflows with no background,
  // bleeding straight through onto the page underneath. Portaling
  // out from under that ancestor is the fix, not just a workaround —
  // document isn't available during SSR, so the portal only mounts
  // once this effect has run client-side.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

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

  function close() {
    setOpen(false);
    setEditsOpen(false);
  }

  const drawer = (
    <div
      id="mobile-nav-drawer"
      aria-hidden={!open}
      className={`fixed inset-0 z-[60] flex flex-col bg-cream transition-transform duration-300 ease-editorial ${
        open ? "translate-x-0" : "pointer-events-none -translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between border-b border-border px-6 py-5">
        <div>
          <p className="font-serif text-2xl italic text-burgundy">PAEGE</p>
          <p className="mt-0.5 font-sans text-[10px] uppercase tracking-[0.2em] text-charcoal-500">A Part of You.</p>
        </div>
        <button type="button" aria-label="Close menu" tabIndex={open ? 0 : -1} onClick={close} className="p-2 text-charcoal-900">
          <X size={20} strokeWidth={1.5} />
        </button>
      </div>

      <nav aria-label="Primary" className="flex flex-col divide-y divide-border overflow-y-auto px-6">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            tabIndex={open ? 0 : -1}
            onClick={close}
            className="flex items-center justify-between py-4 font-sans text-sm uppercase tracking-wider text-charcoal-900"
          >
            {link.label}
            <ChevronRight size={16} strokeWidth={1.5} className="text-charcoal-500" />
          </Link>
        ))}

        <div>
          <button
            type="button"
            tabIndex={open ? 0 : -1}
            aria-expanded={editsOpen}
            onClick={() => setEditsOpen((v) => !v)}
            className="flex w-full items-center justify-between py-4 font-sans text-sm uppercase tracking-wider text-charcoal-900"
          >
            The Edits
            <ChevronDown
              size={16}
              strokeWidth={1.5}
              className={`text-charcoal-500 transition-transform ${editsOpen ? "rotate-180" : ""}`}
            />
          </button>
          {editsOpen && (
            <div className="flex flex-col gap-1 pb-4 pl-4">
              {EDITS_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  tabIndex={open ? 0 : -1}
                  onClick={close}
                  className="py-2 font-sans text-xs uppercase tracking-wider text-charcoal-700"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link
          href="/about"
          tabIndex={open ? 0 : -1}
          onClick={close}
          className="flex items-center justify-between py-4 font-sans text-sm uppercase tracking-wider text-charcoal-900"
        >
          About Paege
          <ChevronRight size={16} strokeWidth={1.5} className="text-charcoal-500" />
        </Link>
      </nav>

      <Link
        href="/shop"
        tabIndex={open ? 0 : -1}
        onClick={close}
        className="mt-auto bg-charcoal-900 py-4 text-center font-sans text-xs uppercase tracking-widest text-cream-50"
      >
        Shop Now
      </Link>
    </div>
  );

  return (
    <div className="lg:hidden">
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

      {mounted && createPortal(drawer, document.body)}
    </div>
  );
}
