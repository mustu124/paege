import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-burgundy text-cream-50 hover:bg-burgundy-800 disabled:bg-charcoal-500/40",
  outline:
    "border border-charcoal-900 text-charcoal-900 hover:bg-charcoal-900 hover:text-cream-50 disabled:border-charcoal-500/40 disabled:text-charcoal-500/40",
  ghost:
    "text-charcoal-900 hover:bg-charcoal-900/5 disabled:text-charcoal-500/40",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap font-sans uppercase tracking-wider transition-colors duration-300 ease-editorial disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
