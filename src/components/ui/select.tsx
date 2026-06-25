"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import {
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils/cn";

// Export primitive namespace
export { SelectPrimitive };

// We define the main Root component
export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onChange?: (e: { target: { name?: string; value: string } }) => void;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  placeholder?: string;
  error?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const selectTriggerVariants = cva(
  "relative inline-flex h-[38px] w-full min-w-36 select-none items-center justify-between gap-2 rounded-lg border border-neutrals-border bg-white px-3 text-left text-sm text-text-primary transition-all focus-visible:outline-none focus:border-brand-accent focus:ring-0 focus:shadow-inputFocus disabled:bg-surface-subtle disabled:border-neutrals-border disabled:text-text-tertiary disabled:cursor-not-allowed pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 aria-invalid:border-danger focus:aria-invalid:shadow-inputError",
  {
    defaultVariants: {
      size: "default",
    },
    variants: {
      size: {
        default: "",
        lg: "h-[42px] text-base",
        sm: "h-[32px] text-xs px-2.5 gap-1.5",
      },
    },
  },
);

export const selectTriggerIconClassName = "-me-1 h-4 w-4 opacity-80";

export interface SelectButtonProps extends useRender.ComponentProps<"button"> {
  size?: VariantProps<typeof selectTriggerVariants>["size"];
}

