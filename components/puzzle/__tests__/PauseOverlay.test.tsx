import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PauseOverlay } from "../PauseOverlay";

describe("PauseOverlay", () => {
  it("renders paused message", () => {
    render(<PauseOverlay onResume={jest.fn()} />);

    expect(screen.getByText("Paused")).toBeInTheDocument();
  });

  it("displays instructions", () => {
    render(<PauseOverlay onResume={jest.fn()} />);

    expect(screen.getByText(/timer is paused/i)).toBeInTheDocument();
    expect(screen.getByText(/Click Resume to continue/i)).toBeInTheDocument();
  });

  it("renders Resume button", () => {
    render(<PauseOverlay onResume={jest.fn()} />);

    const button = screen.getByRole("button", { name: /resume/i });
    expect(button).toBeInTheDocument();
  });

  it("calls onResume when Resume button is clicked", async () => {
    const onResume = jest.fn();
    const user = userEvent.setup();

    render(<PauseOverlay onResume={onResume} />);

    const button = screen.getByRole("button", { name: /resume/i });
    await user.click(button);

    expect(onResume).toHaveBeenCalledTimes(1);
  });

  it("has ARIA label for accessibility", () => {
    render(<PauseOverlay onResume={jest.fn()} />);

    const button = screen.getByLabelText("Resume puzzle");
    expect(button).toBeInTheDocument();
  });

  it("respects disabled prop", async () => {
    const onResume = jest.fn();
    const user = userEvent.setup();

    render(<PauseOverlay onResume={onResume} disabled={true} />);

    const button = screen.getByRole("button", { name: /resume/i });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(onResume).not.toHaveBeenCalled();
  });

  it("can be enabled after being disabled", () => {
    const { rerender } = render(<PauseOverlay onResume={jest.fn()} disabled={true} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();

    rerender(<PauseOverlay onResume={jest.fn()} disabled={false} />);
    expect(button).not.toBeDisabled();
  });
});
