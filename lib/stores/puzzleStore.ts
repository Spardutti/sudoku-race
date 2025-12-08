import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PuzzleState, PuzzleActions } from './puzzleStore.types';
import { createEmptyGrid, autoClearPencilMarks } from './puzzleStore.helpers';

export type { PuzzleState, PuzzleActions } from './puzzleStore.types';

export const usePuzzleStore = create<PuzzleState & PuzzleActions>()(
  persist(
    (set) => ({
      puzzleId: null,
      puzzle: null,
      userEntries: createEmptyGrid(),
      selectedCell: null,
      elapsedTime: 0,
      isCompleted: false,
      completionTime: null,
      solvePath: [],
      noteMode: false,
      pencilMarks: {},
      isStarted: false,
      isPaused: false,
      pausedAt: null,

      setPuzzle: (id: string, puzzle: number[][]) =>
        set((state) => {

          // If same puzzle, just update puzzle data without resetting timer state
          if (state.puzzleId === id) {
            return { puzzle };
          }

    
          return {
            puzzleId: id,
            puzzle,
            userEntries: createEmptyGrid(),
            selectedCell: null,
            elapsedTime: 0,
            isCompleted: false,
            completionTime: null,
            solvePath: [],
            noteMode: false,
            pencilMarks: {},
            isStarted: false,
            isPaused: false,
            pausedAt: null,
          };
        }),

      updateCell: (row: number, col: number, value: number) =>
        set((state) => {
          const newEntries = state.userEntries.map((r, i) =>
            i === row ? r.map((c, j) => (j === col ? value : c)) : r
          );

          const key = `${row}-${col}`;
          let newPencilMarks = { ...state.pencilMarks };

          if (value !== 0) {
            delete newPencilMarks[key];
            newPencilMarks = autoClearPencilMarks(newPencilMarks, row, col, value);
          } else {
            delete newPencilMarks[key];
          }

          return { userEntries: newEntries, pencilMarks: newPencilMarks };
        }),

      setSelectedCell: (cell: { row: number; col: number } | null) =>
        set(() => ({ selectedCell: cell })),

      setElapsedTime: (seconds: number) =>
        set(() => ({ elapsedTime: seconds })),

      updateElapsedTime: (seconds: number) =>
        set(() => ({ elapsedTime: seconds })),

      setCompleted: () => set(() => ({ isCompleted: true })),

      markCompleted: (time: number) =>
        set(() => ({ isCompleted: true, completionTime: time })),

      restoreState: (state: Partial<PuzzleState>) =>
        set((current) => {
    

          const filtered = Object.entries(state).reduce((acc, [key, value]) => {
            if (value !== undefined) {
              acc[key as keyof PuzzleState] = value as never;
            }
            return acc;
          }, {} as Partial<PuzzleState>);

          const newState = {
            ...current,
            ...filtered,
          };
 

          return newState;
        }),

      resetPuzzle: () => {
        

        if (typeof window !== 'undefined') {
          localStorage.removeItem('sudoku-race-puzzle-state');
        }
        return set(() => ({
          puzzleId: null,
          puzzle: null,
          userEntries: createEmptyGrid(),
          selectedCell: null,
          elapsedTime: 0,
          isCompleted: false,
          completionTime: null,
          solvePath: [],
          noteMode: false,
          pencilMarks: {},
          isStarted: false,
          isPaused: false,
          pausedAt: null,
        }));
      },

      trackCellEntry: (row: number, col: number, value: number) =>
        set((state) => {
          const existingEntries = state.solvePath.filter(
            (e) => e.row === row && e.col === col
          );

          return {
            solvePath: [
              ...state.solvePath,
              {
                row,
                col,
                value,
                timestamp: Date.now(),
                isCorrection: existingEntries.length > 0,
              },
            ],
          };
        }),

      toggleNoteMode: () => set((state) => ({ noteMode: !state.noteMode })),

      addPencilMark: (row: number, col: number, value: number) =>
        set((state) => {
          const key = `${row}-${col}`;
          const current = state.pencilMarks[key] || [];
          if (current.includes(value)) return state;
          return {
            pencilMarks: {
              ...state.pencilMarks,
              [key]: [...current, value],
            },
          };
        }),

      removePencilMark: (row: number, col: number, value: number) =>
        set((state) => {
          const key = `${row}-${col}`;
          const current = state.pencilMarks[key];
          if (!current) return state;
          const filtered = current.filter((n) => n !== value);
          const newMarks = { ...state.pencilMarks };
          if (filtered.length === 0) {
            delete newMarks[key];
          } else {
            newMarks[key] = filtered;
          }
          return { pencilMarks: newMarks };
        }),

      clearCellPencilMarks: (row: number, col: number) =>
        set((state) => {
          const key = `${row}-${col}`;
          const newMarks = { ...state.pencilMarks };
          delete newMarks[key];
          return { pencilMarks: newMarks };
        }),

      startPuzzle: () =>
        set(() => ({
          isStarted: true,
        })),

      pausePuzzle: () =>
        set(() => {
          const pausedAt = Date.now();
          return {
            isPaused: true,
            pausedAt,
          };
        }),

      resumePuzzle: () =>
        set(() => {
          return {
            isPaused: false,
            pausedAt: null,
          };
        }),
    }),
    {
      name: 'sudoku-race-puzzle-state',
      partialize: (state) => ({
        puzzleId: state.puzzleId,
        userEntries: state.userEntries,
        selectedCell: state.selectedCell,
        elapsedTime: state.elapsedTime,
        isCompleted: state.isCompleted,
        completionTime: state.completionTime,
        solvePath: state.solvePath,
        noteMode: state.noteMode,
        pencilMarks: state.pencilMarks,
        isStarted: state.isStarted,
        isPaused: state.isPaused,
        pausedAt: state.pausedAt,
      }),
    }
  )
);
