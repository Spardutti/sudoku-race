import { renderHook, waitFor, act } from "@testing-library/react";
import { useStateRestoration } from "../useStateRestoration";
import { usePuzzleStore } from "@/lib/stores/puzzleStore";
import { loadProgress } from "@/actions/puzzle";

jest.mock("@/actions/puzzle", () => ({
  loadProgress: jest.fn(),
}));

const mockLoadProgress = loadProgress as jest.MockedFunction<typeof loadProgress>;

describe("useStateRestoration - Authenticated Day Change", () => {
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

  it("loads fresh Day 2 when no progress exists", async () => {
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
      usePuzzleStore.getState().setElapsedTime(180);
    });

    mockLoadProgress.mockResolvedValue({
      success: true,
      data: null,
    });

    const { result } = renderHook(() =>
      useStateRestoration(true, day2Puzzle)
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

    expect(mockLoadProgress).toHaveBeenCalledWith(day2Puzzle);
  });

  it("preserves Day 1 DB progress while clearing local state", async () => {
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
    });

    mockLoadProgress.mockResolvedValue({
      success: true,
      data: null,
    });

    const { result } = renderHook(() =>
      useStateRestoration(true, day2Puzzle)
    );

    await waitFor(() => expect(result.current).toBe(false));

    const state = usePuzzleStore.getState();
    expect(state.puzzleId).toBeNull();

    expect(mockLoadProgress).toHaveBeenCalledWith(day2Puzzle);
    expect(mockLoadProgress).not.toHaveBeenCalledWith(day1Puzzle);
  });
});
