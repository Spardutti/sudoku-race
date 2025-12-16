import { NextRequest, NextResponse } from "next/server";
import { submitCompletion } from "@/actions/puzzle-submission";
import { getCurrentUserId } from "@/lib/auth/get-current-user";
import type { SolvePath } from "@/lib/types/solve-path";

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { puzzleId, userEntries, solvePath } = body;

    if (!puzzleId || !userEntries) {
      return NextResponse.json(
        { error: "Missing required fields: puzzleId, userEntries" },
        { status: 400 }
      );
    }

    const result = await submitCompletion(
      puzzleId,
      userEntries,
      solvePath as SolvePath || []
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      rank: result.data.rank,
      completionTime: result.data.completionTime,
      flagged: result.data.flagged,
      streakData: result.data.streakData,
    });
  } catch (error) {
    console.error("[API] Error submitting puzzle:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
