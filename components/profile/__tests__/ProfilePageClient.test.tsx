import { render, screen } from "@testing-library/react";
import { ProfilePageClient } from "../ProfilePageClient";

jest.mock("../LogoutButton", () => ({
  LogoutButton: () => <button>Logout</button>,
}));

jest.mock("../DeleteAccountButton", () => ({
  DeleteAccountButton: () => <button>Delete Account</button>,
}));

jest.mock("../StreakFreezeCard", () => ({
  StreakFreezeCard: () => <div>Streak Freeze Card</div>,
}));

jest.mock("../StatItem", () => ({
  StatItem: ({ label, value }: { label: string; value: string | number }) => (
    <div data-testid="stat-item">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  ),
}));

describe("ProfilePageClient", () => {
  const mockUser = {
    id: "test-user-id",
    username: "testuser",
    email: "test@example.com",
    createdAt: "2025-01-15T10:00:00Z",
    oauthProvider: "google",
  };

  const mockStats = {
    totalPuzzlesSolved: 42,
    averageTime: 180,
    bestTime: 120,
  };

  const mockStreak = {
    currentStreak: 5,
    longestStreak: 10,
    lastCompletionDate: "2025-12-04",
    freezeAvailable: true,
    lastFreezeResetDate: null,
  };

  const mockCompletionMap = {};
  const mockTodayISO = "2025-12-04";

  it("should render user information correctly", () => {
    render(<ProfilePageClient user={mockUser} stats={mockStats} streak={mockStreak} completionMap={mockCompletionMap} todayISO={mockTodayISO} />);

    expect(screen.getByText("testuser")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("January 2025")).toBeInTheDocument();
    expect(screen.getByText(/Google/)).toBeInTheDocument();
  });

  it("should show empty state when totalPuzzlesSolved equals 0", () => {
    render(
      <ProfilePageClient
        user={mockUser}
        stats={{ totalPuzzlesSolved: 0, averageTime: null, bestTime: null }}
        streak={null}
        completionMap={mockCompletionMap}
        todayISO={mockTodayISO}
      />
    );

    expect(
      screen.getByText("Complete your first puzzle to see your stats!")
    ).toBeInTheDocument();
  });

  it("should render stats grid when user has completions", () => {
    render(<ProfilePageClient user={mockUser} stats={mockStats} streak={mockStreak} completionMap={mockCompletionMap} todayISO={mockTodayISO} />);

    const statItems = screen.getAllByTestId("stat-item");
    expect(statItems).toHaveLength(5);
  });

  it("should render all 5 stats correctly", () => {
    render(<ProfilePageClient user={mockUser} stats={mockStats} streak={mockStreak} completionMap={mockCompletionMap} todayISO={mockTodayISO} />);

    expect(screen.getByText("Total Puzzles Solved")).toBeInTheDocument();
    expect(screen.getByText("Current Streak")).toBeInTheDocument();
    expect(screen.getByText("Longest Streak")).toBeInTheDocument();
    expect(screen.getByText("Average Time")).toBeInTheDocument();
    expect(screen.getByText("Best Time")).toBeInTheDocument();
  });

  it("should apply grid layout classes", () => {
    const { container } = render(
      <ProfilePageClient user={mockUser} stats={mockStats} streak={mockStreak} completionMap={mockCompletionMap} todayISO={mockTodayISO} />
    );

    const grid = container.querySelector(".grid");
    expect(grid).toHaveClass("grid-cols-2", "gap-4", "md:grid-cols-3");
  });

  it("should format time values correctly", () => {
    render(<ProfilePageClient user={mockUser} stats={mockStats} streak={mockStreak} completionMap={mockCompletionMap} todayISO={mockTodayISO} />);

    expect(screen.getByText("03:00")).toBeInTheDocument();
    expect(screen.getByText("02:00")).toBeInTheDocument();
  });

  it("should handle null averageTime and bestTime", () => {
    const statsWithNullTimes = {
      totalPuzzlesSolved: 5,
      averageTime: null,
      bestTime: null,
    };

    render(
      <ProfilePageClient user={mockUser} stats={statsWithNullTimes} streak={mockStreak} completionMap={mockCompletionMap} todayISO={mockTodayISO} />
    );

    const emDashes = screen.getAllByText("—");
    expect(emDashes).toHaveLength(2);
  });

  it("should handle null streak data", () => {
    render(<ProfilePageClient user={mockUser} stats={mockStats} streak={null} completionMap={mockCompletionMap} todayISO={mockTodayISO} />);

    const statItems = screen.getAllByTestId("stat-item");
    const currentStreakItem = statItems.find(
      (item) => item.textContent?.includes("Current Streak")
    );
    expect(currentStreakItem).toHaveTextContent("0");

    const longestStreakItem = statItems.find(
      (item) => item.textContent?.includes("Longest Streak")
    );
    expect(longestStreakItem).toHaveTextContent("0");
  });

  it("should render logout and delete account buttons", () => {
    render(<ProfilePageClient user={mockUser} stats={mockStats} streak={mockStreak} completionMap={mockCompletionMap} todayISO={mockTodayISO} />);

    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.getByText("Delete Account")).toBeInTheDocument();
  });

  it("should format member since date correctly", () => {
    const userWithDifferentDate = {
      ...mockUser,
      createdAt: "2024-12-25T00:00:00Z",
    };

    render(
      <ProfilePageClient user={userWithDifferentDate} stats={mockStats} streak={mockStreak} completionMap={mockCompletionMap} todayISO={mockTodayISO} />
    );

    expect(screen.getByText("December 2024")).toBeInTheDocument();
  });

  it("should handle unknown OAuth provider gracefully", () => {
    const userWithUnknownProvider = {
      ...mockUser,
      oauthProvider: "unknown-provider",
    };

    render(
      <ProfilePageClient user={userWithUnknownProvider} stats={mockStats} streak={mockStreak} completionMap={mockCompletionMap} todayISO={mockTodayISO} />
    );

    expect(screen.getByText(/unknown-provider/)).toBeInTheDocument();
  });
});
