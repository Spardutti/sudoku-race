import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorState } from "../ErrorState";

describe("ErrorState", () => {
  it("renders error message", () => {
    render(<ErrorState error="Test error" onRetry={() => {}} />);

    expect(screen.getByText(/Unable to load leaderboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Test error/i)).toBeInTheDocument();
  });

  it("displays retry button", () => {
    render(<ErrorState error="Test error" onRetry={() => {}} />);

    const button = screen.getByRole("button", { name: /Retry/i });
    expect(button).toBeInTheDocument();
  });

  it("calls onRetry when retry button clicked", () => {
    const onRetry = jest.fn();
    render(<ErrorState error="Test error" onRetry={onRetry} />);

    const button = screen.getByRole("button", { name: /Retry/i });
    fireEvent.click(button);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows default message when error is empty", () => {
    render(<ErrorState error="" onRetry={() => {}} />);

    expect(screen.getByText(/Please try again later/i)).toBeInTheDocument();
  });
});
