import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StartScreen } from "../StartScreen";

describe("StartScreen", () => {
  it("renders welcome message with puzzle number", () => {
    render(<StartScreen puzzleNumber={42} onStart={jest.fn()} />);

    expect(screen.getByText(/Daily Sudoku #42/i)).toBeInTheDocument();
  });

  it("displays instructions", () => {
    render(<StartScreen puzzleNumber={1} onStart={jest.fn()} />);

    expect(screen.getByText(/Press Start when you're ready/i)).toBeInTheDocument();
    expect(screen.getByText(/timer will start immediately/i)).toBeInTheDocument();
  });

  it("renders Start button", () => {
    render(<StartScreen puzzleNumber={1} onStart={jest.fn()} />);

    const button = screen.getByRole("button", { name: /start puzzle/i });
    expect(button).toBeInTheDocument();
  });

  it("calls onStart when Start button is clicked", async () => {
    const onStart = jest.fn();
    const user = userEvent.setup();

    render(<StartScreen puzzleNumber={1} onStart={onStart} />);

    const button = screen.getByRole("button", { name: /start puzzle/i });
    await user.click(button);

    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("has ARIA label for accessibility", () => {
    render(<StartScreen puzzleNumber={1} onStart={jest.fn()} />);

    const button = screen.getByLabelText("Start puzzle timer");
    expect(button).toBeInTheDocument();
  });
});
