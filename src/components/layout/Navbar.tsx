"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";
import {
  Bell,
  Search,
  ChevronDown,
  Menu,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Home,
  Moon,
  Sun,
  Laptop,
  X,
  Check,
  CheckCheck,
  Info,
  CreditCard,
  UserCog,
  ShieldAlert,
} from "lucide-react";
import { logout } from "@/lib/actions/auth.actions";
import Link from "next/link";
import { useTheme } from "@/lib/utils/theme";
import {
  SelectPrimitive,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectItem,
} from "@/components/ui/select";
import { useNotifications } from "@/components/providers/NotificationProvider";

interface NavbarProps {
  onMenuToggle?: () => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useUser();
  const { theme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    router.refresh();
  };

  // Generate breadcrumbs from pathname
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " ");
    const isLast = index === segments.length - 1;

    return { label, href, isLast };
  });

  return (
    <header className="sticky top-0 z-30 flex h-[60px] w-full items-center justify-between border-b border-neutrals-borderLight bg-surface px-4 md:px-6 select-none shadow-none">
      {/* Left side: Mobile Toggle & Page Title / Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutrals-border text-text-secondary md:hidden hover:bg-surface-page transition-colors"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </button>

        {/* Breadcrumb / Title */}
        <div className="hidden items-center gap-1.5 text-[13px] text-text-tertiary md:flex">
          <Link href="/dashboard" className="hover:text-text-primary">
            <Home className="h-3.5 w-3.5" />
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.href}>
              <span className="text-text-tertiary">/</span>
              {crumb.isLast ? (
                <span className="font-semibold text-text-primary truncate max-w-[150px]">
                  {crumb.label}
                </span>
              ) : (
                <Link href={crumb.href} className="hover:text-text-primary truncate max-w-[150px]">
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Mobile Page Title */}
        <span className="text-sm font-bold text-text-primary md:hidden">
          {breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : "Portal"}
        </span>
      </div>

      {/* Right side: Search, Notifications, Profile Dropdown */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative hidden max-w-xs md:block">
          <Search className="absolute left-3 top-[10px] h-4 w-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-[200px] rounded-lg bg-surface-page border border-transparent pl-9 pr-4 text-[13px] text-text-primary placeholder:text-text-tertiary transition-all focus:border-brand-accent  focus:outline-none focus:shadow-inputFocus"
          />
        </div>

        {/* Theme Select Dropdown */}
        <SelectPrimitive.Root
          value={theme}
          onValueChange={(val) => setTheme(val as any)}
        >
          <SelectTrigger
            className="hidden md:flex h-9 w-4 rounded-lg border-none bg-transparent px-2 text-xs hover:bg-surface-page focus:ring-0 focus:shadow-none gap-1 text-text-secondary capitalize"
            size="sm"
          >
            <span className="flex items-center gap-1.5">
              {theme === "light" && <Sun className="h-4 w-4 text-amber-honey" />}
              {theme === "dark" && <Moon className="h-4 w-4" />}
              {theme === "system" && <Laptop className="h-4 w-4" />}
              <SelectValue className="hidden md:block" />
            </span>
          </SelectTrigger>
          <SelectPopup align="end" className="w-[125px]">
            <SelectItem value="light">
              <span className="flex items-center gap-1.5">
                <Sun className="h-3.5 w-3.5 text-amber-honey" />
                <span>Light</span>
              </span>
            </SelectItem>
            <SelectItem value="dark">
              <span className="flex items-center gap-1.5">
                <Moon className="h-3.5 w-3.5" />
                <span>Dark</span>
              </span>
            </SelectItem>
            <SelectItem value="system">
              <span className="flex items-center gap-1.5">
                <Laptop className="h-3.5 w-3.5" />
                <span>System</span>
              </span>
            </SelectItem>
          </SelectPopup>
        </SelectPrimitive.Root>

        {/* Notifications Bell + Dropdown */}
        <div className="relative">
          <button
            id="notif-bell-btn"
            onClick={() => { setNotifOpen((o) => !o); if (dropdownOpen) setDropdownOpen(false); }}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-page transition-colors border-none bg-transparent"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white border-2 border-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </button>

          {notifOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />

              {/* Dropdown panel */}
              <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-80 origin-top-right rounded-xl border border-neutrals-border bg-surface shadow-dropdown animate-in fade-in-50 slide-in-from-top-2 duration-150 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutrals-borderLight px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-brand" />
                    <span className="text-[13px] font-bold text-text-primary">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="flex items-center gap-1 text-[11px] text-brand hover:underline"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification list */}
                <div className="max-h-[380px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                      <Bell className="h-8 w-8 text-text-tertiary opacity-30" />
                      <p className="text-[12px] font-semibold text-text-secondary">You're all caught up!</p>
                      <p className="text-[11px] text-text-tertiary">No notifications yet.</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-neutrals-borderLight">
                      {notifications.map((notif) => {
                        const Icon =
                          notif.type === "payment_confirmed" || notif.type === "payment_recorded_by_exco" || notif.type === "payment_pending" || notif.type === "payment_failed" ? CreditCard
                          : notif.type === "account_approved" ? Check
                          : notif.type === "account_suspended" || notif.type === "account_rejected" ? ShieldAlert
                          : notif.type === "role_changed" ? UserCog
                          : Info;

                        const iconColor =
                          notif.type === "payment_confirmed" || notif.type === "payment_recorded_by_exco" ? "text-green-500"
                          : notif.type === "payment_pending" ? "text-amber-500"
                          : notif.type === "payment_failed" ? "text-danger"
                          : notif.type === "account_approved" ? "text-brand"
                          : notif.type === "account_suspended" || notif.type === "account_rejected" ? "text-danger"
                          : notif.type === "role_changed" ? "text-amber-500"
                          : "text-text-tertiary";

                        const bgColor =
                          notif.type === "payment_confirmed" || notif.type === "payment_recorded_by_exco" ? "bg-green-50 dark:bg-green-900/20"
                          : notif.type === "payment_pending" ? "bg-amber-50 dark:bg-amber-900/20"
                          : notif.type === "payment_failed" ? "bg-red-50 dark:bg-red-900/20"
                          : notif.type === "account_approved" ? "bg-brand/5"
                          : notif.type === "account_suspended" || notif.type === "account_rejected" ? "bg-red-50 dark:bg-red-900/20"
                          : notif.type === "role_changed" ? "bg-amber-50 dark:bg-amber-900/20"
                          : "bg-transparent";

                        const timeAgo = (() => {
                          const diff = Date.now() - new Date(notif.created_at).getTime();
                          const mins = Math.floor(diff / 60000);
                          if (mins < 1) return "just now";
                          if (mins < 60) return `${mins}m ago`;
                          const hrs = Math.floor(mins / 60);
                          if (hrs < 24) return `${hrs}h ago`;
                          return `${Math.floor(hrs / 24)}d ago`;
                        })();

                        return (
                          <li
                            key={notif.id}
                            className={cn(
                              "group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-page",
                              !notif.is_read && bgColor
                            )}
                          >
                            {/* Icon */}
                            <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full", !notif.is_read ? bgColor : "bg-surface-page")}>
                              <Icon className={cn("h-3.5 w-3.5", iconColor)} />
                            </div>

                            {/* Content */}
                            <button
                              className="flex-1 text-left"
                              onClick={() => { if (!notif.is_read) markAsRead(notif.id); }}
                            >
                              <p className={cn("text-[12px] leading-snug", notif.is_read ? "text-text-secondary font-normal" : "text-text-primary font-semibold")}>
                                {notif.title}
                              </p>
                              <p className="mt-0.5 text-[11px] text-text-tertiary leading-snug line-clamp-2">{notif.body}</p>
                              <p className="mt-1 text-[10px] text-text-tertiary">{timeAgo}</p>
                            </button>

                            {/* Unread dot + delete */}
                            <div className="flex shrink-0 flex-col items-end gap-1.5">
                              {!notif.is_read && (
                                <span className="h-2 w-2 rounded-full bg-brand" />
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity rounded p-0.5 hover:bg-neutrals-border"
                                aria-label="Dismiss"
                              >
                                <X className="h-3 w-3 text-text-tertiary" />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* Footer — link to admin console for super_admin */}
                {profile?.role === "super_admin" && (
                  <div className="border-t border-neutrals-borderLight px-4 py-2">
                    <Link
                      href="/admin/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="text-[11px] text-brand hover:underline"
                    >
                      View notification console →
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Profile Dropdown Trigger */}
        {profile && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg p-1 hover:bg-surface-page transition-colors focus:outline-none"
            >
              <Avatar
                src={profile.passport_photo_url}
                name={profile.full_name}
                size="sm"
              />
              <span className="hidden text-[13px] font-semibold text-text-secondary md:block">
                {profile.full_name.split(" ")[0]}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-48 origin-top-right rounded-[10px] border border-neutrals-border bg-surface p-1.5 shadow-dropdown z-20 animate-in fade-in-50 slide-in-from-top-1 duration-100">
                  <div className="px-2.5 py-1.5 text-xs border-b border-neutrals-borderLight">
                    <p className="font-semibold text-text-primary text-base truncate">
                      {profile.full_name}
                    </p>
                    <p className="text-[10px] text-text-tertiary truncate">
                      {profile.email}
                    </p>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs md:text-[13px] text-text-secondary hover:bg-surface-page hover:text-text-primary transition-colors"
                  >
                    <UserIcon className="h-4 w-4 text-text-tertiary" />
                    <span>My Profile</span>
                  </Link>

                  {["super_admin"].includes(profile.role) && (
                    <Link
                      href="/admin/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] text-text-secondary hover:bg-surface-page hover:text-text-primary transition-colors"
                    >
                      <ShieldCheck className="h-4 w-4 text-text-tertiary" />
                      <span>Admin Settings</span>
                    </Link>
                  )}

                  <SelectPrimitive.Root
                    value={theme}
                    onValueChange={(val) => setTheme(val as any)}
                  >
                    <SelectTrigger
                      className="md:hidden h-9 w-full rounded-lg border-none bg-transparent px-2 text-xs hover:bg-surface-page focus:ring-0 focus:shadow-none gap-1 text-text-secondary capitalize"
                      size="sm"
                    >
                      <span className="flex items-center gap-1.5">
                        {theme === "light" && <Sun className="h-4 w-4 text-amber-honey" />}
                        {theme === "dark" && <Moon className="h-4 w-4" />}
                        {theme === "system" && <Laptop className="h-4 w-4" />}
                        <SelectValue />
                      </span>
                    </SelectTrigger>
                    <SelectPopup align="end" className="w-[125px]">
                      <SelectItem value="light">
                        <span className="flex items-center gap-1.5">
                          <Sun className="h-3.5 w-3.5 text-amber-honey" />
                          <span>Light</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="dark">
                        <span className="flex items-center gap-1.5">
                          <Moon className="h-3.5 w-3.5" />
                          <span>Dark</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="system">
                        <span className="flex items-center gap-1.5">
                          <Laptop className="h-3.5 w-3.5" />
                          <span>System</span>
                        </span>
                      </SelectItem>
                    </SelectPopup>
                  </SelectPrimitive.Root>

                  <div className="my-1 border-t border-neutrals-borderLight" />

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] text-danger hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 text-danger opacity-70" />
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
