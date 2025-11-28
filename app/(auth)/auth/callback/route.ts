import { createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    logger.warn("OAuth callback missing code parameter");
    Sentry.captureMessage("OAuth callback missing code", {
      level: "warning",
      extra: { url: request.url },
    });

    return NextResponse.redirect(
      `${requestUrl.origin}/?error=invalid_link`
    );
  }

  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      logger.error("OAuth code exchange failed", error, { code: code.substring(0, 10) });
      Sentry.captureException(error, {
        level: "error",
        extra: { code: code.substring(0, 10) },
      });

      return NextResponse.redirect(
        `${requestUrl.origin}/?error=auth_failed`
      );
    }

    if (!data.user) {
      const errorMsg = "OAuth callback did not return user";
      logger.error(errorMsg, new Error(errorMsg));
      Sentry.captureMessage("OAuth callback missing user", {
        level: "error",
      });

      return NextResponse.redirect(
        `${requestUrl.origin}/?error=auth_failed`
      );
    }

    const userId = data.user.id;
    const email = data.user.email;
    const username = data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "Anonymous";
    const provider = data.user.app_metadata?.provider || "unknown";

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (!existingUser) {
      const { error: insertError } = await supabase
        .from("users")
        .insert({
          id: userId,
          email,
          username,
          oauth_provider: provider,
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        logger.error("Failed to create user record", insertError, { userId, email });
        Sentry.captureException(insertError, {
          level: "error",
          extra: { userId, email, provider },
        });
      } else {
        logger.info("New user created", { userId, email, provider });
      }
    } else {
      const { error: updateError } = await supabase
        .from("users")
        .update({ last_login: new Date().toISOString() })
        .eq("id", userId);

      if (updateError) {
        logger.error("Failed to update last_login", updateError, { userId });
      } else {
        logger.info("Returning user authenticated", { userId, email });
      }
    }

    return NextResponse.redirect(`${requestUrl.origin}/puzzle`);
  } catch (error) {
    logger.error("Unexpected error in OAuth callback", error as Error);
    Sentry.captureException(error, {
      level: "error",
    });

    return NextResponse.redirect(
      `${requestUrl.origin}/?error=server_error`
    );
  }
}
