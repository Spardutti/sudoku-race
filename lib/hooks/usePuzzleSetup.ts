import * as React from "react";
import { usePuzzleStore } from "@/lib/stores/puzzleStore";
import type { Puzzle } from "@/actions/puzzle";

export const usePuzzleSetup = (puzzle: Puzzle, isLoading: boolean) => {
  const setPuzzle = usePuzzleStore((state) => state.setPuzzle);

  React.useEffect(() => {
    if (isLoading) return;

    const storedPuzzleId = usePuzzleStore.getState().puzzleId;

    if (!storedPuzzleId || storedPuzzleId !== puzzle.id) {
      setPuzzle(puzzle.id, puzzle.puzzle_data, puzzle.difficulty, puzzle.puzzle_date);
    } else if (!usePuzzleStore.getState().puzzle) {
      usePuzzleStore.setState({ puzzle: puzzle.puzzle_data });
    }
  }, [puzzle.id, puzzle.puzzle_data, puzzle.difficulty, puzzle.puzzle_date, setPuzzle, isLoading]);
};
