"use server";

import { headers } from "next/headers";
import { createServerActionClient } from "@/lib/supabase/server";
import { getClientIP } from "@/lib/utils/ip-utils";
import { ABUSE_ERRORS } from "@/lib/constants/errors";
import { logger } from "@/lib/utils/logger";
import type { Result } from "@/lib/types/result";
import * as Sentry from "@sentry/nextjs";
import { isValidGrid, gridsEqual, isValidSudoku } from "@/lib/sudoku/grid-validator";
import { getCurrentUserId } from "@/lib/auth/get-current-user";
import { validationLimiter } from "@/lib/abuse-prevention/rate-limiters";

export async function validatePuzzle(
  puzzleId: string,
  solution: number[][]
): Promise<Result<{ correct: boolean }, string>> {
  try {
    if (!isValidGrid(solution)) {
      return {
        success: false,
        error: "Invalid solution format. Grid must be 9x9 with values 1-9.",
      };
    }

    const userId = await getCurrentUserId();
    const headersList = await headers();
    const clientIP = getClientIP({ headers: headersList });
    const token = userId || clientIP;

    try {
      await validationLimiter.check(100, token);
    } catch {
      logger.warn("Puzzle validation rate limit exceeded", {
        userId: userId || undefined,
        ip: userId ? undefined : clientIP,
        puzzleId,
        action: "validatePuzzle",
        limit: 100,
        windowSeconds: 3600,
      });

      return { success: false, error: ABUSE_ERRORS.RATE_LIMIT_EXCEEDED };
    }

    const supabase = await createServerActionClient();

    const { data, error } = await supabase
      .from("puzzles")
      .select("solution")
      .eq("id", puzzleId)
      .single();

    if (error || !data) {
      const fetchError = error || new Error("Puzzle not found");

      logger.error("Failed to fetch puzzle for validation", fetchError, {
        puzzleId,
        action: "validatePuzzle",
      });

      return {
        success: false,
        error: "Puzzle not found. Please try again.",
      };
    }

    const storedSolution = data.solution as number[][];
    const correct = gridsEqual(solution, storedSolution);

    logger.info("Puzzle validation completed", {
      puzzleId,
      correct,
      action: "validatePuzzle",
    });

    return {
      success: true,
      data: { correct },
    };
  } catch (error) {
    const validationError = error as Error;

    logger.error("Failed to validate puzzle", validationError, {
      puzzleId,
      action: "validatePuzzle",
    });

    Sentry.captureException(validationError, {
      extra: { puzzleId, action: "validatePuzzle" },
    });

    return {
      success: false,
      error: "Failed to validate solution. Please try again.",
    };
  }
}

export async function validateSolution(
  puzzleId: string,
  userEntries: number[][]
): Promise<Result<{ isValid: boolean; errors?: string[] }, string>> {
  try {
    if (!isValidGrid(userEntries)) {
      return {
        success: false,
        error: "Invalid solution format. Grid must be 9x9 with values 1-9.",
      };
    }

    const userId = await getCurrentUserId();
    const headersList = await headers();
    const clientIP = getClientIP({ headers: headersList });
    const token = userId || clientIP;

    try {
      await validationLimiter.check(100, token);
    } catch {
      logger.warn("Solution validation rate limit exceeded", {
        userId: userId || undefined,
        ip: userId ? undefined : clientIP,
        puzzleId,
        action: "validateSolution",
        limit: 100,
        windowSeconds: 3600,
      });

      return { success: false, error: ABUSE_ERRORS.RATE_LIMIT_EXCEEDED };
    }

    if (!isValidSudoku(userEntries)) {
      logger.info("Solution validation failed: invalid Sudoku rules", {
        puzzleId,
        action: "validateSolution",
      });

      return {
        success: true,
        data: { isValid: false },
      };
    }

    const supabase = await createServerActionClient();

    const { data, error } = await supabase
      .from("puzzles")
      .select("solution")
      .eq("id", puzzleId)
      .single();

    if (error || !data) {
      const fetchError = error || new Error("Puzzle not found");

      logger.error("Failed to fetch puzzle for validation", fetchError, {
        puzzleId,
        action: "validateSolution",
      });

      return {
        success: false,
        error: "Puzzle not found. Please try again.",
      };
    }

    const storedSolution = data.solution as number[][];
    const isValid = gridsEqual(userEntries, storedSolution);

    logger.info("Solution validation completed", {
      puzzleId,
      isValid,
      action: "validateSolution",
    });

    return {
      success: true,
      data: { isValid },
    };
  } catch (error) {
    const validationError = error as Error;

    logger.error("Failed to validate solution", validationError, {
      puzzleId,
      action: "validateSolution",
    });

    Sentry.captureException(validationError, {
      extra: { puzzleId, action: "validateSolution" },
    });

    return {
      success: false,
      error: "Failed to validate solution. Please try again.",
    };
  }
}
