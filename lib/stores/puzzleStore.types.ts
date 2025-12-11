import { SolvePath } from '@/lib/types/solve-path';
import { DifficultyLevel } from '@/lib/types/difficulty';

export interface PuzzleState {
  puzzleId: string | null;
  difficulty: DifficultyLevel | null;
  puzzleDate: string | null;
  puzzle: number[][] | null;
  userEntries: number[][];
  selectedCell: { row: number; col: number } | null;
  elapsedTime: number;
  isCompleted: boolean;
  completionTime: number | null;
  solvePath: SolvePath;
  noteMode: boolean;
  pencilMarks: Record<string, number[]>;
  isStarted: boolean;
  isPaused: boolean;
  pausedAt: number | null;
}

export interface PuzzleActions {
  setPuzzle: (id: string, puzzle: number[][], difficulty: DifficultyLevel, puzzleDate: string) => void;
  updateCell: (row: number, col: number, value: number) => void;
  setSelectedCell: (cell: { row: number; col: number } | null) => void;
  setElapsedTime: (seconds: number) => void;
  updateElapsedTime: (seconds: number) => void;
  setCompleted: () => void;
  markCompleted: (time: number) => void;
  restoreState: (state: Partial<PuzzleState>) => void;
  resetPuzzle: () => void;
  trackCellEntry: (row: number, col: number, value: number) => void;
  toggleNoteMode: () => void;
  addPencilMark: (row: number, col: number, value: number) => void;
  removePencilMark: (row: number, col: number, value: number) => void;
  clearCellPencilMarks: (row: number, col: number) => void;
  startPuzzle: () => void;
  pausePuzzle: () => void;
  resumePuzzle: () => void;
}
