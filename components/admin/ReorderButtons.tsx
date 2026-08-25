"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

import type { ActionResult } from "@/lib/types/admin-actions";

interface ReorderButtonsProps {
  id: string;
  disableUp?: boolean;
  disableDown?: boolean;
  action: (id: string, direction: "up" | "down") => Promise<ActionResult>;
}

export function ReorderButtons({ id, disableUp, disableDown, action }: ReorderButtonsProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick(direction: "up" | "down") {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      const result = await action(id, direction);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        <button
          type="button"
          aria-label="Move up"
          disabled={pending || disableUp}
          onClick={() => onClick("up")}
          className="p-1 text-charcoal-700 disabled:text-charcoal-500/30"
        >
          <ArrowUp size={14} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          aria-label="Move down"
          disabled={pending || disableDown}
          onClick={() => onClick("down")}
          className="p-1 text-charcoal-700 disabled:text-charcoal-500/30"
        >
          <ArrowDown size={14} strokeWidth={1.5} />
        </button>
      </div>
      {error && <p className="font-sans text-xs text-burgundy">{error}</p>}
    </div>
  );
}
