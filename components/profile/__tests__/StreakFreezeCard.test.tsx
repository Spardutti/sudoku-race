import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { StreakFreezeCard } from "../StreakFreezeCard";
import * as dateUtils from "@/lib/utils/date-utils";

jest.mock("@/lib/utils/date-utils");

const mockGetDaysDifference = dateUtils.getDaysDifference as jest.MockedFunction<
  typeof dateUtils.getDaysDifference
>;

describe("StreakFreezeCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show 'Available' status when freeze is available", () => {
    render(
      <StreakFreezeCard freezeAvailable={true} lastFreezeResetDate={null} />
    );

    expect(screen.getByText("Streak Freeze")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("✓ Available")).toBeInTheDocument();
    expect(screen.getByText(/If you miss a day, your freeze will automatically protect your streak/)).toBeInTheDocument();
  });

  it("should show 'Used' status when freeze is not available", () => {
    mockGetDaysDifference.mockReturnValue(3);

    render(
      <StreakFreezeCard
        freezeAvailable={false}
        lastFreezeResetDate="2025-01-01"
      />
    );

    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Used")).toBeInTheDocument();
    expect(screen.getByText(/Your freeze will be available again in a few days/)).toBeInTheDocument();
  });

  it("should show countdown when freeze is used", () => {
    mockGetDaysDifference.mockReturnValue(3);

    render(
      <StreakFreezeCard
        freezeAvailable={false}
        lastFreezeResetDate="2025-01-01"
      />
    );

    expect(screen.getByText("Resets in")).toBeInTheDocument();
    expect(screen.getByText("4 days")).toBeInTheDocument();
  });

  it("should calculate countdown correctly (7-day window)", () => {
    mockGetDaysDifference.mockReturnValue(5);

    render(
      <StreakFreezeCard
        freezeAvailable={false}
        lastFreezeResetDate="2025-01-01"
      />
    );

    expect(screen.getByText("2 days")).toBeInTheDocument();
  });

  it("should show 0 days when countdown reaches zero", () => {
    mockGetDaysDifference.mockReturnValue(7);

    render(
      <StreakFreezeCard
        freezeAvailable={false}
        lastFreezeResetDate="2025-01-01"
      />
    );

    expect(screen.getByText("0 days")).toBeInTheDocument();
  });

  it("should not show countdown when freeze is available", () => {
    render(
      <StreakFreezeCard freezeAvailable={true} lastFreezeResetDate={null} />
    );

    expect(screen.queryByText("Resets in")).not.toBeInTheDocument();
  });

  it("should apply correct styling for available freeze", () => {
    render(
      <StreakFreezeCard freezeAvailable={true} lastFreezeResetDate={null} />
    );

    const statusText = screen.getByText("✓ Available");
    expect(statusText).toHaveClass("text-green-600");
  });

  it("should apply correct styling for used freeze", () => {
    mockGetDaysDifference.mockReturnValue(3);

    render(
      <StreakFreezeCard
        freezeAvailable={false}
        lastFreezeResetDate="2025-01-01"
      />
    );

    const statusText = screen.getByText("Used");
    expect(statusText).toHaveClass("text-gray-500");
  });
});
