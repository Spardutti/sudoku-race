import { renderHook, waitFor } from "@testing-library/react";
import { useStateRestoration } from "../useStateRestoration";
import { usePuzzleStore } from "@/lib/stores/puzzleStore";
import { loadProgress } from "@/actions/puzzle";

jest.mock("@/actions/puzzle", () => ({
  loadProgress: jest.fn(),
}));

const mockLoadProgress = loadProgress as jest.MockedFunction<typeof loadProgress>;

describe("useStateRestoration - Grid State Restoration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePuzzleStore.getState().resetPuzzle();
  });

  it("restores grid state with filled cells from database", async () => {
    const mockUserEntries = [
      [1, 0, 3, 0, 5, 0, 7, 0, 9],
      [0, 5, 0, 7, 0, 9, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    mockLoadProgress.mockResolvedValue({
      success: true,
      data: {
        userEntries: mockUserEntries,
        elapsedTime: 120,
        isCompleted: false,
        isPaused: false,
        pausedAt: null,
      },
    });

    const { result } = renderHook(() =>
      useStateRestoration(true, "puzzle-123")
    );

    await waitFor(() => expect(result.current).toBe(false));

    const state = usePuzzleStore.getState();
    expect(state.userEntries).toEqual(mockUserEntries);
    expect(state.elapsedTime).toBe(120);
  });

  it("handles empty grid (no user entries) without crashing", async () => {
    const emptyGrid = Array(9)
      .fill(null)
      .map(() => Array(9).fill(0));

    mockLoadProgress.mockResolvedValue({
      success: true,
      data: {
        userEntries: emptyGrid,
        elapsedTime: 0,
        isCompleted: false,
        isPaused: false,
        pausedAt: null,
      },
    });

    const { result } = renderHook(() =>
      useStateRestoration(true, "puzzle-123")
    );

    await waitFor(() => expect(result.current).toBe(false));

    const state = usePuzzleStore.getState();
    expect(state.userEntries).toBeDefined();
    expect(state.elapsedTime).toBe(0);
  });

  it("handles partial grid with some filled cells", async () => {
    const partialGrid = [
      [5, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 3, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 9],
    ];

    mockLoadProgress.mockResolvedValue({
      success: true,
      data: {
        userEntries: partialGrid,
        elapsedTime: 60,
        isCompleted: false,
        isPaused: false,
        pausedAt: null,
      },
    });

    const { result } = renderHook(() =>
      useStateRestoration(true, "puzzle-456")
    );

    await waitFor(() => expect(result.current).toBe(false));

    const state = usePuzzleStore.getState();
    expect(state.userEntries).toEqual(partialGrid);
    expect(state.userEntries[0][0]).toBe(5);
    expect(state.userEntries[2][2]).toBe(3);
    expect(state.userEntries[8][8]).toBe(9);
  });

  it("handles no saved progress (undefined userEntries) gracefully", async () => {
    mockLoadProgress.mockResolvedValue({
      success: true,
      data: {
        userEntries: undefined,
        elapsedTime: 0,
        isCompleted: false,
        isPaused: false,
        pausedAt: null,
      },
    });

    const { result } = renderHook(() =>
      useStateRestoration(true, "puzzle-789")
    );

    await waitFor(() => expect(result.current).toBe(false));
    expect(mockLoadProgress).toHaveBeenCalledWith("puzzle-789");
  });

  it("clears old state when puzzle ID changes", async () => {
    usePuzzleStore.getState().setPuzzle("old-puzzle-123", [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [4, 5, 6, 7, 8, 9, 1, 2, 3],
      [7, 8, 9, 1, 2, 3, 4, 5, 6],
      [2, 3, 4, 5, 6, 7, 8, 9, 1],
      [5, 6, 7, 8, 9, 1, 2, 3, 4],
      [8, 9, 1, 2, 3, 4, 5, 6, 7],
      [3, 4, 5, 6, 7, 8, 9, 1, 2],
      [6, 7, 8, 9, 1, 2, 3, 4, 5],
      [9, 1, 2, 3, 4, 5, 6, 7, 8],
    ]);

    mockLoadProgress.mockResolvedValue({
      success: true,
      data: null,
    });

    const { result } = renderHook(() =>
      useStateRestoration(true, "new-puzzle-456")
    );

    await waitFor(() => expect(result.current).toBe(false));

    const state = usePuzzleStore.getState();
    expect(state.puzzleId).toBeNull();
  });

  it("falls back gracefully when loadProgress fails", async () => {
    mockLoadProgress.mockResolvedValue({
      success: false,
      error: "Network error",
    });

    const { result } = renderHook(() =>
      useStateRestoration(true, "puzzle-123")
    );

    await waitFor(() => expect(result.current).toBe(false));
    expect(mockLoadProgress).toHaveBeenCalledWith("puzzle-123");
  });

  it("skips database load for guest users", async () => {
    const { result } = renderHook(() =>
      useStateRestoration(false, "puzzle-123")
    );

    await waitFor(() => expect(result.current).toBe(false));
    expect(mockLoadProgress).not.toHaveBeenCalled();
  });
});
