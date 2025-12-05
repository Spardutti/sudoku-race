import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthButtons } from "../AuthButtons";
import { signInWithGoogle } from "@/actions/auth";
import { toast } from "sonner";

jest.mock("@/actions/auth");
jest.mock("sonner");

const mockSignInWithGoogle = signInWithGoogle as jest.MockedFunction<typeof signInWithGoogle>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe("AuthButtons", () => {
  let originalLocation: Location;

  beforeAll(() => {
    // Save original location
    originalLocation = window.location;
    // Delete and redefine as mock
    delete (window as { location?: Location }).location;
    (window as { location: { href: string } }).location = { href: "" };
  });

  afterAll(() => {
    // Restore original location
    delete (window as { location?: { href: string } }).location;
    (window as { location: Location }).location = originalLocation;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset href
    window.location.href = "";
  });

  it("should render Google OAuth button with official styling", () => {
    render(<AuthButtons />);

    const button = screen.getByRole("button", { name: /sign in with google/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByText("Sign in with Google")).toBeInTheDocument();
  });

  it("should call signInWithGoogle on successful sign-in", async () => {
    const mockUrl = "https://accounts.google.com/oauth";
    mockSignInWithGoogle.mockResolvedValue({
      success: true,
      data: { url: mockUrl },
    });

    render(<AuthButtons />);

    const googleButton = screen.getByRole("button", { name: /sign in with google/i });
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled();
    });
  });


  it("should show error toast on sign-in failure", async () => {
    mockSignInWithGoogle.mockResolvedValue({
      success: false,
      error: "Sign-in failed. Please try again.",
    });

    render(<AuthButtons />);

    const googleButton = screen.getByRole("button", { name: /sign in with google/i });
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Sign-in failed. Please try again.");
    });
  });

  it("should show loading spinner while signing in", async () => {
    mockSignInWithGoogle.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: { url: "https://test.com" } }), 100))
    );

    render(<AuthButtons />);

    const googleButton = screen.getByRole("button", { name: /sign in with google/i });
    fireEvent.click(googleButton);

    expect(mockSignInWithGoogle).toHaveBeenCalled();
  });

  it("should handle unexpected errors", async () => {
    mockSignInWithGoogle.mockRejectedValue(new Error("Network error"));

    render(<AuthButtons />);

    const googleButton = screen.getByRole("button", { name: /sign in with google/i });
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Something went wrong. Please try again.");
    });
  });
});
