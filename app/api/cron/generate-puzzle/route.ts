import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { generatePuzzlesForDate, getTomorrowDate } from "@/lib/sudoku/puzzle-generator";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const cronSecret = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Missing Supabase configuration" },
        { status: 500 }
      );
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
    const tomorrowDate = getTomorrowDate();

    const results = await generatePuzzlesForDate(supabase, tomorrowDate);

    const successCount = results.filter(
      (r) => r.success && !r.alreadyExists
    ).length;
    const skippedCount = results.filter((r) => r.alreadyExists).length;
    const failedCount = results.filter((r) => !r.success).length;

    return NextResponse.json(
      {
        success: failedCount === 0,
        date: tomorrowDate,
        generated: successCount,
        skipped: skippedCount,
        failed: failedCount,
        results,
      },
      { status: failedCount === 0 ? 200 : 207 }
    );
  } catch (error) {
    console.error("[Cron] Fatal error generating puzzles:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
