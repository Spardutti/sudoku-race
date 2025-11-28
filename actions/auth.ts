"use server";

import { createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import type { Result } from "@/lib/types/result";
import * as Sentry from "@sentry/nextjs";

type OAuthProvider = "google" | "github" | "apple";

export async function signInWithGoogle(): Promise<Result<{ url: string }, string>> {
  return signInWithOAuth("google");
}

export async function signInWithGithub(): Promise<Result<{ url: string }, string>> {
  return signInWithOAuth("github");
}

export async function signInWithApple(): Promise<Result<{ url: string }, string>> {
  return signInWithOAuth("apple");
}

async function signInWithOAuth(
  provider: OAuthProvider
): Promise<Result<{ url: string }, string>> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
      },
    });

    if (error) {
      logger.error(`OAuth sign-in failed for ${provider}`, error, { provider });
      Sentry.captureException(error, {
        level: "error",
        extra: { provider },
      });

      return {
        success: false,
        error: "Sign-in failed. Please try again.",
      };
    }

    if (!data.url) {
      const errorMsg = `OAuth provider ${provider} did not return redirect URL`;
      logger.error(errorMsg, new Error(errorMsg), { provider });
      Sentry.captureMessage(`OAuth URL missing for ${provider}`, {
        level: "error",
        extra: { provider },
      });

      return {
        success: false,
        error: "Sign-in failed. Please try again.",
      };
    }

    logger.info(`OAuth sign-in initiated for ${provider}`, {
      provider,
      redirectUrl: data.url,
    });

    return {
      success: true,
      data: { url: data.url },
    };
  } catch (error) {
    logger.error(`Unexpected error during ${provider} OAuth`, error as Error, { provider });
    Sentry.captureException(error, {
      level: "error",
      extra: { provider },
    });

    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function signOut(): Promise<Result<void, string>> {
  try {
    const supabase = await createServerClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error("Sign-out failed", error);
      Sentry.captureException(error, {
        level: "error",
      });

      return {
        success: false,
        error: "Sign-out failed. Please try again.",
      };
    }

    logger.info("User signed out");

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    logger.error("Unexpected error during sign-out", error as Error);
    Sentry.captureException(error, {
      level: "error",
    });

    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
