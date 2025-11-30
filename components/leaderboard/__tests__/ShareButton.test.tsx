import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ShareButton } from "../ShareButton";
import * as shareHandlers from "@/lib/utils/share-handlers";
import { toast } from "sonner";

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/lib/utils/share-handlers", () => ({
  shareToTwitter: jest.fn(),
  shareToWhatsApp: jest.fn(),
  copyToClipboard: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/actions/share", () => ({
  logShareEvent: jest.fn().mockResolvedValue({ success: true, data: undefined }),
}));

describe("ShareButton", () => {
  const defaultProps = {
    rank: 23,
    time: 754,
    puzzleNumber: 42,
    puzzleId: "test-puzzle-id",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders button with correct text and icon", () => {
    render(<ShareButton {...defaultProps} />);

    const button = screen.getByRole("button", { name: /share your rank/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Share Rank");
  });

  it("shows icon-only on mobile viewport", () => {
    render(<ShareButton {...defaultProps} />);

    const button = screen.getByRole("button", { name: /share your rank/i });
    const text = button.querySelector(".hidden.sm\\:inline");
    expect(text).toBeInTheDocument();
  });

  it("opens popover when button is clicked", () => {
    render(<ShareButton {...defaultProps} />);

    const button = screen.getByRole("button", { name: /share your rank/i });
    fireEvent.click(button);

    expect(screen.getByText("Share Preview")).toBeInTheDocument();
    expect(screen.getByText(/I ranked #23/)).toBeInTheDocument();
  });

  it("displays share text preview in popover", () => {
    render(<ShareButton {...defaultProps} />);

    const button = screen.getByRole("button", { name: /share your rank/i });
    fireEvent.click(button);

    const preview = screen.getByText(/I ranked #23 on Sudoku Daily #42/);
    expect(preview).toBeInTheDocument();
    expect(preview).toHaveClass("font-mono");
  });

  it("shows Twitter, WhatsApp, and Copy buttons in popover", () => {
    render(<ShareButton {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /share your rank/i }));

    expect(screen.getByRole("button", { name: /share on twitter/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /share on whatsapp/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copy to clipboard/i })).toBeInTheDocument();
  });

  it("calls shareToTwitter when Twitter button is clicked", async () => {
    render(<ShareButton {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /share your rank/i }));
    fireEvent.click(screen.getByRole("button", { name: /share on twitter/i }));

    await waitFor(() => {
      expect(shareHandlers.shareToTwitter).toHaveBeenCalledWith(
        expect.stringContaining("I ranked #23")
      );
    });
  });

  it("calls shareToWhatsApp when WhatsApp button is clicked", async () => {
    render(<ShareButton {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /share your rank/i }));
    fireEvent.click(screen.getByRole("button", { name: /share on whatsapp/i }));

    await waitFor(() => {
      expect(shareHandlers.shareToWhatsApp).toHaveBeenCalledWith(
        expect.stringContaining("I ranked #23")
      );
    });
  });

  it("calls copyToClipboard and shows success toast when Copy button is clicked", async () => {
    (shareHandlers.copyToClipboard as jest.Mock).mockResolvedValue(true);

    render(<ShareButton {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /share your rank/i }));
    fireEvent.click(screen.getByRole("button", { name: /copy to clipboard/i }));

    await waitFor(() => {
      expect(shareHandlers.copyToClipboard).toHaveBeenCalledWith(
        expect.stringContaining("I ranked #23")
      );
      expect(toast.success).toHaveBeenCalledWith("Copied to clipboard!", { duration: 2000 });
    });
  });

  it("shows error toast when clipboard copy fails", async () => {
    (shareHandlers.copyToClipboard as jest.Mock).mockResolvedValue(false);

    render(<ShareButton {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /share your rank/i }));
    fireEvent.click(screen.getByRole("button", { name: /copy to clipboard/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Could not copy. Try again.", { duration: 2000 });
    });
  });

  it("calls onShare callback when share action is triggered", async () => {
    const onShareMock = jest.fn();

    render(<ShareButton {...defaultProps} onShare={onShareMock} />);

    fireEvent.click(screen.getByRole("button", { name: /share your rank/i }));
    fireEvent.click(screen.getByRole("button", { name: /share on twitter/i }));

    await waitFor(() => {
      expect(onShareMock).toHaveBeenCalledWith("twitter");
    });
  });

  it("closes popover after share action", async () => {
    render(<ShareButton {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /share your rank/i }));
    expect(screen.getByText("Share Preview")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /share on twitter/i }));

    await waitFor(() => {
      expect(screen.queryByText("Share Preview")).not.toBeInTheDocument();
    });
  });
});
