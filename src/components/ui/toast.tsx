"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cn } from "@/lib/utils/cn";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  title?: string;
  description: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toast: (message: Omit<ToastMessage, "id">) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const toast = React.useCallback(
    ({ title, description, variant = "info", duration = 4000 }: Omit<ToastMessage, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, description, variant, duration }]);
    },
    []
  );

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map(({ id, title, description, variant = "info", duration }) => {
          let Icon = Info;
          let iconColor = "text-[#93C5FD]";
          let bgClass = "bg-[#111827]"; // Default info

          if (variant === "success") {
            Icon = CheckCircle;
            iconColor = "text-[#6EE7B7]";
            bgClass = "bg-[#064E3B]";
          } else if (variant === "error") {
            Icon = AlertCircle;
            iconColor = "text-[#FCA5A5]";
            bgClass = "bg-[#7F1D1D]";
          }

          return (
            <ToastPrimitive.Root
              key={id}
              duration={duration}
              onOpenChange={(open) => {
                if (!open) removeToast(id);
              }}
              className={cn(
                "group pointer-events-auto relative flex w-full max-w-[360px] items-center justify-between gap-[10px] overflow-hidden rounded-[10px] p-[12px_16px] text-white shadow-[0_4px_16px_rgba(0,0,0,0.20)] transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full data-[state=closed]:slide-out-to-right-full",
                bgClass
              )}
            >
              <div className="flex items-center gap-[10px] text-[13px] font-medium flex-1">
                <Icon className={cn("h-4 w-4 shrink-0", iconColor)} />
                <div className="flex flex-col gap-0.5">
                  {title && <span className="font-semibold">{title}</span>}
                  <span className="text-xs leading-relaxed opacity-95">{description}</span>
                </div>
              </div>
              <ToastPrimitive.Close className="rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
                <X className="h-3.5 w-3.5" />
              </ToastPrimitive.Close>
            </ToastPrimitive.Root>
          );
        })}
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[500] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] gap-2" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
