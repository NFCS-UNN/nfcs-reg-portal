"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { getAllNotificationsForAdmin } from "@/lib/actions/notification.actions";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  CreditCard,
  Check,
  UserCog,
  ShieldAlert,
  Info,
  RefreshCw,
  Users,
  Eye,
  EyeOff,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";

interface AdminNotification {
  id: string;
  profile_id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
  profiles?: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    faculty: string | null;
    department: string | null;
  } | null;
}

const TYPE_META: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  payment_confirmed: { label: "Payment Confirmed", icon: Check, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
  payment_recorded_by_exco: { label: "Payment Recorded", icon: CreditCard, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  payment_pending: { label: "Payment Pending", icon: Clock, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
  payment_failed: { label: "Payment Failed", icon: ShieldAlert, color: "text-danger", bg: "bg-red-100 dark:bg-red-900/30" },
  account_approved: { label: "Account Approved", icon: Check, color: "text-brand", bg: "bg-brand/10" },
  account_rejected: { label: "Account Rejected", icon: ShieldAlert, color: "text-danger", bg: "bg-red-100 dark:bg-red-900/30" },
  account_suspended: { label: "Account Suspended", icon: ShieldAlert, color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30" },
  role_changed: { label: "Role Changed", icon: UserCog, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
  general: { label: "General", icon: Info, color: "text-text-tertiary", bg: "bg-surface-page" },
};

const ROLE_COLORS: Record<string, string> = {
  student: "bg-blue-100 text-blue-700",
  alumnus: "bg-purple-100 text-purple-700",
  exco: "bg-amber-100 text-amber-700",
  super_admin: "bg-red-100 text-red-700",
};

export default function AdminNotificationsPage() {
  const { profile } = useUser();
  const [notifications, setNotifications] = React.useState<AdminNotification[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<string>("all");
  const [liveCount, setLiveCount] = React.useState(0);
  const supabaseRef = React.useRef(createClient());
  const supabase = supabaseRef.current;

  // Initial fetch
  const loadNotifications = React.useCallback(async () => {
    setIsLoading(true);
    const { notifications: data } = await getAllNotificationsForAdmin();
    setNotifications(data as AdminNotification[]);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Realtime subscription — super admin sees all inserts
  React.useEffect(() => {
    if (!profile?.id || profile.role !== "super_admin") return;

    const channel = supabase
      .channel("admin-notifications-console")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const newNotif = payload.new as AdminNotification;
          setNotifications((prev) => [newNotif, ...prev]);
          setLiveCount((c) => c + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, profile?.role, supabase]);

  const filtered = filter === "all" ? notifications : notifications.filter((n) => n.type === filter);
  const types = Array.from(new Set(notifications.map((n) => n.type)));

  if (profile && profile.role !== "super_admin") {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <ShieldAlert className="h-10 w-10 text-danger" />
        <h2 className="text-base font-bold text-text-primary">Access Denied</h2>
        <p className="text-xs text-text-secondary">Only Super Admins can view the notification console.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Bell className="h-5 w-5 text-brand" />
            Notification Console
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            System-wide notification log. Realtime updates are active.
            {liveCount > 0 && (
              <span className="ml-1.5 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">
                +{liveCount} live
              </span>
            )}
          </p>
        </div>
        <button
          onClick={loadNotifications}
          className="flex items-center gap-1.5 rounded-lg border border-neutrals-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-page transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Total", value: notifications.length, icon: Bell, color: "text-brand" },
          { label: "Unread", value: notifications.filter((n) => !n.is_read).length, icon: EyeOff, color: "text-danger" },
          { label: "Read", value: notifications.filter((n) => n.is_read).length, icon: Eye, color: "text-green-600" },
          { label: "Recipients", value: new Set(notifications.map((n) => n.profile_id)).size, icon: Users, color: "text-amber-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-neutrals-borderLight bg-surface p-4 shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-text-secondary">{label}</p>
              <Icon className={cn("h-4 w-4", color)} />
            </div>
            <p className="mt-1 text-2xl font-bold text-text-primary">{isLoading ? "—" : value}</p>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-full px-3 py-1 text-[11px] font-semibold transition-colors",
            filter === "all" ? "bg-brand text-white" : "bg-surface-page text-text-secondary hover:bg-neutrals-border"
          )}
        >
          All ({notifications.length})
        </button>
        {types.map((type) => {
          const meta = TYPE_META[type] ?? TYPE_META.general;
          const count = notifications.filter((n) => n.type === type).length;
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-semibold transition-colors",
                filter === type ? "bg-brand text-white" : "bg-surface-page text-text-secondary hover:bg-neutrals-border"
              )}
            >
              {meta.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Notification table */}
      <div className="rounded-xl border border-neutrals-borderLight bg-surface shadow-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-text-tertiary text-sm">
            Loading notifications…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Bell className="h-10 w-10 text-text-tertiary opacity-20" />
            <p className="text-sm font-semibold text-text-secondary">No notifications found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-neutrals-borderLight bg-surface-page text-[11px] font-semibold text-text-tertiary uppercase tracking-wide">
                  <th className="px-4 py-3">Recipient</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Title & Body</th>
                  <th className="px-4 py-3">Details / Purpose</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutrals-borderLight">
                {filtered.map((notif) => {
                  const meta = TYPE_META[notif.type] ?? TYPE_META.general;
                  const Icon = meta.icon;
                  const recipient = notif.profiles;

                  return (
                    <tr key={notif.id} className={cn("transition-colors hover:bg-surface-page", !notif.is_read && "bg-brand/[0.02]")}>
                      {/* Recipient */}
                      <td className="px-4 py-3">
                        {recipient ? (
                          <div>
                            <p className="font-semibold text-text-primary">{recipient.full_name}</p>
                            <p className="text-[10px] text-text-tertiary">{recipient.email}</p>
                            <span className={cn("mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase", ROLE_COLORS[recipient.role] ?? "bg-gray-100 text-gray-600")}>
                              {recipient.role}
                            </span>
                          </div>
                        ) : (
                          <span className="text-text-tertiary italic">{notif.profile_id.slice(0, 8)}…</span>
                        )}
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold", meta.bg, meta.color)}>
                          <Icon className="h-3 w-3" />
                          {meta.label}
                        </span>
                      </td>

                      {/* Title + Body */}
                      <td className="px-4 py-3 max-w-[220px]">
                        <p className="font-semibold text-text-primary">{notif.title}</p>
                        <p className="mt-0.5 text-[11px] text-text-secondary line-clamp-2">{notif.body}</p>
                      </td>

                      {/* Metadata / Purpose */}
                      <td className="px-4 py-3 max-w-[200px]">
                        {notif.metadata ? (
                          <ul className="space-y-0.5">
                            {Object.entries(notif.metadata).map(([k, v]) => (
                              <li key={k} className="text-[10px] text-text-tertiary">
                                <span className="font-semibold text-text-secondary">{k.replace(/_/g, " ")}:</span>{" "}
                                <span className="font-mono">{String(v)}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-text-tertiary italic">—</span>
                        )}
                      </td>

                      {/* Read status */}
                      <td className="px-4 py-3">
                        {notif.is_read ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                            <Eye className="h-3 w-3" /> Read
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">
                            <EyeOff className="h-3 w-3" /> Unread
                          </span>
                        )}
                      </td>

                      {/* Time */}
                      <td className="px-4 py-3 whitespace-nowrap text-[11px] text-text-tertiary">
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
