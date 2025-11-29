import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LogoutButton } from "../LogoutButton";
import { signOut } from "@/actions/auth";
import { useRouter } from "next/navigation";

jest.mock("@/actions/auth");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe("LogoutButton", () => {
  const mockPush = jest.fn();
  const mockRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
      back: jest.fn(),
      forward: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as ReturnType<typeof useRouter>);
  });

  it("should render logout button", () => {
    render(<LogoutButton />);

    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("should call signOut action on button click", async () => {
    mockSignOut.mockResolvedValue({ success: true, data: undefined });

    render(<LogoutButton />);

    const button = screen.getByText("Logout");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  it("should redirect to home on successful logout", async () => {
    mockSignOut.mockResolvedValue({ success: true, data: undefined });

    render(<LogoutButton />);

    const button = screen.getByText("Logout");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("should show loading state while logging out", async () => {
    mockSignOut.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: undefined }), 100))
    );

    render(<LogoutButton />);

    const button = screen.getByText("Logout");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Logging out...")).toBeInTheDocument();
    });
  });

  it("should disable button while loading", async () => {
    mockSignOut.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: undefined }), 100))
    );

    render(<LogoutButton />);

    const button = screen.getByText("Logout");
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  it("should handle logout failure", async () => {
    mockSignOut.mockResolvedValue({ success: false, error: "Logout failed" });

    render(<LogoutButton />);

    const button = screen.getByText("Logout");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
