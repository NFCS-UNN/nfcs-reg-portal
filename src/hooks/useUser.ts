"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function useUser() {
  const [user, setUser] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Stable Supabase client — created once, never recreated on re-render.
  // Prevents duplicate channel subscriptions in React StrictMode.
  const supabaseRef = React.useRef(createClient());
  const supabase = supabaseRef.current;

  const fetchUserData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      if (authUser) {
        setUser(authUser);

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (profileError) {
          setError(profileError.message);
        } else {
          setProfile(profileData);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Initial fetch + auth state listener
  React.useEffect(() => {
    fetchUserData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN") {
        fetchUserData();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserData]);

  // Realtime subscription — updates profile state whenever the DB row changes.
  // Guards against StrictMode double-mount by removing the channel before re-subscribing.
  React.useEffect(() => {
    if (!user?.id) return;

    const channelName = `realtime-profile-${user.id}`;

    // Tear down any stale channel with the same name (StrictMode safe)
    const stale = supabase.getChannels().find((ch) => ch.topic === `realtime:${channelName}`);
    if (stale) supabase.removeChannel(stale);

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            setProfile(payload.new as Profile);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user?.id]);

  return {
    user,
    profile,
    isLoading,
    error,
    refetch: fetchUserData,
  };
}
