"use server";

import { adminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type NotificationType =
  | "payment_confirmed"
  | "payment_recorded_by_exco"
  | "payment_pending"
  | "payment_failed"
  | "account_approved"
  | "account_suspended"
  | "account_rejected"
  | "role_changed"
  | "new_announcement"
  | "new_event"
  | "general";

export interface CreateNotificationParams {
  profile_id: string;
  title: string;
  body: string;
  type: NotificationType;
  metadata?: Record<string, any>;
}

/**
 * Internal helper — called from other server actions (not exposed to the client directly).
 * Uses adminClient to bypass RLS for insertion.
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const { error } = await adminClient.from("notifications").insert({
      profile_id: params.profile_id,
      title: params.title,
      body: params.body,
      type: params.type,
      is_read: false,
      metadata: (params.metadata as any) ?? null,
    });

    if (error) {
      console.error("[createNotification] insert error:", error.message);
    }
  } catch (err: any) {
    console.error("[createNotification] unexpected error:", err?.message);
  }
}

/** Fetch the current user's notifications (latest 50). */
export async function getMyNotifications() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { notifications: [], error: "Authentication required" };

  const { data, error } = await adminClient
    .from("notifications")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return { notifications: [], error: error.message };
  return { notifications: data ?? [], error: null };
}

/** Fetch ALL notifications across all users — only usable by super_admin. */
export async function getAllNotificationsForAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { notifications: [], error: "Authentication required" };

  // Verify the caller is a super_admin
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "super_admin") {
    return { notifications: [], error: "Unauthorized" };
  }

  const { data, error } = await adminClient
    .from("notifications")
    .select(
      `
      *,
      profiles:profile_id (
        id,
        full_name,
        email,
        role,
        faculty,
        department
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return { notifications: [], error: error.message };
  return { notifications: data ?? [], error: null };
}

/** Mark a single notification as read. */
export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required" };

  const { error } = await adminClient
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("profile_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

/** Mark ALL of the current user's notifications as read. */
export async function markAllNotificationsAsRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required" };

  const { error } = await adminClient
    .from("notifications")
    .update({ is_read: true })
    .eq("profile_id", user.id)
    .eq("is_read", false);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { success: true };
}

/** Delete a single notification owned by the current user. */
export async function deleteNotification(notificationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required" };

  const { error } = await adminClient
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("profile_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}
