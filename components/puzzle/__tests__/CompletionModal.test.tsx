import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CompletionModal } from "../CompletionModal";
import { getHypotheticalRank } from "@/actions/leaderboard";
import { generateEmojiGrid } from "@/lib/utils/emoji-grid";

jest.mock("@/actions/leaderboard");
jest.mock("@/components/auth/AuthButtons", () => ({
  AuthButtons: () => <div data-testid="auth-buttons">Mock Auth Buttons</div>,
}));
jest.mock("@/lib/utils/emoji-grid");

const mockGetHypotheticalRank = getHypotheticalRank as jest.MockedFunction<
  typeof getHypotheticalRank
>;
const mockGenerateEmojiGrid = generateEmojiGrid as jest.MockedFunction<typeof generateEmojiGrid>;

const mockPuzzle = [
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

const mockSolvePath = [
  { row: 0, col: 2, value: 4, timestamp: 1000, isCorrection: false },
  { row: 0, col: 3, value: 6, timestamp: 2000, isCorrection: false },
];

describe("CompletionModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateEmojiGrid.mockReturnValue("🟩🟩⬜\n⬜🟩🟩\n🟩⬜🟩");
  });

  describe("Authenticated User", () => {
    it("should display rank for authenticated users", () => {
      render(
        <CompletionModal
          isOpen={true}
          completionTime={180}
          puzzleId="2025-01-05"
          rank={42}
          isAuthenticated={true}
          onClose={jest.fn()}
          puzzle={mockPuzzle}
          solvePath={mockSolvePath}
          puzzleNumber={5}
        />
      );

      expect(screen.getByText("Congratulations!")).toBeInTheDocument();
      expect(screen.getByText("03:00")).toBeInTheDocument();
      expect(screen.getByText("Your rank:")).toBeInTheDocument();
      expect(screen.getByText("#42")).toBeInTheDocument();
    });

    it("should not fetch hypothetical rank for authenticated users", () => {
      render(
        <CompletionModal
          isOpen={true}
          completionTime={180}
          puzzleId="2025-01-05" puzzle={mockPuzzle} solvePath={mockSolvePath} puzzleNumber={5}
          rank={10}
          isAuthenticated={true}
          onClose={jest.fn()}
        />
      );

      expect(mockGetHypotheticalRank).not.toHaveBeenCalled();
    });
  });

  describe("Guest User", () => {
    it("should fetch and display hypothetical rank for guests", async () => {
      mockGetHypotheticalRank.mockResolvedValue({
        success: true,
        data: 347,
      });

      render(
        <CompletionModal
          isOpen={true}
          completionTime={300}
          puzzleId="2025-01-05" puzzle={mockPuzzle} solvePath={mockSolvePath} puzzleNumber={5}
          isAuthenticated={false}
          onClose={jest.fn()}
        />
      );

      expect(screen.getByText("Calculating your rank...")).toBeInTheDocument();

      await waitFor(() => {
        expect(
          screen.getByText(
            /Nice time! You'd be #347! Sign in to claim your rank on the leaderboard\./
          )
        ).toBeInTheDocument();
      });

      expect(mockGetHypotheticalRank).toHaveBeenCalledWith("2025-01-05", 300);
    });

    it("should display Sign In button for guests", async () => {
      mockGetHypotheticalRank.mockResolvedValue({
        success: true,
        data: 100,
      });

      render(
        <CompletionModal
          isOpen={true}
          completionTime={250}
          puzzleId="2025-01-05" puzzle={mockPuzzle} solvePath={mockSolvePath} puzzleNumber={5}
          isAuthenticated={false}
          onClose={jest.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("Sign In")).toBeInTheDocument();
      });

      expect(screen.getByText("Maybe Later")).toBeInTheDocument();
    });

    it("should display limitations messaging for guests", async () => {
      mockGetHypotheticalRank.mockResolvedValue({
        success: true,
        data: 50,
      });

      render(
        <CompletionModal
          isOpen={true}
          completionTime={200}
          puzzleId="2025-01-05" puzzle={mockPuzzle} solvePath={mockSolvePath} puzzleNumber={5}
          isAuthenticated={false}
          onClose={jest.fn()}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByText(/Without signing in: No leaderboard rank/)
        ).toBeInTheDocument();
      });

      expect(screen.getByText(/No streaks/)).toBeInTheDocument();
      expect(screen.getByText(/No stats/)).toBeInTheDocument();
    });

    it("should handle rank fetch failure gracefully", async () => {
      mockGetHypotheticalRank.mockResolvedValue({
        success: false,
        error: "Failed to calculate rank",
      });

      render(
        <CompletionModal
          isOpen={true}
          completionTime={300}
          puzzleId="2025-01-05" puzzle={mockPuzzle} solvePath={mockSolvePath} puzzleNumber={5}
          isAuthenticated={false}
          onClose={jest.fn()}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByText(/Sign in to claim your rank on the leaderboard!/)
        ).toBeInTheDocument();
      });
    });

    it("should not fetch rank when modal is closed", () => {
      render(
        <CompletionModal
          isOpen={false}
          completionTime={300}
          puzzleId="2025-01-05" puzzle={mockPuzzle} solvePath={mockSolvePath} puzzleNumber={5}
          isAuthenticated={false}
          onClose={jest.fn()}
        />
      );

      expect(mockGetHypotheticalRank).not.toHaveBeenCalled();
    });
  });

  describe("Auth Button Integration", () => {
    it("should show 'Sign In' button by default for guests", async () => {
      mockGetHypotheticalRank.mockResolvedValue({
        success: true,
        data: 25,
      });

      render(
        <CompletionModal
          isOpen={true}
          completionTime={200}
          puzzleId="2025-01-05" puzzle={mockPuzzle} solvePath={mockSolvePath} puzzleNumber={5}
          isAuthenticated={false}
          onClose={jest.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
      });

      expect(screen.queryByTestId("auth-buttons")).not.toBeInTheDocument();
    });

    it("should display AuthButtons component when Sign In clicked", async () => {
      mockGetHypotheticalRank.mockResolvedValue({
        success: true,
        data: 30,
      });

      render(
        <CompletionModal
          isOpen={true}
          completionTime={250}
          puzzleId="2025-01-05" puzzle={mockPuzzle} solvePath={mockSolvePath} puzzleNumber={5}
          isAuthenticated={false}
          onClose={jest.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
      });

      const signInButton = screen.getByRole("button", { name: /sign in/i });
      fireEvent.click(signInButton);

      expect(screen.getByTestId("auth-buttons")).toBeInTheDocument();
    });

    it("should show 'Back' button when AuthButtons displayed", async () => {
      mockGetHypotheticalRank.mockResolvedValue({
        success: true,
        data: 35,
      });

      render(
        <CompletionModal
          isOpen={true}
          completionTime={275}
          puzzleId="2025-01-05" puzzle={mockPuzzle} solvePath={mockSolvePath} puzzleNumber={5}
          isAuthenticated={false}
          onClose={jest.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
      });

      const signInButton = screen.getByRole("button", { name: /sign in/i });
      fireEvent.click(signInButton);

      expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
    });

    it("should hide AuthButtons when 'Back' clicked", async () => {
      mockGetHypotheticalRank.mockResolvedValue({
        success: true,
        data: 40,
      });

      render(
        <CompletionModal
          isOpen={true}
          completionTime={280}
          puzzleId="2025-01-05" puzzle={mockPuzzle} solvePath={mockSolvePath} puzzleNumber={5}
          isAuthenticated={false}
          onClose={jest.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
      });

      // Show auth buttons
      const signInButton = screen.getByRole("button", { name: /sign in/i });
      fireEvent.click(signInButton);
      expect(screen.getByTestId("auth-buttons")).toBeInTheDocument();

      // Hide auth buttons
      const backButton = screen.getByRole("button", { name: /back/i });
      fireEvent.click(backButton);

      expect(screen.queryByTestId("auth-buttons")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    });

    it("should call onClose when 'Maybe Later' clicked", async () => {
      mockGetHypotheticalRank.mockResolvedValue({
        success: true,
        data: 45,
      });

      const onClose = jest.fn();
      render(
        <CompletionModal
          isOpen={true}
          completionTime={300}
          puzzleId="2025-01-05" puzzle={mockPuzzle} solvePath={mockSolvePath} puzzleNumber={5}
          isAuthenticated={false}
          onClose={onClose}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /maybe later/i })).toBeInTheDocument();
      });

      const maybeLaterButton = screen.getByRole("button", { name: /maybe later/i });
      fireEvent.click(maybeLaterButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should not show auth buttons for authenticated users", () => {
      render(
        <CompletionModal
          isOpen={true}
          completionTime={200}
          puzzleId="2025-01-05" puzzle={mockPuzzle} solvePath={mockSolvePath} puzzleNumber={5}
          rank={10}
          isAuthenticated={true}
          onClose={jest.fn()}
        />
      );

      expect(screen.queryByRole("button", { name: /sign in/i })).not.toBeInTheDocument();
      expect(screen.queryByTestId("auth-buttons")).not.toBeInTheDocument();
    });
  });

  describe("Time Formatting", () => {
    it("should format time correctly (MM:SS)", () => {
      render(
        <CompletionModal
          isOpen={true}
          completionTime={185}
          puzzleId="2025-01-05" puzzle={mockPuzzle} solvePath={mockSolvePath} puzzleNumber={5}
          rank={1}
          isAuthenticated={true}
          onClose={jest.fn()}
        />
      );

      expect(screen.getByText("03:05")).toBeInTheDocument();
    });

    it("should pad single-digit seconds with leading zero", () => {
      render(
        <CompletionModal
          isOpen={true}
          completionTime={123}
          puzzleId="2025-01-05" puzzle={mockPuzzle} solvePath={mockSolvePath} puzzleNumber={5}
          rank={1}
          isAuthenticated={true}
          onClose={jest.fn()}
        />
      );

      expect(screen.getByText("02:03")).toBeInTheDocument();
    });
  });

  describe("Emoji Grid and Share Functionality", () => {
    it("should generate and display emoji grid on modal open", async () => {
      render(
        <CompletionModal
          isOpen={true}
          completionTime={180}
          puzzleId="2025-01-05"
          rank={42}
          isAuthenticated={true}
          onClose={jest.fn()}
          puzzle={mockPuzzle}
          solvePath={mockSolvePath}
          puzzleNumber={5}
        />
      );

      await waitFor(() => {
        expect(mockGenerateEmojiGrid).toHaveBeenCalledWith(mockPuzzle, mockSolvePath);
      });

      expect(screen.getByText("Preview share text:")).toBeInTheDocument();
      const emojiElements = screen.getAllByText(/🟩/);
      expect(emojiElements.length).toBeGreaterThan(0);
    });

    it("should display share text preview", async () => {
      render(
        <CompletionModal
          isOpen={true}
          completionTime={754}
          puzzleId="2025-01-05"
          rank={23}
          isAuthenticated={true}
          onClose={jest.fn()}
          puzzle={mockPuzzle}
          solvePath={mockSolvePath}
          puzzleNumber={5}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("Preview share text:")).toBeInTheDocument();
      });

      const shareTextElement = screen.getByText(/Sudoku Race #5/);
      expect(shareTextElement).toBeInTheDocument();
      expect(shareTextElement.textContent).toContain("⏱️ 12:34");
    });

    it("should display share buttons", async () => {
      render(
        <CompletionModal
          isOpen={true}
          completionTime={180}
          puzzleId="2025-01-05"
          rank={42}
          isAuthenticated={true}
          onClose={jest.fn()}
          puzzle={mockPuzzle}
          solvePath={mockSolvePath}
          puzzleNumber={5}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Share puzzle results on Twitter/i })).toBeInTheDocument();
      });

      expect(screen.getByRole("button", { name: /Share puzzle results via WhatsApp/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Copy puzzle results to clipboard/i })).toBeInTheDocument();
    });

    it("should handle copy to clipboard", async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      });

      render(
        <CompletionModal
          isOpen={true}
          completionTime={180}
          puzzleId="2025-01-05"
          rank={42}
          isAuthenticated={true}
          onClose={jest.fn()}
          puzzle={mockPuzzle}
          solvePath={mockSolvePath}
          puzzleNumber={5}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Copy puzzle results to clipboard/i })).toBeInTheDocument();
      });

      const copyButton = screen.getByRole("button", { name: /Copy puzzle results to clipboard/i });
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText("Copied!")).toBeInTheDocument();
      });
    });

    it("should handle emoji grid generation error gracefully", async () => {
      mockGenerateEmojiGrid.mockImplementation(() => {
        throw new Error("Grid generation failed");
      });

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      render(
        <CompletionModal
          isOpen={true}
          completionTime={180}
          puzzleId="2025-01-05"
          rank={42}
          isAuthenticated={true}
          onClose={jest.fn()}
          puzzle={mockPuzzle}
          solvePath={mockSolvePath}
          puzzleNumber={5}
        />
      );

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "[CompletionModal] Failed to generate emoji grid:",
          expect.any(Error)
        );
      });

      expect(screen.queryByText("Your solving journey:")).not.toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Streak Freeze Indicator", () => {
    it("should show freeze protection indicator when freeze is available", () => {
      render(
        <CompletionModal
          isOpen={true}
          completionTime={180}
          puzzleId="2025-01-05"
          rank={42}
          isAuthenticated={true}
          onClose={jest.fn()}
          puzzle={mockPuzzle}
          solvePath={mockSolvePath}
          puzzleNumber={5}
          streakData={{
            currentStreak: 5,
            longestStreak: 10,
            lastCompletionDate: "2025-01-05",
            freezeAvailable: true,
            lastFreezeResetDate: null,
            freezeWasUsed: false,
            streakWasReset: false,
          }}
        />
      );

      expect(screen.getByText("(Freeze protection: Active ✓)")).toBeInTheDocument();
    });

    it("should not show freeze protection indicator when freeze is not available", () => {
      render(
        <CompletionModal
          isOpen={true}
          completionTime={180}
          puzzleId="2025-01-05"
          rank={42}
          isAuthenticated={true}
          onClose={jest.fn()}
          puzzle={mockPuzzle}
          solvePath={mockSolvePath}
          puzzleNumber={5}
          streakData={{
            currentStreak: 5,
            longestStreak: 10,
            lastCompletionDate: "2025-01-05",
            freezeAvailable: false,
            lastFreezeResetDate: "2025-01-05",
            freezeWasUsed: false,
            streakWasReset: false,
          }}
        />
      );

      expect(screen.queryByText("(Freeze protection: Active ✓)")).not.toBeInTheDocument();
    });

    it("should not show freeze protection indicator when streakData is undefined", () => {
      render(
        <CompletionModal
          isOpen={true}
          completionTime={180}
          puzzleId="2025-01-05"
          rank={42}
          isAuthenticated={true}
          onClose={jest.fn()}
          puzzle={mockPuzzle}
          solvePath={mockSolvePath}
          puzzleNumber={5}
        />
      );

      expect(screen.queryByText("(Freeze protection: Active ✓)")).not.toBeInTheDocument();
    });
  });
});
