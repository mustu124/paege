"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export function Disclosure({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-left font-sans text-xs uppercase tracking-wider text-charcoal-900"
      >
        {title}
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="pb-5 font-sans text-sm leading-relaxed text-charcoal-700">{children}</div>}
    </div>
  );
}
