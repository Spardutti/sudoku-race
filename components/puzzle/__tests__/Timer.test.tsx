import { render, screen } from "@testing-library/react";
import { Timer } from "../Timer";

describe("Timer Component", () => {
  it("renders with 00:00 format for zero elapsed time", () => {
    render(<Timer elapsedTime={0} isCompleted={false} />);

    expect(screen.getByRole("timer")).toBeInTheDocument();
    expect(screen.getByText("00:00")).toBeInTheDocument();
  });

  it("formats single digit seconds correctly (01:05)", () => {
    render(<Timer elapsedTime={65} isCompleted={false} />);

    expect(screen.getByText("01:05")).toBeInTheDocument();
  });

  it("formats large times correctly (59:59)", () => {
    render(<Timer elapsedTime={3599} isCompleted={false} />);

    expect(screen.getByText("59:59")).toBeInTheDocument();
  });

  it("handles hours correctly (shows as large minutes)", () => {
    const twoHours = 7200; // 120:00
    render(<Timer elapsedTime={twoHours} isCompleted={false} />);

    expect(screen.getByText("120:00")).toBeInTheDocument();
  });

  it("shows completed indicator when puzzle is complete", () => {
    render(<Timer elapsedTime={300} isCompleted={true} />);

    expect(screen.getByText("05:00")).toBeInTheDocument();
    expect(screen.getByText("(completed)")).toBeInTheDocument();
  });

  it("does not show completed indicator when puzzle is not complete", () => {
    render(<Timer elapsedTime={300} isCompleted={false} />);

    expect(screen.queryByText("(completed)")).not.toBeInTheDocument();
  });

  it("has proper ARIA labels for accessibility", () => {
    render(<Timer elapsedTime={342} isCompleted={false} />);

    const timer = screen.getByRole("timer");
    expect(timer).toHaveAttribute("aria-label", "Elapsed time: 05:42");
    expect(timer).toHaveAttribute("aria-live", "polite");
  });

  it("uses semantic time element with proper datetime attribute", () => {
    render(<Timer elapsedTime={125} isCompleted={false} />);

    const timeElement = screen.getByText("02:05");
    expect(timeElement.tagName).toBe("TIME");
    expect(timeElement).toHaveAttribute("datetime", "PT125S");
  });

  it("renders timer icon", () => {
    const { container } = render(
      <Timer elapsedTime={0} isCompleted={false} />
    );

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });
});
