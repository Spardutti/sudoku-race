import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CompletionModal } from "../CompletionModal";
import { getHypotheticalRank } from "@/actions/leaderboard";

jest.mock("@/actions/leaderboard");
jest.mock("@/components/auth/AuthButtons", () => ({
  AuthButtons: () => <div data-testid="auth-buttons">Mock Auth Buttons</div>,
}));

const mockGetHypotheticalRank = getHypotheticalRank as jest.MockedFunction<
  typeof getHypotheticalRank
>;

describe("CompletionModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Authenticated User", () => {
    it("should display rank for authenticated users", () => {
      render(
        <CompletionModal
          isOpen={true}
          completionTime={180}
          puzzleId="puzzle-123"
          rank={42}
          isAuthenticated={true}
          onClose={jest.fn()}
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
          puzzleId="puzzle-123"
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
          puzzleId="puzzle-123"
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

      expect(mockGetHypotheticalRank).toHaveBeenCalledWith("puzzle-123", 300);
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
          puzzleId="puzzle-123"
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
          puzzleId="puzzle-123"
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
          puzzleId="puzzle-123"
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
          puzzleId="puzzle-123"
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
          puzzleId="puzzle-123"
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
          puzzleId="puzzle-123"
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
          puzzleId="puzzle-123"
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
          puzzleId="puzzle-123"
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
          puzzleId="puzzle-123"
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
          puzzleId="puzzle-123"
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
          puzzleId="puzzle-123"
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
          puzzleId="puzzle-123"
          rank={1}
          isAuthenticated={true}
          onClose={jest.fn()}
        />
      );

      expect(screen.getByText("02:03")).toBeInTheDocument();
    });
  });
});
