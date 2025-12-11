/**
 * Seed Multiple Difficulties Script
 *
 * Generates and stores both easy and medium puzzles for specified date range.
 * Usage: npm run puzzle:seed:multi [count] [startDate]
 * Example: npm run puzzle:seed:multi 7 2025-12-11
 *
 * Story: 6.6 Multi-Difficulty Puzzle System
 */

// Load environment variables from .env.local
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { generate, solve, analyze } from "sudoku-core";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { ACTIVE_DIFFICULTY_LEVELS, type DifficultyLevel } from "@/lib/types/difficulty";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

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

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

async function seedPuzzleForDateAndDifficulty(
  puzzleDate: string,
  difficulty: DifficultyLevel
): Promise<boolean> {
  try {
    const board = generate(difficulty);

    const analysis = analyze(board);

    if (!analysis.hasUniqueSolution) {
      console.log(`    ⚠️  Regenerating ${difficulty} puzzle (no unique solution)...`);
      const retryBoard = generate(difficulty);
      const retryAnalysis = analyze(retryBoard);
      if (!retryAnalysis.hasUniqueSolution) {
        throw new Error("Failed to generate valid puzzle after retry");
      }
    }

    const solvingResult = solve(board);

    if (!solvingResult.solved || !solvingResult.board) {
      throw new Error("Failed to solve generated puzzle");
    }

    const puzzle_data = boardTo9x9Array(board);
    const solution = boardTo9x9Array(solvingResult.board);

    const { data, error } = await supabase
      .from("puzzles")
      .insert({
        puzzle_date: puzzleDate,
        puzzle_data,
        solution,
        difficulty,
      })
      .select("id, puzzle_date, difficulty")
      .single();

    if (error) {
      if (error.code === "23505") {
        console.log(`    ⚠️  ${difficulty} puzzle already exists for ${puzzleDate} (skipped)`);
        return false;
      }

      throw error;
    }

    const emptyCells = board.filter((cell) => cell === null).length;
    console.log(`    ✅ ${difficulty}: ${emptyCells} empty cells (ID: ${data.id})`);
    return true;
  } catch (error) {
    console.error(`    ❌ Failed to seed ${difficulty} puzzle for ${puzzleDate}:`, error);
    throw error;
  }
}

async function seedMultiDifficultyPuzzles() {
  const args = process.argv.slice(2);
  const count = parseInt(args[0] || "7", 10);
  const startDate = args[1] || new Date().toISOString().split("T")[0];

  console.log("🎲 Seeding Multi-Difficulty Daily Sudoku Puzzles\n");
  console.log(`📊 Count: ${count} days`);
  console.log(`🎯 Difficulties: ${ACTIVE_DIFFICULTY_LEVELS.join(", ")}`);
  console.log(`📅 Start Date: ${startDate}`);
  console.log(`📅 End Date: ${addDays(startDate, count - 1)}\n`);

  const stats = {
    seeded: 0,
    skipped: 0,
  };

  for (let i = 0; i < count; i++) {
    const puzzleDate = addDays(startDate, i);
    console.log(`\n[${i + 1}/${count}] Generating puzzles for ${puzzleDate}...`);

    for (const difficulty of ACTIVE_DIFFICULTY_LEVELS) {
      const seeded = await seedPuzzleForDateAndDifficulty(puzzleDate, difficulty);
      if (seeded) {
        stats.seeded++;
      } else {
        stats.skipped++;
      }
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`✅ Seeding complete!`);
  console.log(`   New puzzles: ${stats.seeded}`);
  console.log(`   Skipped (already exist): ${stats.skipped}`);
  console.log(`   Total in range: ${count * ACTIVE_DIFFICULTY_LEVELS.length}`);
  console.log("=".repeat(50) + "\n");

  process.exit(0);
}

seedMultiDifficultyPuzzles().catch((error) => {
  console.error("\n❌ Fatal error during seeding:");
  console.error(error);
  process.exit(1);
});
