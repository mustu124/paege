import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="font-sans text-xs uppercase tracking-wider text-charcoal-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "border border-border bg-cream-50 px-4 py-3 font-sans text-sm text-charcoal-900 outline-none transition-colors duration-200 placeholder:text-charcoal-500/60 focus:border-charcoal-900",
            error && "border-burgundy",
            className,
          )}
          {...props}
        />
        {error && <p className="font-sans text-xs text-burgundy">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";
