import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-[38px] w-full bg-surface border border-neutrals-border rounded-lg px-3 py-[9px] text-sm text-text-primary placeholder:text-text-tertiary transition-all duration-150 focus-visible:outline-none disabled:bg-surface-subtle disabled:border-neutrals-border disabled:text-text-tertiary disabled:cursor-not-allowed",
          // Focus state (green border + brand glow)
          "focus:border-brand-accent focus:ring-0 focus:shadow-inputFocus",
          // Error state (red border + red glow)
          error && "border-danger focus:border-danger focus:shadow-inputError",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
