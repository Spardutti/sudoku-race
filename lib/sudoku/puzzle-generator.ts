import { generate, solve, analyze } from "sudoku-core";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { ACTIVE_DIFFICULTY_LEVELS, type DifficultyLevel } from "@/lib/types/difficulty";

type PuzzleGenerationResult = {
  success: boolean;
  puzzleId?: string;
  difficulty: DifficultyLevel;
  date: string;
  alreadyExists?: boolean;
  error?: string;
};

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

export async function generatePuzzleForDate(
  supabase: SupabaseClient<Database>,
  puzzleDate: string,
  difficulty: DifficultyLevel
): Promise<PuzzleGenerationResult> {
  try {
    let board = generate(difficulty);
    let analysis = analyze(board);

    if (!analysis.hasUniqueSolution) {
      board = generate(difficulty);
      analysis = analyze(board);
      if (!analysis.hasUniqueSolution) {
        return {
          success: false,
          difficulty,
          date: puzzleDate,
          error: "Failed to generate valid puzzle after retry",
        };
      }
    }

    const solvingResult = solve(board);

    if (!solvingResult.solved || !solvingResult.board) {
      return {
        success: false,
        difficulty,
        date: puzzleDate,
        error: "Failed to solve generated puzzle",
      };
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
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return {
          success: true,
          difficulty,
          date: puzzleDate,
          alreadyExists: true,
        };
      }

      return {
        success: false,
        difficulty,
        date: puzzleDate,
        error: error.message,
      };
    }

    return {
      success: true,
      puzzleId: data.id,
      difficulty,
      date: puzzleDate,
    };
  } catch (error) {
    return {
      success: false,
      difficulty,
      date: puzzleDate,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function generatePuzzlesForDate(
  supabase: SupabaseClient<Database>,
  puzzleDate: string
): Promise<PuzzleGenerationResult[]> {
  return Promise.all(
    ACTIVE_DIFFICULTY_LEVELS.map((difficulty) =>
      generatePuzzleForDate(supabase, puzzleDate, difficulty)
    )
  );
}

export function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow.toISOString().split("T")[0];
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}
