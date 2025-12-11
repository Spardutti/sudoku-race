import type { Database } from "./database";

export type DifficultyLevel = Database["public"]["Enums"]["difficulty_level"];

export const DIFFICULTY_LEVELS: DifficultyLevel[] = ["easy", "medium", "hard"];

export const ACTIVE_DIFFICULTY_LEVELS: DifficultyLevel[] = ["easy", "medium"];
