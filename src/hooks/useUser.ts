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

  const supabase = createClient();

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

  React.useEffect(() => {
    fetchUserData();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
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

  return {
    user,
    profile,
    isLoading,
    error,
    refetch: fetchUserData,
  };
}
