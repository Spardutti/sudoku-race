import { renderHook, waitFor } from "@testing-library/react";
import { useStateRestoration } from "../useStateRestoration";
import { usePuzzleStore } from "@/lib/stores/puzzleStore";
import { loadProgress } from "@/actions/puzzle";

jest.mock("@/actions/puzzle", () => ({
  loadProgress: jest.fn(),
}));

const mockLoadProgress = loadProgress as jest.MockedFunction<typeof loadProgress>;

describe("useStateRestoration - Auth Transitions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePuzzleStore.getState().resetPuzzle();
  });

  it("re-triggers state load when auth changes from false to true (AC1)", async () => {
    mockLoadProgress.mockResolvedValue({
      success: true,
      data: {
        userEntries: Array(9)
          .fill(null)
          .map(() => Array(9).fill(0)),
        elapsedTime: 120,
        isCompleted: false,
        isPaused: false,
        pausedAt: null,
      },
    });

    const { rerender } = renderHook(
      ({ isAuth }: { isAuth: boolean }) => useStateRestoration(isAuth, "puzzle-123"),
      { initialProps: { isAuth: false } }
    );

    await waitFor(() => expect(mockLoadProgress).not.toHaveBeenCalled());

    rerender({ isAuth: true });

    await waitFor(() => {
      expect(mockLoadProgress).toHaveBeenCalledWith("puzzle-123");
    });
  });

  it("loads server progress when transitioning to authenticated (AC1)", async () => {
    const mockServerData = {
      userEntries: [
        [1, 0, 3, 0, 5, 0, 7, 0, 9],
        [0, 5, 0, 7, 0, 9, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      elapsedTime: 300,
      isCompleted: false,
      isPaused: false,
      pausedAt: null,
    };

    mockLoadProgress.mockResolvedValue({
      success: true,
      data: mockServerData,
    });

    const { result, rerender } = renderHook(
      ({ isAuth }: { isAuth: boolean }) => useStateRestoration(isAuth, "puzzle-123"),
      { initialProps: { isAuth: false } }
    );

    await waitFor(() => expect(result.current).toBe(false));

    rerender({ isAuth: true });

    await waitFor(() => {
      expect(mockLoadProgress).toHaveBeenCalledWith("puzzle-123");
      const state = usePuzzleStore.getState();
      expect(state.userEntries).toEqual(mockServerData.userEntries);
      expect(state.elapsedTime).toBe(300);
    });
  });

  it("does not reload when auth stays false", async () => {
    const { rerender } = renderHook(
      ({ isAuth }: { isAuth: boolean }) => useStateRestoration(isAuth, "puzzle-123"),
      { initialProps: { isAuth: false } }
    );

    await waitFor(() => expect(mockLoadProgress).not.toHaveBeenCalled());

    rerender({ isAuth: false });

    expect(mockLoadProgress).not.toHaveBeenCalled();
  });

  it("does not reload when auth stays true", async () => {
    mockLoadProgress.mockResolvedValue({
      success: true,
      data: null,
    });

    const { rerender } = renderHook(
      ({ isAuth }: { isAuth: boolean }) => useStateRestoration(isAuth, "puzzle-123"),
      { initialProps: { isAuth: true } }
    );

    await waitFor(() => expect(mockLoadProgress).toHaveBeenCalledTimes(1));

    jest.clearAllMocks();
    rerender({ isAuth: true });

    expect(mockLoadProgress).not.toHaveBeenCalled();
  });
});
