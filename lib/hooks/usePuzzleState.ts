import { usePuzzleStore } from "@/lib/stores/puzzleStore";

export const usePuzzleState = () => {
  return {
    userEntries: usePuzzleStore((state) => state.userEntries),
    selectedCell: usePuzzleStore((state) => state.selectedCell),
    elapsedTime: usePuzzleStore((state) => state.elapsedTime),
    isCompleted: usePuzzleStore((state) => state.isCompleted),
    isStarted: usePuzzleStore((state) => state.isStarted),
    isPaused: usePuzzleStore((state) => state.isPaused),
    puzzleData: usePuzzleStore((state) => state.puzzle),
    solvePath: usePuzzleStore((state) => state.solvePath),
    noteMode: usePuzzleStore((state) => state.noteMode),
    pencilMarks: usePuzzleStore((state) => state.pencilMarks),
    toggleNoteMode: usePuzzleStore((state) => state.toggleNoteMode),
    difficulty: usePuzzleStore((state) => state.difficulty),
    lockMode: usePuzzleStore((state) => state.lockMode),
    lockedCells: usePuzzleStore((state) => state.lockedCells),
    toggleLockMode: usePuzzleStore((state) => state.toggleLockMode),
    resetUnlockedCells: usePuzzleStore((state) => state.resetUnlockedCells),
    toggleCellLock: usePuzzleStore((state) => state.toggleCellLock),
  };
};
