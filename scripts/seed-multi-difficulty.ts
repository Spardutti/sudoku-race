/**
 * Seed Multiple Difficulties Script
 *
 * Generates and stores both easy and medium puzzles for specified date range.
 * Usage: npm run puzzle:seed:multi [count] [startDate]
 * Example: npm run puzzle:seed:multi 7 2025-12-11
 *
 * Story: 6.6 Multi-Difficulty Puzzle System
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { ACTIVE_DIFFICULTY_LEVELS } from "@/lib/types/difficulty";
import { generatePuzzlesForDate, addDays } from "@/lib/sudoku/puzzle-generator";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

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

    const results = await generatePuzzlesForDate(supabase, puzzleDate);

    for (const result of results) {
      if (!result.success) {
        console.error(`    ❌ ${result.difficulty}: ${result.error}`);
        throw new Error(`Failed to generate ${result.difficulty} puzzle for ${puzzleDate}`);
      }

      if (result.alreadyExists) {
        console.log(`    ⚠️  ${result.difficulty} puzzle already exists (skipped)`);
        stats.skipped++;
      } else {
        console.log(`    ✅ ${result.difficulty} (ID: ${result.puzzleId})`);
        stats.seeded++;
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
