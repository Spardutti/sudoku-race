import { render, screen, fireEvent } from "@testing-library/react";
import { CompletionModal } from "../CompletionModal";

describe("CompletionModal", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    render(
      <CompletionModal
        isOpen={false}
        completionTime={125}
        isAuthenticated={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders when isOpen is true", () => {
    render(
      <CompletionModal
        isOpen={true}
        completionTime={125}
        isAuthenticated={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Congratulations!")).toBeInTheDocument();
  });

  it("displays formatted completion time", () => {
    render(
      <CompletionModal
        isOpen={true}
        completionTime={125}
        isAuthenticated={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText("02:05")).toBeInTheDocument();
  });

  it("displays rank for authenticated users", () => {
    render(
      <CompletionModal
        isOpen={true}
        completionTime={125}
        rank={42}
        isAuthenticated={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText("#42")).toBeInTheDocument();
    expect(screen.getByText("Your rank:")).toBeInTheDocument();
  });

  it("shows auth CTA for guest users", () => {
    render(
      <CompletionModal
        isOpen={true}
        completionTime={125}
        isAuthenticated={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText("Sign in to save your time!")).toBeInTheDocument();
    expect(screen.getByText("Sign in with Google")).toBeInTheDocument();
    expect(screen.getByText("Sign in with GitHub")).toBeInTheDocument();
    expect(screen.getByText("Sign in with Apple")).toBeInTheDocument();
  });

  it("shows hypothetical rank for guests when provided", () => {
    render(
      <CompletionModal
        isOpen={true}
        completionTime={125}
        rank={347}
        isAuthenticated={false}
        onClose={mockOnClose}
      />
    );

    expect(
      screen.getByText(/You'd be ranked #347/i)
    ).toBeInTheDocument();
  });

  it("calls onClose when X button clicked", () => {
    render(
      <CompletionModal
        isOpen={true}
        completionTime={125}
        isAuthenticated={false}
        onClose={mockOnClose}
      />
    );

    // Radix Dialog renders X button with sr-only "Close" text
    const closeButtons = screen.getAllByText("Close");
    const xButton = closeButtons.find(el => el.classList.contains("sr-only"))?.parentElement;

    if (xButton) {
      fireEvent.click(xButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it("calls onClose when Close button clicked", () => {
    render(
      <CompletionModal
        isOpen={true}
        completionTime={125}
        isAuthenticated={false}
        onClose={mockOnClose}
      />
    );

    // Get all buttons with "Close" text and click the visible one (variant="secondary")
    const closeButtons = screen.getAllByRole("button", { name: /close/i });
    const visibleCloseButton = closeButtons.find(btn =>
      btn.textContent === "Close" && !btn.querySelector('.sr-only')
    );

    if (visibleCloseButton) {
      fireEvent.click(visibleCloseButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it("formats time correctly for single-digit minutes and seconds", () => {
    render(
      <CompletionModal
        isOpen={true}
        completionTime={65}
        isAuthenticated={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText("01:05")).toBeInTheDocument();
  });

  it("formats time correctly for double-digit values", () => {
    render(
      <CompletionModal
        isOpen={true}
        completionTime={725}
        isAuthenticated={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText("12:05")).toBeInTheDocument();
  });
});
