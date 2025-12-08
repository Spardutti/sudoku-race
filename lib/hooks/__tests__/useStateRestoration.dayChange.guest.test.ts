import { renderHook, waitFor, act } from "@testing-library/react";
import { useStateRestoration } from "../useStateRestoration";
import { usePuzzleStore } from "@/lib/stores/puzzleStore";

describe("useStateRestoration - Guest Day Change", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    act(() => {
      usePuzzleStore.getState().resetPuzzle();
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("clears Day 1 state when Day 2 puzzle loads", async () => {
    const day1Puzzle = "puzzle-2025-12-07";
    const day2Puzzle = "puzzle-2025-12-08";
    const testPuzzle = [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ];

    act(() => {
      usePuzzleStore.getState().setPuzzle(day1Puzzle, testPuzzle);
      usePuzzleStore.getState().updateCell(0, 2, 4);
      usePuzzleStore.getState().setElapsedTime(120);
    });

    expect(usePuzzleStore.getState().puzzleId).toBe(day1Puzzle);
    expect(usePuzzleStore.getState().userEntries[0][2]).toBe(4);
    expect(usePuzzleStore.getState().elapsedTime).toBe(120);

    const { result } = renderHook(() =>
      useStateRestoration(false, day2Puzzle)
    );

    await waitFor(() => expect(result.current).toBe(false));

    const state = usePuzzleStore.getState();
    expect(state.puzzleId).toBeNull();
    expect(state.userEntries).toEqual(
      Array(9)
        .fill(null)
        .map(() => Array(9).fill(0))
    );
    expect(state.elapsedTime).toBe(0);
    expect(state.isStarted).toBe(false);

    const storedState = localStorage.getItem("sudoku-race-puzzle-state");
    expect(storedState).toBeTruthy();
    const parsed = JSON.parse(storedState!);
    expect(parsed.state.puzzleId).toBeNull();
  });

  it("preserves state when refreshing same puzzle", async () => {
    const puzzleId = "puzzle-2025-12-07";
    const testPuzzle = [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ];

    act(() => {
      usePuzzleStore.getState().setPuzzle(puzzleId, testPuzzle);
      usePuzzleStore.getState().updateCell(0, 2, 4);
      usePuzzleStore.getState().updateCell(1, 1, 5);
      usePuzzleStore.getState().setElapsedTime(240);
    });

    const userEntriesBefore = usePuzzleStore.getState().userEntries;
    const elapsedTimeBefore = usePuzzleStore.getState().elapsedTime;

    const { result } = renderHook(() =>
      useStateRestoration(false, puzzleId)
    );

    await waitFor(() => expect(result.current).toBe(false));

    const state = usePuzzleStore.getState();
    expect(state.puzzleId).toBe(puzzleId);
    expect(state.userEntries).toBe(userEntriesBefore);
    expect(state.elapsedTime).toBe(elapsedTimeBefore);
  });

  it("clears state when skipping multiple days", async () => {
    const day1Puzzle = "puzzle-2025-12-05";
    const day5Puzzle = "puzzle-2025-12-09";
    const testPuzzle = [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ];

    act(() => {
      usePuzzleStore.getState().setPuzzle(day1Puzzle, testPuzzle);
      usePuzzleStore.getState().updateCell(0, 2, 4);
      usePuzzleStore.getState().setElapsedTime(300);
    });

    const { result } = renderHook(() =>
      useStateRestoration(false, day5Puzzle)
    );

    await waitFor(() => expect(result.current).toBe(false));

    const state = usePuzzleStore.getState();
    expect(state.puzzleId).toBeNull();
    expect(state.userEntries).toEqual(
      Array(9)
        .fill(null)
        .map(() => Array(9).fill(0))
    );
    expect(state.elapsedTime).toBe(0);
  });
});
