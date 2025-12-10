import { NextRequest, NextResponse } from "next/server";
import {
  migrateGuestCompletions,
  parseLocalStorageData,
} from "@/lib/auth/migrate-guest-data";
import { createServerActionClient } from "@/lib/supabase/server";
import { validateReturnUrl } from "@/lib/auth/return-url-validator";
import { logger } from "@/lib/utils/logger";
import * as Sentry from "@sentry/nextjs";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerActionClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { localStorageData, returnUrl: rawReturnUrl } = body;
    const returnUrl = validateReturnUrl(rawReturnUrl || null);

    if (!localStorageData) {
      return NextResponse.json({
        success: true,
        data: {
          completedCount: 0,
          inProgressCount: 0,
          highestRank: null,
          redirectUrl: returnUrl,
        },
      });
    }

    const parsed = parseLocalStorageData(localStorageData);

    const result = await migrateGuestCompletions(user.id, parsed);

    if (!result.success) {
      Sentry.captureMessage("Guest data migration failed", {
        level: "error",
        extra: { userId: user.id, error: result.error },
      });

      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    const { highestRank } = result.data;
    const separator = returnUrl.includes("?") ? "&" : "?";
    const redirectUrl = highestRank !== null
      ? `${returnUrl}${separator}migrated=true&rank=${highestRank}`
      : `${returnUrl}${separator}migrated=true`;

    logger.info("Guest data migration completed via API", {
      userId: user.id,
      result: result.data,
      redirectUrl,
    });

    return NextResponse.json({
      success: true,
      data: { ...result.data, redirectUrl },
    });
  } catch (error) {
    logger.error("Error in migrate-guest-data API", error as Error);
    Sentry.captureException(error, {
      level: "error",
    });

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
