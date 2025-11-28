"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import * as Sentry from "@sentry/nextjs";
import { logger } from "@/lib/utils/logger";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface UseAuthStateProps {
  initialUser?: User | null;
}

export function useAuthState({ initialUser }: UseAuthStateProps = {}): AuthState {
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const supabase = createBrowserClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setIsLoading(false);
      } else if (event === "SIGNED_IN") {
        if (session?.user) {
          setUser(session.user);
        } else {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          setUser(currentSession?.user ?? null);
        }
        setIsLoading(false);
      } else if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setUser(currentSession?.user ?? null);
        setIsLoading(false);

        if (event === "TOKEN_REFRESHED") {
          logger.info("Auth token refreshed");
        } else {
          logger.info("User data updated", { userId: currentSession?.user?.id });
        }
      } else {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
      }
    });

    // Cross-tab logout detection for cookie-based auth
    // Checks session when tab becomes visible (after switching tabs)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setUser(currentSession?.user ?? null);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    supabase.auth.getSession().catch((error) => {
      logger.error("Failed to get auth session", error);
      Sentry.captureException(error, {
        level: "error",
        tags: { context: "useAuthState" },
      });
      setUser(null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [initialUser]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
