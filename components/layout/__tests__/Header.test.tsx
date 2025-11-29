import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Header } from "../Header";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/lib/hooks/useAuthState";
import type { User } from "@supabase/supabase-js";

jest.mock("@/actions/auth");
jest.mock("sonner");
jest.mock("next/navigation");
jest.mock("@/lib/hooks/useAuthState");

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseAuthState = useAuthState as jest.MockedFunction<typeof useAuthState>;

const mockPush = jest.fn();
const mockRefresh = jest.fn();

const mockUser: User = {
  id: "test-user-id",
  email: "test@example.com",
  user_metadata: { full_name: "Test User" },
  app_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
};

describe("Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    } as never);
  });

  describe("Guest State", () => {
    beforeEach(() => {
      mockUseAuthState.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    });

    it("should render 'Sign In' button when user is not authenticated", () => {
      render(<Header initialUser={null} username={null} />);

      expect(screen.getByText("Sign In")).toBeInTheDocument();
    });

    it("should open auth dialog when 'Sign In' button is clicked", async () => {
      render(<Header initialUser={null} username={null} />);

      const signInButton = screen.getByText("Sign In");
      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(screen.getByText("Sign In to Sudoku Daily")).toBeInTheDocument();
      });
    });
  });

  describe("Authenticated State", () => {
    beforeEach(() => {
      mockUseAuthState.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      });
    });

    it("should render username when user is authenticated", () => {
      render(<Header initialUser={mockUser} username="testuser" />);

      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    it("should fallback to username prop when user_metadata.full_name is missing", () => {
      const userWithoutName = { ...mockUser, user_metadata: {} };
      mockUseAuthState.mockReturnValue({
        user: userWithoutName,
        isAuthenticated: true,
        isLoading: false,
      });

      render(<Header initialUser={userWithoutName} username="fallbackuser" />);

      expect(screen.getByText("fallbackuser")).toBeInTheDocument();
    });

    it("should render dropdown trigger with username", () => {
      render(<Header initialUser={mockUser} username="testuser" />);

      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    it("should render user button as dropdown trigger", () => {
      render(<Header initialUser={mockUser} username="testuser" />);

      const userButton = screen.getByRole("button", { name: /Test User/i });
      expect(userButton).toBeInTheDocument();
    });
  });

  describe("SSR Handoff", () => {
    it("should render immediately with initialUser (no loading state)", () => {
      mockUseAuthState.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      });

      render(<Header initialUser={mockUser} username="testuser" />);

      expect(screen.getByText("Test User")).toBeInTheDocument();
      const skeleton = document.querySelector(".animate-pulse");
      expect(skeleton).not.toBeInTheDocument();
    });

    it("should render guest state immediately when no initialUser", () => {
      mockUseAuthState.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      render(<Header initialUser={null} username={null} />);

      expect(screen.getByText("Sign In")).toBeInTheDocument();
      const skeleton = document.querySelector(".animate-pulse");
      expect(skeleton).not.toBeInTheDocument();
    });
  });

  describe("Mobile Menu", () => {
    beforeEach(() => {
      mockUseAuthState.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    });

    it("should toggle mobile menu when hamburger button is clicked", async () => {
      render(<Header initialUser={null} username={null} />);

      const hamburgerButton = screen.getByLabelText("Toggle navigation menu");
      fireEvent.click(hamburgerButton);

      await waitFor(() => {
        expect(screen.getAllByText("Today's Puzzle").length).toBeGreaterThan(1);
      });
    });

    it("should close mobile menu on Escape key press", async () => {
      render(<Header initialUser={null} username={null} />);

      const hamburgerButton = screen.getByLabelText("Toggle navigation menu");
      fireEvent.click(hamburgerButton);

      await waitFor(() => {
        expect(screen.getAllByText("Today's Puzzle").length).toBeGreaterThan(1);
      });

      fireEvent.keyDown(document, { key: "Escape" });

      await waitFor(() => {
        expect(screen.getAllByText("Today's Puzzle").length).toBe(1);
      });
    });
  });

  describe("Navigation Links", () => {
    it("should render all navigation links", () => {
      mockUseAuthState.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      render(<Header initialUser={null} username={null} />);

      expect(screen.getByText("Today's Puzzle")).toBeInTheDocument();
      expect(screen.getByText("Leaderboard")).toBeInTheDocument();
      expect(screen.getByText("Profile")).toBeInTheDocument();
    });
  });
});
