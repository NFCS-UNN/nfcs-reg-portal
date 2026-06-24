import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary: "bg-brand text-slate-900 hover:bg-brand-accent hover:text-white active:bg-brand-dark border-none shadow-none disabled:bg-neutrals-border disabled:text-text-tertiary",
        secondary: "bg-white text-gray-700 border border-neutrals-border hover:bg-surface-subtle hover:border-text-tertiary shadow-none disabled:bg-surface-subtle disabled:text-text-tertiary disabled:border-neutrals-border",
        danger: "bg-danger text-white hover:bg-[#a83318] active:bg-[#8c2912] border-none shadow-none",
        ghost: "bg-transparent text-brand-dark hover:bg-brand-light border-none shadow-none",
        iconButton: "h-9 w-9 border border-neutrals-border hover:bg-surface-page hover:border-text-tertiary text-text-secondary rounded-lg justify-center p-0 shadow-none",
      },
      size: {
        default: "px-[18px] py-[9px] rounded-lg",
        sm: "px-3 py-1.5 text-xs rounded-md",
        lg: "px-6 py-3 text-base rounded-lg",
        icon: "h-9 w-9 rounded-lg p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          isLoading && "opacity-70 cursor-wait pointer-events-none"
        )}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
