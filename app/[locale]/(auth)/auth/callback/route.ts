import { createServerActionClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import { validateReturnUrl } from "@/lib/auth/return-url-validator";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const returnUrl = validateReturnUrl(requestUrl.searchParams.get("returnUrl"));

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
    const supabase = await createServerActionClient();

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

    const migrationPage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Completing sign-in...</title>
  <style>
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #fafafa;
    }
    .loader {
      text-align: center;
    }
    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #000;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="loader">
    <div class="spinner"></div>
    <p>Completing sign-in...</p>
  </div>
  <script>
    (async function() {
      try {
        const returnUrl = ${JSON.stringify(returnUrl)};
        const localStorageData = localStorage.getItem('sudoku-race-puzzle-state');

        if (localStorageData) {
          const response = await fetch('/api/auth/migrate-guest-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ localStorageData, returnUrl }),
          });

          const result = await response.json();

          if (result.success && result.data) {
            localStorage.removeItem('sudoku-race-puzzle-state');

            const { redirectUrl } = result.data;
            window.location.href = redirectUrl;
            return;
          } else {
            console.error('Migration failed:', result.error);
            window.location.href = returnUrl + (returnUrl.includes('?') ? '&' : '?') + 'migrationFailed=true';
            return;
          }
        }

        window.location.href = returnUrl;
      } catch (error) {
        console.error('Migration error:', error);
        const returnUrl = ${JSON.stringify(returnUrl)};
        window.location.href = returnUrl + (returnUrl.includes('?') ? '&' : '?') + 'migrationFailed=true';
      }
    })();
  </script>
</body>
</html>
    `;

    return new NextResponse(migrationPage, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
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
