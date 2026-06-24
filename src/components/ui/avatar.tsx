import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  xs: "h-5 w-5 text-[9px]",
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-[13px]",
  lg: "h-10 w-10 text-[16px]",
  xl: "h-14 w-14 text-[22px]",
};

export function getInitials(name = "Unknown") {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, name = "Unknown", size = "md", ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false);
    const initials = getInitials(name);

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full select-none justify-center items-center font-semibold bg-brand-accent text-white",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src && !hasError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={name}
            onError={() => setHasError(true)}
            className="aspect-square h-full w-full object-cover rounded-full"
          />
        ) : (
          <span className="leading-none">{initials}</span>
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

export { Avatar };
