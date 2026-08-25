import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const selectId = id ?? props.name;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="font-sans text-xs uppercase tracking-wider text-charcoal-700"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "border border-border bg-cream-50 px-4 py-3 font-sans text-sm text-charcoal-900 outline-none transition-colors duration-200 focus:border-charcoal-900",
            error && "border-burgundy",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="font-sans text-xs text-burgundy">{error}</p>}
      </div>
    );
  },
);
Select.displayName = "Select";
