"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/components/ui/toast";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/lib/actions/notification.actions";

export interface AppNotification {
  id: string;
  profile_id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
}

const NotificationContext = React.createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  isLoading: true,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  removeNotification: async () => {},
});

export function useNotifications() {
  return React.useContext(NotificationContext);
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useUser();
  const { toast } = useToast();
  const [notifications, setNotifications] = React.useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const supabaseRef = React.useRef(createClient());
  const supabase = supabaseRef.current;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // ── Initial fetch ─────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!profile?.id) return;

    let mounted = true;
    (async () => {
      setIsLoading(true);
      const { notifications: fetched } = await getMyNotifications();
      if (mounted) {
        setNotifications(fetched as AppNotification[]);
        setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [profile?.id]);

  // ── Realtime: user's own notifications ───────────────────────────────────
  React.useEffect(() => {
    if (!profile?.id) return;

    const channelName = `notifications-${profile.id}`;
    const stale = supabase.getChannels().find((ch) => ch.topic === `realtime:${channelName}`);
    if (stale) supabase.removeChannel(stale);

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `profile_id=eq.${profile.id}`,
        },
        (payload) => {
          const newNotif = payload.new as AppNotification;
          setNotifications((prev) => [newNotif, ...prev]);
          // Show toast for incoming notification
          toast({
            title: newNotif.title,
            description: newNotif.body,
            variant:
              newNotif.type === "account_approved" || newNotif.type === "payment_confirmed"
                ? "success"
                : newNotif.type === "account_suspended" || newNotif.type === "account_rejected"
                ? "error"
                : "info",
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `profile_id=eq.${profile.id}`,
        },
        (payload) => {
          const updated = payload.new as AppNotification;
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
          filter: `profile_id=eq.${profile.id}`,
        },
        (payload) => {
          const deleted = payload.old as AppNotification;
          setNotifications((prev) => prev.filter((n) => n.id !== deleted.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, supabase, toast]);

  // ── Realtime: global announcements ───────────────────────────────────────
  React.useEffect(() => {
    if (!profile?.id) return;

    const channelName = "announcements-broadcast";
    const stale = supabase.getChannels().find((ch) => ch.topic === `realtime:${channelName}`);
    if (stale) supabase.removeChannel(stale);

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "announcements" },
        (payload) => {
          const ann = payload.new as { title: string; body: string };
          toast({
            title: `📢 New Announcement: ${ann.title}`,
            description: ann.body?.slice(0, 80) + (ann.body?.length > 80 ? "…" : ""),
            variant: "info",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, supabase, toast]);

  // ── Realtime: global events ───────────────────────────────────────────────
  React.useEffect(() => {
    if (!profile?.id) return;

    const channelName = "events-broadcast";
    const stale = supabase.getChannels().find((ch) => ch.topic === `realtime:${channelName}`);
    if (stale) supabase.removeChannel(stale);

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "events" },
        (payload) => {
          const event = payload.new as { title: string; location: string | null };
          toast({
            title: `📅 New Event: ${event.title}`,
            description: event.location ? `Location: ${event.location}` : "Check the Events page for details.",
            variant: "info",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, supabase, toast]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const markAsRead = React.useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    await markNotificationAsRead(id);
  }, []);

  const markAllAsRead = React.useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await markAllNotificationsAsRead();
  }, []);

  const removeNotification = React.useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await deleteNotification(id);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, isLoading, markAsRead, markAllAsRead, removeNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
