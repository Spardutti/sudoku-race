import { render, screen } from "@testing-library/react";
import { CompletionCalendar } from "../CompletionCalendar";

jest.mock("../CalendarCell", () => ({
  CalendarCell: ({ date, isCompleted }: { date: Date | null; isCompleted: boolean }) => (
    <div data-testid="calendar-cell" data-completed={isCompleted}>
      {date ? date.getUTCDate() : "empty"}
    </div>
  ),
}));

describe("CompletionCalendar", () => {
  const mockTodayISO = "2025-12-04";

  it("should render empty state when no completions", () => {
    render(<CompletionCalendar completionMap={{}} todayISO={mockTodayISO} />);

    expect(screen.getByText("Start your daily puzzle habit!")).toBeInTheDocument();
  });

  it("should render header with completion history title", () => {
    const completionMap = { "2025-12-04": { time: 120, completed: true } };
    render(<CompletionCalendar completionMap={completionMap} todayISO={mockTodayISO} />);

    expect(screen.getByText("Completion History")).toBeInTheDocument();
  });

  it("should render month year header", () => {
    const completionMap = { "2025-12-04": { time: 120, completed: true } };
    render(<CompletionCalendar completionMap={completionMap} todayISO={mockTodayISO} />);

    expect(screen.getByText(/December/)).toBeInTheDocument();
    expect(screen.getByText(/2025/)).toBeInTheDocument();
  });

  it("should render weekday labels", () => {
    const completionMap = { "2025-12-04": { time: 120, completed: true } };
    render(<CompletionCalendar completionMap={completionMap} todayISO={mockTodayISO} />);

    expect(screen.getByText("Sun")).toBeInTheDocument();
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Tue")).toBeInTheDocument();
    expect(screen.getByText("Wed")).toBeInTheDocument();
    expect(screen.getByText("Thu")).toBeInTheDocument();
    expect(screen.getByText("Fri")).toBeInTheDocument();
    expect(screen.getByText("Sat")).toBeInTheDocument();
  });

  it("should render 30 day grid", () => {
    const completionMap = { "2025-12-04": { time: 120, completed: true } };
    render(<CompletionCalendar completionMap={completionMap} todayISO={mockTodayISO} />);

    const cells = screen.getAllByTestId("calendar-cell");
    const nonEmptyCells = cells.filter((cell) => cell.textContent !== "empty");
    expect(nonEmptyCells.length).toBe(30);
  });

  it("should mark completed days", () => {
    const completionMap = {
      "2025-12-04": { time: 120, completed: true },
      "2025-12-03": { time: 150, completed: true },
    };
    render(<CompletionCalendar completionMap={completionMap} todayISO={mockTodayISO} />);

    const cells = screen.getAllByTestId("calendar-cell");
    const completedCells = cells.filter((cell) => cell.dataset.completed === "true");
    expect(completedCells.length).toBeGreaterThanOrEqual(2);
  });

  it("should not show empty state when completions exist", () => {
    const completionMap = { "2025-12-04": { time: 120, completed: true } };
    render(<CompletionCalendar completionMap={completionMap} todayISO={mockTodayISO} />);

    expect(screen.queryByText("Start your daily puzzle habit!")).not.toBeInTheDocument();
  });

  it("should render with newspaper aesthetic card", () => {
    const completionMap = { "2025-12-04": { time: 120, completed: true } };
    const { container } = render(
      <CompletionCalendar completionMap={completionMap} todayISO={mockTodayISO} />
    );

    const card = container.querySelector(".border");
    expect(card).toHaveClass("border-gray-200", "bg-white", "p-6");
  });

  it("should have grid role for accessibility", () => {
    const completionMap = { "2025-12-04": { time: 120, completed: true } };
    render(<CompletionCalendar completionMap={completionMap} todayISO={mockTodayISO} />);

    const grid = screen.getByRole("grid");
    expect(grid).toHaveAttribute("aria-label", "Completion calendar");
  });

  it("should render multi-month header when crossing month boundary", () => {
    const completionMap = { "2025-12-01": { time: 120, completed: true } };
    render(<CompletionCalendar completionMap={completionMap} todayISO="2025-12-01" />);

    const header = screen.getByText(/November/);
    expect(header).toBeInTheDocument();
  });
});
