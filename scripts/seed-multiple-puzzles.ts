/**
 * Seed Multiple Daily Puzzles Script
 *
 * Generates and stores multiple consecutive daily Sudoku puzzles for testing.
 * Uses sudoku-core library for puzzle generation and validation.
 *
 * Usage: npm run puzzle:seed:multiple [count] [startDate]
 * Example: npm run puzzle:seed:multiple 7 2025-11-16
 *
 * @see docs/tech-spec-epic-2.md (Section 2.1: Daily Puzzle Service Module)
 */

// Load environment variables from .env.local
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { generate, solve, analyze } from "sudoku-core";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

// Create Supabase client for seed script
// Use service role key to bypass RLS (puzzles table has no public INSERT policy)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

/**
 * Convert sudoku-core board format (null for empty cells) to puzzle_data format (0 for empty cells)
 */
function boardTo9x9Array(board: (number | null)[]): number[][] {
  const grid: number[][] = [];

  for (let i = 0; i < 9; i++) {
    const row: number[] = [];
    for (let j = 0; j < 9; j++) {
      const value = board[i * 9 + j];
      row.push(value === null ? 0 : value);
    }
    grid.push(row);
  }

  return grid;
}

/**
 * Add days to a date and return YYYY-MM-DD string
 */
function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

/**
 * Generate and seed a puzzle for a specific date
 */
async function seedPuzzleForDate(puzzleDate: string): Promise<boolean> {
  try {
    // Generate puzzle (medium difficulty for MVP)
    const board = generate("medium");

    // Validate puzzle has unique solution
    const analysis = analyze(board);

    if (!analysis.hasUniqueSolution) {
      console.log(`  ⚠️  Regenerating puzzle (no unique solution)...`);
      // Retry once
      const retryBoard = generate("medium");
      const retryAnalysis = analyze(retryBoard);
      if (!retryAnalysis.hasUniqueSolution) {
        throw new Error("Failed to generate valid puzzle after retry");
      }
    }

    // Solve puzzle to get complete solution
    const solvingResult = solve(board);

    if (!solvingResult.solved || !solvingResult.board) {
      throw new Error("Failed to solve generated puzzle");
    }

    // Convert to 9x9 arrays with 0 for empty cells
    const puzzle_data = boardTo9x9Array(board);
    const solution = boardTo9x9Array(solvingResult.board);

    // Insert puzzle into database
    const { data, error } = await supabase
      .from("puzzles")
      .insert({
        puzzle_date: puzzleDate,
        puzzle_data,
        solution,
        difficulty: "medium",
      })
      .select("id, puzzle_date, difficulty")
      .single();

    if (error) {
      // Check if it's a duplicate date error (unique constraint violation)
      if (error.code === "23505") {
        console.log(`  ⚠️  Puzzle already exists for ${puzzleDate} (skipped)`);
        return false;
      }

      throw error;
    }

    console.log(`  ✅ Seeded puzzle: ${data.puzzle_date} (ID: ${data.id})`);
    return true;
  } catch (error) {
    console.error(`  ❌ Failed to seed puzzle for ${puzzleDate}:`, error);
    throw error;
  }
}

/**
 * Seed multiple consecutive puzzles
 */
async function seedMultiplePuzzles() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const count = parseInt(args[0] || "7", 10);
  const startDate = args[1] || new Date().toISOString().split("T")[0];

  console.log("🎲 Seeding Multiple Daily Sudoku Puzzles\n");
  console.log(`📊 Count: ${count} puzzles`);
  console.log(`📅 Start Date: ${startDate}`);
  console.log(`📅 End Date: ${addDays(startDate, count - 1)}\n`);

  let seededCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < count; i++) {
    const puzzleDate = addDays(startDate, i);
    console.log(`\n[${i + 1}/${count}] Generating puzzle for ${puzzleDate}...`);

    const seeded = await seedPuzzleForDate(puzzleDate);
    if (seeded) {
      seededCount++;
    } else {
      skippedCount++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`✅ Seeding complete!`);
  console.log(`   New puzzles: ${seededCount}`);
  console.log(`   Skipped (already exist): ${skippedCount}`);
  console.log(`   Total in range: ${count}`);
  console.log("=".repeat(50) + "\n");

  process.exit(0);
}

// Run the seed script
seedMultiplePuzzles().catch((error) => {
  console.error("\n❌ Fatal error during seeding:");
  console.error(error);
  process.exit(1);
});
