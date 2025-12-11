/**
 * Daily Puzzle Seed Script
 *
 * Generates and stores a daily Sudoku puzzle in the database.
 * Uses sudoku-core library for puzzle generation and validation.
 *
 * Usage: npm run puzzle:seed [difficulty]
 * Example: npm run puzzle:seed easy
 *
 * Story: 6.6 Multi-Difficulty Puzzle System
 */

// Load environment variables from .env.local
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { generate, solve, analyze } from "sudoku-core";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import type { DifficultyLevel } from "@/lib/types/difficulty";

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
 *
 * @param board - sudoku-core board (81-element array with null for empty cells)
 * @returns 9x9 array with 0 for empty cells, 1-9 for clues
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
 * Generate and seed today's puzzle
 */
async function seedPuzzle() {
  const args = process.argv.slice(2);
  const difficulty: DifficultyLevel = (args[0] as DifficultyLevel) || "medium";

  if (!["easy", "medium", "hard"].includes(difficulty)) {
    console.error("❌ Invalid difficulty. Use: easy, medium, or hard");
    process.exit(1);
  }

  console.log("🎲 Generating daily Sudoku puzzle...\n");

  try {
    const board = generate(difficulty);

    // Validate puzzle has unique solution
    const analysis = analyze(board);

    if (!analysis.hasUniqueSolution) {
      console.error("❌ Generated puzzle does not have unique solution. Regenerating...");
      // Retry once (sudoku-core generate() already retries internally)
      return seedPuzzle();
    }

    console.log("✅ Valid puzzle generated with unique solution");

    // Solve puzzle to get complete solution
    const solvingResult = solve(board);

    if (!solvingResult.solved || !solvingResult.board) {
      throw new Error("Failed to solve generated puzzle");
    }

    // Convert to 9x9 arrays with 0 for empty cells
    const puzzle_data = boardTo9x9Array(board);
    const solution = boardTo9x9Array(solvingResult.board);

    // Calculate today's UTC date (YYYY-MM-DD format)
    const puzzle_date = new Date().toISOString().split("T")[0];

    console.log(`📅 Puzzle date: ${puzzle_date}`);
    console.log(`🧩 Difficulty: ${difficulty}`);
    console.log(`📊 Empty cells: ${board.filter((cell) => cell === null).length}\n`);

    // Insert puzzle into database
    const { data, error } = await supabase
      .from("puzzles")
      .insert({
        puzzle_date,
        puzzle_data,
        solution,
        difficulty,
      })
      .select("id, puzzle_date, difficulty")
      .single();

    if (error) {
      // Check if it's a duplicate date error (unique constraint violation)
      if (error.code === "23505") {
        console.warn("⚠️  Puzzle for today already exists");
        console.log(`   Date: ${puzzle_date}\n`);
        process.exit(0);
      }

      throw error;
    }

    console.log("✅ Puzzle successfully inserted into database");
    console.log(`   ID: ${data.id}`);
    console.log(`   Date: ${data.puzzle_date}`);
    console.log(`   Difficulty: ${data.difficulty}\n`);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Failed to seed puzzle:");
    console.error(error);
    process.exit(1);
  }
}

// Run the seed script
seedPuzzle();
