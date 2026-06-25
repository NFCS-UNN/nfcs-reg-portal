import * as React from "react";
import { cn } from "@/lib/utils/cn";

const TableWrapper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "w-full overflow-hidden border border-neutrals-borderLight bg-surface rounded-[12px] shadow-card",
      className
    )}
    {...props}
  />
));
TableWrapper.displayName = "TableWrapper";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="w-full overflow-x-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm border-collapse", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("bg-surface-subtle border-b border-neutrals-border", className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & { selected?: boolean }
>(({ className, selected, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-neutrals-borderLight bg-surface transition-colors duration-100 hover:bg-surface-subtle",
      selected && "bg-brand-light border-l-[3px] border-l-brand-accent pl-[13px]",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-4 py-2 text-left align-middle text-[11px] font-semibold uppercase tracking-[0.05em] text-text-secondary select-none",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & {
    variant?: "primary" | "secondary" | "mono" | "muted";
  }
>(({ className, variant = "primary", ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-4 py-3 align-middle",
      variant === "primary" && "text-sm font-medium text-text-primary",
      variant === "secondary" && "text-[13px] text-text-secondary",
      variant === "mono" && "font-mono text-[13px] text-gray-700",
      variant === "muted" && "text-xs text-text-tertiary",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

export {
  TableWrapper,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
};
