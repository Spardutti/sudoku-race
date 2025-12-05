import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PauseButton } from "../PauseButton";

describe("PauseButton", () => {
  it("renders pause button", () => {
    render(<PauseButton onPause={jest.fn()} />);

    const button = screen.getByRole("button", { name: /pause/i });
    expect(button).toBeInTheDocument();
  });

  it("displays pause icon", () => {
    render(<PauseButton onPause={jest.fn()} />);

    const button = screen.getByRole("button");
    const icon = button.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("calls onPause when clicked", async () => {
    const onPause = jest.fn();
    const user = userEvent.setup();

    render(<PauseButton onPause={onPause} />);

    const button = screen.getByRole("button", { name: /pause/i });
    await user.click(button);

    expect(onPause).toHaveBeenCalledTimes(1);
  });

  it("has ARIA label for accessibility", () => {
    render(<PauseButton onPause={jest.fn()} />);

    const button = screen.getByLabelText("Pause puzzle");
    expect(button).toBeInTheDocument();
  });

  it("is keyboard accessible", async () => {
    const onPause = jest.fn();
    const user = userEvent.setup();

    render(<PauseButton onPause={onPause} />);

    const button = screen.getByRole("button");
    button.focus();
    await user.keyboard("{Enter}");

    expect(onPause).toHaveBeenCalled();
  });

  it("respects disabled prop", async () => {
    const onPause = jest.fn();
    const user = userEvent.setup();

    render(<PauseButton onPause={onPause} disabled={true} />);

    const button = screen.getByRole("button", { name: /pause/i });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(onPause).not.toHaveBeenCalled();
  });

  it("can be enabled after being disabled", () => {
    const { rerender } = render(<PauseButton onPause={jest.fn()} disabled={true} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();

    rerender(<PauseButton onPause={jest.fn()} disabled={false} />);
    expect(button).not.toBeDisabled();
  });
});