export function SelectButton({
  className,
  size,
  render,
  children,
  ...props
}: SelectButtonProps): React.ReactElement {
  const typeValue: React.ButtonHTMLAttributes<HTMLButtonElement>["type"] =
    render ? undefined : "button";

  const defaultProps = {
    children: (
      <>
        <span className="flex-1 truncate in-data-placeholder:text-text-tertiary">
          {children}
        </span>
        <ChevronsUpDownIcon className={selectTriggerIconClassName} />
      </>
    ),
    className: cn(selectTriggerVariants({ size }), "min-w-0", className),
    "data-slot": "select-button",
    type: typeValue,
  };

  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(defaultProps, props),
    render,
  });
}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  SelectPrimitive.Trigger.Props & VariantProps<typeof selectTriggerVariants>
>(({ className, size = "default", children, ...props }, ref) => {
  return (
    <SelectPrimitive.Trigger
      className={cn(selectTriggerVariants({ size }), className)}
      data-slot="select-trigger"
      ref={ref}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon data-slot="select-icon" className="text-text-tertiary">
        <ChevronDownIcon className="h-4 w-4" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = "SelectTrigger";

export const SelectValue = React.forwardRef<
  HTMLSpanElement,
  SelectPrimitive.Value.Props
>(({ className, ...props }, ref) => {
  return (
    <SelectPrimitive.Value
      className={cn(
        "flex-1 truncate data-placeholder:text-text-tertiary",
        className,
      )}
      data-slot="select-value"
      ref={ref}
      {...props}
    />
  );
});
SelectValue.displayName = "SelectValue";

export function SelectPopup({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  alignItemWithTrigger = false,
  anchor,
  portalProps,
  ...props
}: SelectPrimitive.Popup.Props & {
  portalProps?: SelectPrimitive.Portal.Props;
  side?: SelectPrimitive.Positioner.Props["side"];
  sideOffset?: SelectPrimitive.Positioner.Props["sideOffset"];
  align?: SelectPrimitive.Positioner.Props["align"];
  alignOffset?: SelectPrimitive.Positioner.Props["alignOffset"];
  alignItemWithTrigger?: SelectPrimitive.Positioner.Props["alignItemWithTrigger"];
  anchor?: SelectPrimitive.Positioner.Props["anchor"];
}): React.ReactElement {
  return (
    <SelectPrimitive.Portal {...portalProps}>
      <SelectPrimitive.Positioner
        align={align}
        alignItemWithTrigger={alignItemWithTrigger}
        alignOffset={alignOffset}
        anchor={anchor}
        className="z-[500] select-none"
        data-slot="select-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <SelectPrimitive.Popup
          className="origin-[var(--transform-origin)] text-text-primary outline-none z-[500]"
          data-slot="select-popup"
          {...props}
        >
          <SelectPrimitive.ScrollUpArrow
            className="top-0 z-50 flex h-6 w-full cursor-default items-center justify-center before:pointer-events-none before:absolute before:inset-x-px before:top-px before:h-[200%] before:bg-linear-to-b before:from-50% before:from-surface"
            data-slot="select-scroll-up-arrow"
          >
            <ChevronUpIcon className="relative h-4 w-4" />
          </SelectPrimitive.ScrollUpArrow>
          <div className="relative h-full min-w-[var(--select-trigger-width)] rounded-lg border border-neutrals-borderLight bg-white p-1 shadow-modal max-h-[300px] overflow-y-auto">
            <SelectPrimitive.List
              className={cn(
                "max-h-[inherit] overflow-y-auto p-1 focus:outline-none",
                className,
              )}
              data-slot="select-list"
            >
              {children}
            </SelectPrimitive.List>
          </div>
          <SelectPrimitive.ScrollDownArrow
            className="bottom-0 z-50 flex h-6 w-full cursor-default items-center justify-center before:pointer-events-none before:absolute before:inset-x-px before:bottom-px before:h-[200%] before:bg-linear-to-t before:from-50% before:from-surface"
            data-slot="select-scroll-down-arrow"
          >
            <ChevronDownIcon className="relative h-4 w-4" />
          </SelectPrimitive.ScrollDownArrow>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props): React.ReactElement {
  return (
    <SelectPrimitive.Item
      className={cn(
        "grid min-h-8 cursor-default grid-cols-[1rem_1fr] items-center gap-2 rounded-md py-1.5 ps-2 pe-4 text-xs text-text-primary outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-surface-subtle data-[highlighted]:text-text-primary data-[disabled]:opacity-50 data-[selected]:bg-brand-light data-[selected]:text-brand-accent [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      data-slot="select-item"
      {...props}
    >
      <SelectPrimitive.ItemIndicator className="col-start-1 flex items-center justify-center">
        <svg
          className="h-3.5 w-3.5 text-brand-accent"
          aria-hidden="true"
          fill="none"
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5.252 12.7 10.2 18.63 18.748 5.37" />
        </svg>
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText className="col-start-2 min-w-0">
        {children}
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props): React.ReactElement {
  return (
    <SelectPrimitive.Separator
      className={cn("mx-2 my-1 h-px bg-neutrals-borderLight", className)}
      data-slot="select-separator"
      {...props}
    />
  );
}

export function SelectGroup(
  props: SelectPrimitive.Group.Props,
): React.ReactElement {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

export function SelectLabel({
  className,
  ...props
}: SelectPrimitive.Label.Props): React.ReactElement {
  return (
    <SelectPrimitive.Label
      className={cn(
        "not-in-data-[slot=field]:mb-2 inline-flex cursor-default items-center gap-2 font-medium text-xs text-text-primary",
        className,
      )}
      data-slot="select-label"
      {...props}
    />
  );
}

export function SelectGroupLabel(
  props: SelectPrimitive.GroupLabel.Props,
): React.ReactElement {
  return (
    <SelectPrimitive.GroupLabel
      className="px-2 py-1.5 font-bold text-text-tertiary text-[10px] uppercase tracking-wider"
      data-slot="select-group-label"
      {...props}
    />
  );
}

export { SelectPopup as SelectContent };

// Helper to determine if children are using the composed API
const isComposed = (children: React.ReactNode): boolean => {
  let composed = false;
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      const slot = child.props["data-slot"];
      if (
        slot === "select-trigger" ||
        slot === "select-button" ||
        slot === "select-popup" ||
        child.type === SelectTrigger ||
        child.type === SelectButton ||
        child.type === SelectPopup
      ) {
        composed = true;
      }
    }
  });
  return composed;
};

// Unified Select root wrapper with option mapper
export const Select = React.forwardRef<HTMLInputElement, SelectProps>((
  {
    value,
    defaultValue,
    onChange,
    onValueChange,
    disabled,
    name,
    required,
    placeholder,
    error,
    className,
    children,
  },
  ref
) => {
  const selectRef = React.useRef<HTMLInputElement | null>(null);
  const [internalValue, setInternalValue] = React.useState<string>(value || defaultValue || "");

  // Update internal value if controlled value prop changes
  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      selectRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      }

      if (node) {
        // Intercept programmatic setter for 'value' (used by React Hook Form reset)
        const descriptor = Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value"
        );
        if (descriptor && descriptor.set) {
          const originalSet = descriptor.set;
          Object.defineProperty(node, "value", {
            get() {
              return descriptor.get ? descriptor.get.call(node) : node.getAttribute("value") || "";
            },
            set(val) {
              originalSet.call(node, val);
              // Trigger a React state update to re-render the select with the new value
              setInternalValue(val);
            },
            configurable: true,
          });
        }
      }
    },
    [ref]
  );

  const handleValueChange = (val: string | null) => {
    const safeVal = val || "";
    setInternalValue(safeVal);
    if (onValueChange) {
      onValueChange(safeVal);
    }
    if (onChange) {
      onChange({ target: { name, value: safeVal } });
    }
  };

  // Build items record dynamically for Base UI lookup
  const itemsMap: Record<string, React.ReactNode> = React.useMemo(() => {
    const map: Record<string, React.ReactNode> = {};
    const processOption = (child: React.ReactElement) => {
      if (child.props && child.props.value !== undefined) {
        map[String(child.props.value)] = child.props.children;
      }
    };

    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        if (child.type === "option") {
          processOption(child);
        } else if (child.type === React.Fragment) {
          React.Children.forEach(child.props.children, (subChild) => {
            if (React.isValidElement(subChild) && subChild.type === "option") {
              processOption(subChild);
            }
          });
        }
      }
    });
    return map;
  }, [children]);

  if (isComposed(children)) {
    return (
      <SelectPrimitive.Root
        value={internalValue}
        onValueChange={handleValueChange}
        disabled={disabled}
        name={name}
        required={required}
        inputRef={handleRef}
      >
        {children}
      </SelectPrimitive.Root>
    );
  }

  // Convert <option> to <SelectItem> for the unified single-element wrapper
  const processedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === "option") {
        return (
          <SelectItem
            key={child.props.value}
            value={child.props.value}
            disabled={child.props.disabled}
          >
            {child.props.children}
          </SelectItem>
        );
      }
      if (child.type === React.Fragment) {
        return React.Children.map(child.props.children, (subChild) => {
          if (React.isValidElement(subChild) && subChild.type === "option") {
            const opt = subChild as React.ReactElement<any>;
            return (
              <SelectItem
                key={opt.props.value}
                value={opt.props.value}
                disabled={opt.props.disabled}
              >
                {opt.props.children}
              </SelectItem>
            );
          }
          return subChild;
        });
      }
    }
    return child;
  });

  return (
    <SelectPrimitive.Root
      value={internalValue}
      onValueChange={handleValueChange}
      disabled={disabled}
      name={name}
      required={required}
      inputRef={handleRef}
      items={itemsMap}
    >
      <SelectTrigger
        className={cn(
          error && "border-danger focus:border-danger focus:shadow-inputError",
          className
        )}
        aria-invalid={error ? "true" : undefined}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectPopup>
        {processedChildren}
      </SelectPopup>
    </SelectPrimitive.Root>
  );
});
Select.displayName = "Select";
