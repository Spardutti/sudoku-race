import { render, waitFor } from "@testing-library/react";
import { PuzzlePageClient } from "../PuzzlePageClient";
import { usePuzzleStore } from "@/lib/stores/puzzleStore";
import { useAuthState } from "@/lib/hooks/useAuthState";
import { useAutoSave } from "@/lib/hooks/useAutoSave";
import { useStateRestoration } from "@/lib/hooks/useStateRestoration";
import type { User } from "@supabase/supabase-js";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

jest.mock("@/lib/hooks/useAuthState");
jest.mock("@/lib/hooks/useAutoSave");
jest.mock("@/lib/hooks/useStateRestoration");
jest.mock("@/lib/hooks/useKeyboardInput");
jest.mock("@/lib/hooks/useTimer");
jest.mock("@/lib/hooks/useNetworkStatus", () => ({
  useNetworkStatus: () => true,
}));
jest.mock("@/lib/hooks/usePuzzleSubmission", () => ({
  usePuzzleSubmission: () => ({
    isSubmitting: false,
    validationMessage: null,
    showAnimation: false,
    showCompletionModal: false,
    serverCompletionTime: null,
    serverRank: null,
    streakData: null,
    handleSubmit: jest.fn(),
    setShowCompletionModal: jest.fn(),
  }),
}));
jest.mock("@/lib/hooks/useMigrationNotification");
jest.mock("@/lib/hooks/useTimerActions", () => ({
  useTimerActions: () => ({
    handlePause: jest.fn(),
    handleResume: jest.fn(),
    isPauseLoading: false,
    isResumeLoading: false,
    lastError: null,
  }),
}));
jest.mock("@/actions/puzzle", () => ({
  startTimer: jest.fn().mockResolvedValue(undefined),
}));

const mockUseAuthState = useAuthState as jest.MockedFunction<typeof useAuthState>;
const mockUseAutoSave = useAutoSave as jest.MockedFunction<typeof useAutoSave>;
const mockUseStateRestoration = useStateRestoration as jest.MockedFunction<typeof useStateRestoration>;

const mockPuzzle = {
  id: "test-puzzle-1",
  puzzle_date: "2025-11-28",
  puzzle_number: 1,
  puzzle_data: [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ],
  difficulty: "medium" as const,
  solution: [],
};

const mockUser: User = {
  id: "user-123",
  email: "test@example.com",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: "2025-01-01T00:00:00.000Z",
};

describe("PuzzlePageClient - Auth Transitions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseStateRestoration.mockReturnValue(false);
    usePuzzleStore.setState({
      puzzle: mockPuzzle.puzzle_data,
      puzzleId: mockPuzzle.id,
      userEntries: Array(9).fill(Array(9).fill(0)),
      selectedCell: null,
      elapsedTime: 0,
      isCompleted: false,
      isStarted: true,
      isPaused: false,
      completionTime: null,
      solvePath: [],
      noteMode: false,
      pencilMarks: {},
    });
  });

  it("detects auth change from guest to authenticated (AC1)", async () => {
    mockUseAuthState.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });

    const { rerender } = render(<PuzzlePageClient puzzle={mockPuzzle} />);

    mockUseAuthState.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
    });

    rerender(<PuzzlePageClient puzzle={mockPuzzle} />);

    await waitFor(() => {
      expect(mockUseStateRestoration).toHaveBeenLastCalledWith(true, mockPuzzle.id);
    });
  });

  it("activates auto-save when user becomes authenticated (AC5)", async () => {
    mockUseAuthState.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });

    const { rerender } = render(<PuzzlePageClient puzzle={mockPuzzle} />);
    expect(mockUseAutoSave).toHaveBeenCalledWith(false);

    mockUseAuthState.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
    });

    rerender(<PuzzlePageClient puzzle={mockPuzzle} />);

    await waitFor(() => {
      expect(mockUseAutoSave).toHaveBeenLastCalledWith(true);
    });
  });

  it("updates userId when authenticated", () => {
    mockUseAuthState.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
    });

    render(<PuzzlePageClient puzzle={mockPuzzle} />);

    expect(mockUseStateRestoration).toHaveBeenCalledWith(true, mockPuzzle.id);
    expect(mockUseAutoSave).toHaveBeenCalledWith(true);
  });

  it("maintains guest mode when unauthenticated", () => {
    mockUseAuthState.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });

    render(<PuzzlePageClient puzzle={mockPuzzle} />);

    expect(mockUseStateRestoration).toHaveBeenCalledWith(false, mockPuzzle.id);
    expect(mockUseAutoSave).toHaveBeenCalledWith(false);
  });

  it("disables auto-save for guest users", () => {
    mockUseAuthState.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });

    render(<PuzzlePageClient puzzle={mockPuzzle} />);

    expect(mockUseAutoSave).toHaveBeenCalledWith(false);
  });
});
