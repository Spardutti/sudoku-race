"use server";

import { createServerActionClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import type { Result } from "@/lib/types/result";
import * as Sentry from "@sentry/nextjs";

type OAuthProvider = "google" | "github" | "apple";

export async function signInWithGoogle(returnUrl?: string): Promise<Result<{ url: string }, string>> {
  return signInWithOAuth("google", returnUrl);
}

export async function signInWithGithub(returnUrl?: string): Promise<Result<{ url: string }, string>> {
  return signInWithOAuth("github", returnUrl);
}

export async function signInWithApple(returnUrl?: string): Promise<Result<{ url: string }, string>> {
  return signInWithOAuth("apple", returnUrl);
}

async function signInWithOAuth(
  provider: OAuthProvider,
  returnUrl?: string
): Promise<Result<{ url: string }, string>> {
  try {
    const supabase = await createServerActionClient();

    const baseUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`;
    const redirectTo = returnUrl
      ? `${baseUrl}?returnUrl=${encodeURIComponent(returnUrl)}`
      : baseUrl;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
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
    const supabase = await createServerActionClient();

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

async function retryOperation<T>(
  operation: () => Promise<T>,
  context: { userId: string; operation: string; metadata?: Record<string, unknown> },
  maxRetries = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        logger.warn(`${context.operation} attempt ${attempt} failed, retrying...`, {
          ...context.metadata,
          userId: context.userId,
          retriesLeft: maxRetries - attempt,
        });

        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 100)
        );
      }
    }
  }

  throw lastError;
}

export async function deleteAccount(userId: string): Promise<Result<void, string>> {
  try {
    const supabase = await createServerActionClient();

    await retryOperation(
      async () => {
        await supabase.from("completions").delete().eq("user_id", userId);
      },
      { userId, operation: "delete_completions" }
    );

    await retryOperation(
      async () => {
        await supabase.from("leaderboards").delete().eq("user_id", userId);
      },
      { userId, operation: "delete_leaderboards" }
    );

    await retryOperation(
      async () => {
        await supabase.from("streaks").delete().eq("user_id", userId);
      },
      { userId, operation: "delete_streaks" }
    );

    await retryOperation(
      async () => {
        const { error: userDeleteError } = await supabase
          .from("users")
          .delete()
          .eq("id", userId);

        if (userDeleteError) {
          throw userDeleteError;
        }
      },
      { userId, operation: "delete_user" }
    );

    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      logger.error("Sign-out after deletion failed", signOutError, { userId });
    }

    Sentry.captureMessage("User account deleted", {
      level: "info",
      extra: { userId },
    });

    logger.info("User account deleted", { userId });

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    logger.error("Account deletion failed", error as Error, { userId });
    Sentry.captureException(error, {
      level: "error",
      extra: { userId },
    });

    return {
      success: false,
      error: "Deletion failed. Contact support.",
    };
  }
}
