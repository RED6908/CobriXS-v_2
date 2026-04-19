import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Session } from "@supabase/supabase-js";
import type { UserProfile } from "../types/database";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error loading profile:", error);
      setProfile(null);
      return;
    }

    setProfile(data);
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);

      const { data } = await supabase.auth.getSession();
      const currentSession = data.session;

      setSession(currentSession);

      if (currentSession?.user) {
        await loadProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    };

    void initializeAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);

        if (newSession?.user) {
          await loadProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const isAdmin = profile?.role === "admin";

  return {
    session,
    profile,
    loading,
    isAdmin,
  };
}