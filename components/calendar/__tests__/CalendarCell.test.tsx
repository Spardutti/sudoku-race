import { render, screen } from "@testing-library/react";
import { CalendarCell } from "../CalendarCell";

describe("CalendarCell", () => {
  const mockDate = new Date(Date.UTC(2025, 11, 15));

  it("should render day number", () => {
    render(
      <CalendarCell
        date={mockDate}
        isCompleted={false}
        completionTime={null}
        isToday={false}
      />
    );

    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("should render empty cell when date is null", () => {
    const { container } = render(
      <CalendarCell
        date={null}
        isCompleted={false}
        completionTime={null}
        isToday={false}
      />
    );

    const emptyCell = container.querySelector("div");
    expect(emptyCell).toHaveClass("w-12", "h-12", "mobile:w-10", "mobile:h-10");
    expect(emptyCell?.textContent).toBe("");
  });

  it("should apply green background when completed", () => {
    const { container } = render(
      <CalendarCell date={mockDate} isCompleted={true} completionTime={120} isToday={false} />
    );

    const cell = container.querySelector('[role="gridcell"]');
    expect(cell).toHaveClass("bg-green-100");
  });

  it("should apply gray background when not completed", () => {
    const { container } = render(
      <CalendarCell date={mockDate} isCompleted={false} completionTime={null} isToday={false} />
    );

    const cell = container.querySelector('[role="gridcell"]');
    expect(cell).toHaveClass("bg-gray-50");
  });

  it("should show checkmark when completed", () => {
    render(
      <CalendarCell date={mockDate} isCompleted={true} completionTime={120} isToday={false} />
    );

    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("should not show checkmark when not completed", () => {
    render(
      <CalendarCell date={mockDate} isCompleted={false} completionTime={null} isToday={false} />
    );

    expect(screen.queryByText("✓")).not.toBeInTheDocument();
  });

  it("should apply border when today", () => {
    const { container } = render(
      <CalendarCell date={mockDate} isCompleted={false} completionTime={null} isToday={true} />
    );

    const cell = container.querySelector('[role="gridcell"]');
    expect(cell).toHaveClass("border-2", "border-black");
  });

  it("should not apply special border when not today", () => {
    const { container } = render(
      <CalendarCell date={mockDate} isCompleted={false} completionTime={null} isToday={false} />
    );

    const cell = container.querySelector('[role="gridcell"]');
    expect(cell).not.toHaveClass("border-2", "border-black");
  });

  it("should set title with formatted time when completed", () => {
    const { container } = render(
      <CalendarCell date={mockDate} isCompleted={true} completionTime={185} isToday={false} />
    );

    const cell = container.querySelector('[role="gridcell"]');
    expect(cell).toHaveAttribute("title", "03:05");
  });

  it("should not set title when not completed", () => {
    const { container } = render(
      <CalendarCell date={mockDate} isCompleted={false} completionTime={null} isToday={false} />
    );

    const cell = container.querySelector('[role="gridcell"]');
    expect(cell).not.toHaveAttribute("title");
  });

  it("should have responsive classes", () => {
    const { container } = render(
      <CalendarCell date={mockDate} isCompleted={false} completionTime={null} isToday={false} />
    );

    const cell = container.querySelector('[role="gridcell"]');
    expect(cell).toHaveClass("w-12", "h-12", "mobile:w-10", "mobile:h-10");
  });

  it("should have correct aria-label when completed and today", () => {
    const { container } = render(
      <CalendarCell date={mockDate} isCompleted={true} completionTime={120} isToday={true} />
    );

    const cell = container.querySelector('[role="gridcell"]');
    expect(cell).toHaveAttribute("aria-label", "15 completed today");
  });

  it("should have correct aria-label when not completed", () => {
    const { container } = render(
      <CalendarCell date={mockDate} isCompleted={false} completionTime={null} isToday={false} />
    );

    const cell = container.querySelector('[role="gridcell"]');
    expect(cell).toHaveAttribute("aria-label", "15");
  });

  it("should render with all states: completed and today", () => {
    const { container } = render(
      <CalendarCell date={mockDate} isCompleted={true} completionTime={240} isToday={true} />
    );

    const cell = container.querySelector('[role="gridcell"]');
    expect(cell).toHaveClass("bg-green-100", "border-2", "border-black");
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("✓")).toBeInTheDocument();
    expect(cell).toHaveAttribute("title", "04:00");
  });
});
