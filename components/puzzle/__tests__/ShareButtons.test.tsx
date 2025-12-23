import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ShareButtons } from "@/components/puzzle/ShareButtons";
import { openTwitterShare, openWhatsAppShare } from "@/lib/utils/share";
import { logShareEvent } from "@/actions/share";

jest.mock("@/lib/utils/share");
jest.mock("@/actions/share");
jest.mock("sonner");
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

const mockOpenTwitterShare = openTwitterShare as jest.MockedFunction<typeof openTwitterShare>;
const mockOpenWhatsAppShare = openWhatsAppShare as jest.MockedFunction<typeof openWhatsAppShare>;
const mockLogShareEvent = logShareEvent as jest.MockedFunction<typeof logShareEvent>;

const mockEmojiGrid = "🟩🟩⬜\n⬜🟩🟩\n🟩⬜🟩";

describe("ShareButtons", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogShareEvent.mockResolvedValue({ success: true, data: undefined });
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders all three share buttons", () => {
    render(
      <ShareButtons
        puzzleId="2025-01-05"
        puzzleNumber={5}
        completionTime={180}
        emojiGrid={mockEmojiGrid}
      />
    );

    expect(screen.getByTestId("twitter-share-button")).toBeInTheDocument();
    expect(screen.getByTestId("whatsapp-share-button")).toBeInTheDocument();
    expect(screen.getByTestId("copy-clipboard-button")).toBeInTheDocument();
  });

  it("handles Twitter share with tracking", () => {
    mockOpenTwitterShare.mockReturnValue(window.open("", "_blank") as Window);

    render(
      <ShareButtons
        puzzleId="2025-01-05"
        puzzleNumber={5}
        completionTime={180}
        emojiGrid={mockEmojiGrid}
        rank={42}
      />
    );

    fireEvent.click(screen.getByTestId("twitter-share-button"));

    expect(mockOpenTwitterShare).toHaveBeenCalledWith(
      expect.stringContaining(mockEmojiGrid)
    );
    expect(mockLogShareEvent).toHaveBeenCalledWith({
      puzzleId: "2025-01-05",
      channel: "twitter",
      rankAtShare: 42,
    });
  });

  it("handles WhatsApp share with tracking", () => {
    mockOpenWhatsAppShare.mockReturnValue(window.open("", "_blank") as Window);

    render(
      <ShareButtons
        puzzleId="2025-01-05"
        puzzleNumber={5}
        completionTime={180}
        emojiGrid={mockEmojiGrid}
        rank={10}
      />
    );

    fireEvent.click(screen.getByTestId("whatsapp-share-button"));

    expect(mockOpenWhatsAppShare).toHaveBeenCalledWith(
      expect.stringContaining(mockEmojiGrid)
    );
    expect(mockLogShareEvent).toHaveBeenCalledWith({
      puzzleId: "2025-01-05",
      channel: "whatsapp",
      rankAtShare: 10,
    });
  });

  it("copies to clipboard and shows Copied state", async () => {
    render(
      <ShareButtons
        puzzleId="2025-01-05"
        puzzleNumber={5}
        completionTime={180}
        emojiGrid={mockEmojiGrid}
        rank={7}
      />
    );

    const copyButton = screen.getByTestId("copy-clipboard-button");
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining(mockEmojiGrid)
      );
      expect(copyButton).toHaveTextContent("Copied!");
    });

    expect(mockLogShareEvent).toHaveBeenCalledWith({
      puzzleId: "2025-01-05",
      channel: "clipboard",
      rankAtShare: 7,
    });
  });

  it("uses execCommand fallback when clipboard API fails", async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockRejectedValue(new Error("Denied")),
      },
    });

    document.execCommand = jest.fn().mockReturnValue(true);

    render(
      <ShareButtons
        puzzleId="2025-01-05"
        puzzleNumber={5}
        completionTime={180}
        emojiGrid={mockEmojiGrid}
      />
    );

    fireEvent.click(screen.getByTestId("copy-clipboard-button"));

    await waitFor(() => {
      expect(document.execCommand).toHaveBeenCalledWith("copy");
      expect(screen.getByTestId("copy-clipboard-button")).toHaveTextContent("Copied!");
    });
  });

  it("shows error when clipboard methods fail", async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockRejectedValue(new Error("Denied")),
      },
    });

    document.execCommand = jest.fn().mockReturnValue(false);

    render(
      <ShareButtons
        puzzleId="2025-01-05"
        puzzleNumber={5}
        completionTime={180}
        emojiGrid={mockEmojiGrid}
      />
    );

    fireEvent.click(screen.getByTestId("copy-clipboard-button"));

    await waitFor(() => {
      expect(screen.getByTestId("copy-clipboard-button")).toHaveTextContent("Failed");
    });
  });

  it("includes streak and difficulty in share text", () => {
    mockOpenTwitterShare.mockReturnValue(window.open("", "_blank") as Window);

    render(
      <ShareButtons
        puzzleId="2025-01-05"
        puzzleNumber={5}
        completionTime={180}
        emojiGrid={mockEmojiGrid}
        streakData={{ currentStreak: 7, freezeAvailable: true, freezeWasUsed: false }}
        difficulty="hard"
      />
    );

    fireEvent.click(screen.getByTestId("twitter-share-button"));

    expect(mockOpenTwitterShare).toHaveBeenCalledWith(
      expect.stringContaining("7")
    );
  });
});
