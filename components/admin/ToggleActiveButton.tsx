"use client";

import { useState, useTransition } from "react";

import { cn } from "@/lib/utils";
import type { ActionResult } from "@/lib/types/admin-actions";

interface ToggleActiveButtonProps {
  id: string;
  isActive: boolean;
  action: (id: string, isActive: boolean) => Promise<ActionResult>;
}

export function ToggleActiveButton({ id, isActive, action }: ToggleActiveButtonProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      const result = await action(id, !isActive);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={onClick}
        className={cn(
          "border px-2.5 py-1 font-sans text-xs uppercase tracking-wider transition-colors",
          isActive
            ? "border-charcoal-900 bg-charcoal-900 text-cream-50"
            : "border-border text-charcoal-500 hover:border-charcoal-900",
          pending && "opacity-50",
        )}
      >
        {isActive ? "Active" : "Inactive"}
      </button>
      {error && <p className="font-sans text-xs text-burgundy">{error}</p>}
    </div>
  );
}
