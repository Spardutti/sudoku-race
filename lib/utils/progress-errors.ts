import { logger } from "@/lib/utils/logger";
import type { Result } from "@/lib/types/result";
import * as Sentry from "@sentry/nextjs";

export const handleSaveError = (
  error: unknown,
  puzzleId: string
): Result<void, string> => {
  const saveError = error as Error;

  logger.error("Exception saving puzzle progress", saveError, {
    puzzleId,
    action: "saveProgress",
  });

  Sentry.captureException(saveError, {
    extra: { puzzleId, action: "saveProgress" },
  });

  return {
    success: false,
    error: "Failed to save progress. Please try again.",
  };
};

export const handleLoadError = (
  error: unknown,
  puzzleId: string
): Result<never, string> => {
  const loadError = error as Error;

  logger.error("Exception loading puzzle progress", loadError, {
    puzzleId,
    action: "loadProgress",
  });

  Sentry.captureException(loadError, {
    extra: { puzzleId, action: "loadProgress" },
  });

  return {
    success: false,
    error: "Failed to load progress. Please try again.",
  };
};
