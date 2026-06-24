import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { ChevronDown } from "lucide-react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          className={cn(
            "w-full h-[38px] bg-white border border-gray-300 rounded-lg px-3 py-[9px] text-sm text-text-primary placeholder:text-text-tertiary transition-all duration-150 focus-visible:outline-none appearance-none disabled:bg-surface-subtle disabled:border-neutrals-border disabled:text-text-tertiary disabled:cursor-not-allowed",
            "focus:border-brand-accent focus:ring-0 focus:shadow-inputFocus",
            error && "border-danger focus:border-danger focus:shadow-inputError",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
          <ChevronDown className="h-4 w-4" />
        </span>
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
