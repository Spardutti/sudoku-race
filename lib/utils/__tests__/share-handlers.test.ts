import { shareToTwitter, shareToWhatsApp, copyToClipboard } from "../share-handlers";

describe("share-handlers", () => {
  let windowOpenSpy: jest.SpyInstance;

  beforeEach(() => {
    windowOpenSpy = jest.spyOn(window, "open").mockImplementation(() => null);
    Object.defineProperty(navigator, "userAgent", {
      writable: true,
      value: "Mozilla/5.0",
    });
  });

  afterEach(() => {
    windowOpenSpy.mockRestore();
  });

  describe("shareToTwitter", () => {
    it("opens Twitter Web Intent with encoded text", () => {
      shareToTwitter("Test share text!");

      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.stringContaining("https://twitter.com/intent/tweet?text="),
        "_blank",
        "noopener,noreferrer"
      );
      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.stringContaining("Test%20share%20text"),
        "_blank",
        "noopener,noreferrer"
      );
    });

    it("URL-encodes special characters", () => {
      shareToTwitter("Rank #23! ⏱️ 12:34");

      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.stringContaining("Rank%20%2323"),
        "_blank",
        "noopener,noreferrer"
      );
    });
  });

  describe("shareToWhatsApp", () => {
    it("uses whatsapp:// protocol on mobile", () => {
      Object.defineProperty(navigator, "userAgent", {
        writable: true,
        value: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) Mobile",
      });

      shareToWhatsApp("Test message");

      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.stringContaining("whatsapp://send?text="),
        "_blank",
        "noopener,noreferrer"
      );
    });

    it("uses wa.me on desktop", () => {
      Object.defineProperty(navigator, "userAgent", {
        writable: true,
        value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      });

      shareToWhatsApp("Test message");

      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.stringContaining("https://wa.me/?text="),
        "_blank",
        "noopener,noreferrer"
      );
    });

    it("detects Android as mobile", () => {
      Object.defineProperty(navigator, "userAgent", {
        writable: true,
        value: "Mozilla/5.0 (Linux; Android 10)",
      });

      shareToWhatsApp("Test");

      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.stringContaining("whatsapp://send"),
        "_blank",
        "noopener,noreferrer"
      );
    });
  });

  describe("copyToClipboard", () => {
    it("uses Clipboard API when available", async () => {
      const writeTextMock = jest.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      const result = await copyToClipboard("Test text");

      expect(writeTextMock).toHaveBeenCalledWith("Test text");
      expect(result).toBe(true);
    });

    it("falls back to execCommand when Clipboard API unavailable", async () => {
      Object.assign(navigator, {
        clipboard: undefined,
      });

      const execCommandMock = jest.fn().mockReturnValue(true);
      document.execCommand = execCommandMock;

      const result = await copyToClipboard("Test text");

      expect(execCommandMock).toHaveBeenCalledWith("copy");
      expect(result).toBe(true);
    });

    it("returns false on failure", async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockRejectedValue(new Error("Failed")),
        },
      });

      const result = await copyToClipboard("Test text");

      expect(result).toBe(false);
    });
  });
});
