"use server";

import type { Puzzle } from "./puzzle-fetch";
import { getPuzzleToday, checkPuzzleCompletion } from "./puzzle-fetch";

import { validatePuzzle, validateSolution } from "./puzzle-validation";

import { startTimer, getElapsedTime } from "./puzzle-timer";

import type { PuzzleProgress } from "./puzzle-progress";
import { saveProgress, loadProgress } from "./puzzle-progress";

import type { CompletionData, CompletePuzzleResult } from "./puzzle-completion";
import { completePuzzle } from "./puzzle-completion";

import { submitCompletion } from "./puzzle-submission";

export type { Puzzle, PuzzleProgress, CompletionData, CompletePuzzleResult };

export {
  getPuzzleToday,
  checkPuzzleCompletion,
  validatePuzzle,
  validateSolution,
  startTimer,
  getElapsedTime,
  saveProgress,
  loadProgress,
  completePuzzle,
  submitCompletion,
};
