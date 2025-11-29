import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { LeaderboardError } from "../LeaderboardError";

jest.mock("next/navigation");

describe("LeaderboardError", () => {
  const mockRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      refresh: mockRefresh,
    });
  });

  it("renders error message", () => {
    render(<LeaderboardError error="Database connection failed" />);

    expect(screen.getByText("Unable to load leaderboard")).toBeInTheDocument();
    expect(screen.getByText("Database connection failed")).toBeInTheDocument();
  });

  it("calls router.refresh when retry button is clicked", async () => {
    const user = userEvent.setup();
    render(<LeaderboardError error="Network error" />);

    const retryButton = screen.getByRole("button", { name: /retry/i });
    await user.click(retryButton);

    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("renders ErrorState component with correct props", () => {
    render(<LeaderboardError error="Test error" />);

    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    expect(screen.getByText("Test error")).toBeInTheDocument();
  });
});
