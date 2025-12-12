import { render, screen } from "@testing-library/react";
import { CalendarCell } from "../CalendarCell";

describe("CalendarCell", () => {
  const mockDate = new Date(Date.UTC(2025, 11, 15));

  it("should render day number", () => {
    render(
      <CalendarCell
        date={mockDate}
        hasEasy={false}
        hasMedium={false}
        easyTime={null}
        mediumTime={null}
        isToday={false}
      />
    );

    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("should render empty cell when date is null", () => {
    const { container } = render(
      <CalendarCell
        date={null}
        hasEasy={false}
        hasMedium={false}
        easyTime={null}
        mediumTime={null}
        isToday={false}
      />
    );

    const emptyCell = container.querySelector("div");
    expect(emptyCell).toHaveClass("w-12", "h-12", "mobile:w-10", "mobile:h-10");
    expect(emptyCell?.textContent).toBe("");
  });

  it("should show green indicator when only easy completed", () => {
    const { container } = render(
      <CalendarCell date={mockDate} hasEasy={true} hasMedium={false} easyTime={120} mediumTime={null} isToday={false} />
    );

    expect(screen.getByText("🟢")).toBeInTheDocument();
    const cell = container.querySelector('[role="gridcell"]');
    expect(cell).toHaveClass("bg-green-100");
  });

  it("should show blue indicator when only medium completed", () => {
    const { container } = render(
      <CalendarCell date={mockDate} hasEasy={false} hasMedium={true} easyTime={null} mediumTime={180} isToday={false} />
    );

    expect(screen.getByText("🔵")).toBeInTheDocument();
    const cell = container.querySelector('[role="gridcell"]');
    expect(cell).toHaveClass("bg-blue-100");
  });

  it("should show both indicators when perfect day", () => {
    const { container } = render(
      <CalendarCell date={mockDate} hasEasy={true} hasMedium={true} easyTime={120} mediumTime={180} isToday={false} />
    );

    expect(screen.getByText("🟢")).toBeInTheDocument();
    expect(screen.getByText("🔵")).toBeInTheDocument();
    const cell = container.querySelector('[role="gridcell"]');
    expect(cell).toHaveClass("bg-purple-100");
  });

  it("should apply gray background when not completed", () => {
    const { container } = render(
      <CalendarCell date={mockDate} hasEasy={false} hasMedium={false} easyTime={null} mediumTime={null} isToday={false} />
    );

    const cell = container.querySelector('[role="gridcell"]');
    expect(cell).toHaveClass("bg-gray-50");
  });

  it("should not show indicators when not completed", () => {
    render(
      <CalendarCell date={mockDate} hasEasy={false} hasMedium={false} easyTime={null} mediumTime={null} isToday={false} />
    );

    expect(screen.queryByText("🟢")).not.toBeInTheDocument();
    expect(screen.queryByText("🔵")).not.toBeInTheDocument();
  });

  it("should apply border when today", () => {
    const { container } = render(
      <CalendarCell date={mockDate} hasEasy={false} hasMedium={false} easyTime={null} mediumTime={null} isToday={true} />
    );

    const cell = container.querySelector('[role="gridcell"]');
    expect(cell).toHaveClass("border-2", "border-black");
  });

  it("should show tooltip with easy time", () => {
    const { container } = render(
      <CalendarCell date={mockDate} hasEasy={true} hasMedium={false} easyTime={185} mediumTime={null} isToday={false} />
    );

    const cell = container.querySelector('[role="gridcell"]');
    expect(cell).toHaveAttribute("title", "Easy: 3:05");
  });

  it("should show tooltip with medium time", () => {
    const { container } = render(
      <CalendarCell date={mockDate} hasEasy={false} hasMedium={true} easyTime={null} mediumTime={240} isToday={false} />
    );

    const cell = container.querySelector('[role="gridcell"]');
    expect(cell).toHaveAttribute("title", "Medium: 4:00");
  });

  it("should show tooltip with both times and perfect day message", () => {
    const { container } = render(
      <CalendarCell date={mockDate} hasEasy={true} hasMedium={true} easyTime={120} mediumTime={180} isToday={false} />
    );

    const cell = container.querySelector('[role="gridcell"]');
    expect(cell).toHaveAttribute("title", "Easy: 2:00 | Medium: 3:00 | Perfect Day! 🎉");
  });

  it("should not set title when not completed", () => {
    const { container } = render(
      <CalendarCell date={mockDate} hasEasy={false} hasMedium={false} easyTime={null} mediumTime={null} isToday={false} />
    );

    const cell = container.querySelector('[role="gridcell"]');
    expect(cell).not.toHaveAttribute("title");
  });

  it("should have responsive classes", () => {
    const { container } = render(
      <CalendarCell date={mockDate} hasEasy={false} hasMedium={false} easyTime={null} mediumTime={null} isToday={false} />
    );

    const cell = container.querySelector('[role="gridcell"]');
    expect(cell).toHaveClass("w-12", "h-12", "mobile:w-10", "mobile:h-10");
  });

  it("should have correct aria-label for perfect day and today", () => {
    const { container } = render(
      <CalendarCell date={mockDate} hasEasy={true} hasMedium={true} easyTime={120} mediumTime={180} isToday={true} />
    );

    const cell = container.querySelector('[role="gridcell"]');
    expect(cell).toHaveAttribute("aria-label", "15 completed today perfect day");
  });

  it("should have correct aria-label when not completed", () => {
    const { container } = render(
      <CalendarCell date={mockDate} hasEasy={false} hasMedium={false} easyTime={null} mediumTime={null} isToday={false} />
    );

    const cell = container.querySelector('[role="gridcell"]');
    expect(cell).toHaveAttribute("aria-label", "15");
  });
});
