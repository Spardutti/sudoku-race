import { render, screen } from "@testing-library/react";
import { ProfilePageClient } from "../ProfilePageClient";

jest.mock("../LogoutButton", () => ({
  LogoutButton: () => <button>Logout</button>,
}));

jest.mock("../DeleteAccountButton", () => ({
  DeleteAccountButton: () => <button>Delete Account</button>,
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
  };

  it("should render user information correctly", () => {
    render(<ProfilePageClient user={mockUser} stats={mockStats} />);

    expect(screen.getByText("testuser")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("January 2025")).toBeInTheDocument();
    expect(screen.getByText(/Google/)).toBeInTheDocument();
  });

  it("should render statistics correctly", () => {
    render(<ProfilePageClient user={mockUser} stats={mockStats} />);

    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Total Puzzles Solved")).toBeInTheDocument();
  });

  it("should show empty state when no puzzles solved", () => {
    render(
      <ProfilePageClient user={mockUser} stats={{ totalPuzzlesSolved: 0 }} />
    );

    expect(screen.getByText("Complete your first puzzle!")).toBeInTheDocument();
  });

  it("should render logout and delete account buttons", () => {
    render(<ProfilePageClient user={mockUser} stats={mockStats} />);

    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.getByText("Delete Account")).toBeInTheDocument();
  });

  it("should format member since date correctly", () => {
    const userWithDifferentDate = {
      ...mockUser,
      createdAt: "2024-12-25T00:00:00Z",
    };

    render(<ProfilePageClient user={userWithDifferentDate} stats={mockStats} />);

    expect(screen.getByText("December 2024")).toBeInTheDocument();
  });

  it("should handle unknown OAuth provider gracefully", () => {
    const userWithUnknownProvider = {
      ...mockUser,
      oauthProvider: "unknown-provider",
    };

    render(<ProfilePageClient user={userWithUnknownProvider} stats={mockStats} />);

    expect(screen.getByText(/unknown-provider/)).toBeInTheDocument();
  });
});
