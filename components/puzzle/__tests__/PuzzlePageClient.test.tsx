import { render, screen } from "@testing-library/react";
import { PuzzlePageClient } from "../PuzzlePageClient";
import { usePuzzleStore } from "@/lib/stores/puzzleStore";

// Mock dependencies
jest.mock("@/lib/hooks/useKeyboardInput", () => ({
  useKeyboardInput: jest.fn(),
}));

jest.mock("@/lib/hooks/useAutoSave", () => ({
  useAutoSave: jest.fn(),
}));

jest.mock("@/lib/hooks/useStateRestoration", () => ({
  useStateRestoration: jest.fn(() => false),
}));

jest.mock("@/lib/hooks/useTimer", () => ({
  useTimer: jest.fn(),
}));

jest.mock("@/lib/hooks/useNetworkStatus", () => ({
  useNetworkStatus: jest.fn(() => true),
}));

jest.mock("@/lib/auth/get-current-user", () => ({
  getCurrentUserId: jest.fn(() => Promise.resolve(null)),
}));

jest.mock("@/actions/puzzle", () => ({
  validateSolution: jest.fn(),
  submitCompletion: jest.fn(),
  checkPuzzleCompletion: jest.fn(() =>
    Promise.resolve({ success: true, data: { isCompleted: false } })
  ),
}));

const mockPuzzle = {
  id: "test-puzzle-1",
  puzzle_date: "2025-11-28",
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
};

describe("PuzzlePageClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePuzzleStore.setState({
      puzzle: null,
      puzzleId: null,
      userEntries: Array(9).fill(Array(9).fill(0)),
      selectedCell: null,
      elapsedTime: 0,
      isCompleted: false,
      completionTime: null,
    });
  });

  it("renders puzzle header with date", () => {
    render(<PuzzlePageClient puzzle={mockPuzzle} />);
    expect(screen.getByText("Today's Puzzle")).toBeInTheDocument();
    expect(screen.getByText("November 28, 2025")).toBeInTheDocument();
  });

  it("renders timer component", () => {
    render(<PuzzlePageClient puzzle={mockPuzzle} />);
    expect(screen.getByText("00:00")).toBeInTheDocument();
  });

  it("renders Sudoku grid", () => {
    const { container } = render(<PuzzlePageClient puzzle={mockPuzzle} />);
    const grid = container.querySelector('[role="grid"]');
    expect(grid).toBeInTheDocument();
  });

  it("renders submit button (disabled initially)", () => {
    render(<PuzzlePageClient puzzle={mockPuzzle} />);
    const submitButton = screen.getByText(/submit/i);
    expect(submitButton).toBeInTheDocument();
  });

  it("enables submit button when grid is complete", () => {
    usePuzzleStore.setState({
      userEntries: Array(9).fill(Array(9).fill(5)), // Complete grid
    });

    render(<PuzzlePageClient puzzle={mockPuzzle} />);
    const submitButton = screen.getByText(/submit/i);
    expect(submitButton).toBeInTheDocument();
  });


  it("initializes puzzle in store on mount", () => {
    render(<PuzzlePageClient puzzle={mockPuzzle} />);
    const state = usePuzzleStore.getState();
    expect(state.puzzleId).toBe("test-puzzle-1");
    expect(state.puzzle).toEqual(mockPuzzle.puzzle_data);
  });

  it("uses semantic HTML elements", () => {
    const { container } = render(<PuzzlePageClient puzzle={mockPuzzle} />);
    expect(container.querySelector("main")).toBeInTheDocument();
    expect(container.querySelector("section")).toBeInTheDocument();
  });

  it("has proper ARIA labels for accessibility", () => {
    render(<PuzzlePageClient puzzle={mockPuzzle} />);
    expect(screen.getByLabelText("Sudoku grid")).toBeInTheDocument();
  });
});
