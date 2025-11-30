import { generateShareText, formatTimeForShare, buildShareUrl } from "../share-text";

describe("share-text utilities", () => {
  describe("formatTimeForShare", () => {
    it("formats time correctly (MM:SS)", () => {
      expect(formatTimeForShare(754)).toBe("12:34");
      expect(formatTimeForShare(60)).toBe("1:00");
      expect(formatTimeForShare(125)).toBe("2:05");
      expect(formatTimeForShare(3661)).toBe("61:01");
    });

    it("pads seconds with zero when needed", () => {
      expect(formatTimeForShare(65)).toBe("1:05");
      expect(formatTimeForShare(300)).toBe("5:00");
    });
  });

  describe("buildShareUrl", () => {
    it("builds URL with correct UTM parameters for each channel", () => {
      expect(buildShareUrl("twitter")).toContain("utm_source=share");
      expect(buildShareUrl("twitter")).toContain("utm_medium=twitter");

      expect(buildShareUrl("whatsapp")).toContain("utm_source=share");
      expect(buildShareUrl("whatsapp")).toContain("utm_medium=whatsapp");

      expect(buildShareUrl("clipboard")).toContain("utm_source=share");
      expect(buildShareUrl("clipboard")).toContain("utm_medium=clipboard");
    });
  });

  describe("generateShareText", () => {
    it("generates share text with correct format", () => {
      const result = generateShareText({
        rank: 23,
        time: 754,
        puzzleNumber: 42,
        url: "https://sudokurace.com?utm_source=share&utm_medium=twitter",
      });

      expect(result).toContain("I ranked #23");
      expect(result).toContain("Sudoku Daily #42");
      expect(result).toContain("⏱️ 12:34");
      expect(result).toContain("https://sudokurace.com");
    });

    it("rotates encouragement phrases", () => {
      const texts = [
        generateShareText({
          rank: 1,
          time: 100,
          puzzleNumber: 1,
          url: "https://test.com",
        }),
        generateShareText({
          rank: 1,
          time: 100,
          puzzleNumber: 1,
          url: "https://test.com",
        }),
        generateShareText({
          rank: 1,
          time: 100,
          puzzleNumber: 1,
          url: "https://test.com",
        }),
        generateShareText({
          rank: 1,
          time: 100,
          puzzleNumber: 1,
          url: "https://test.com",
        }),
      ];

      const uniquePhrases = new Set(
        texts.map((t) => {
          const match = t.match(/(Think you can beat me\?|Can you solve it faster\?|Challenge accepted\?)/);
          return match ? match[1] : "";
        })
      );

      expect(uniquePhrases.size).toBeGreaterThan(1);
    });

    it("respects Twitter character limit (280 chars)", () => {
      const longUrl = "https://sudokurace.com?utm_source=share&utm_medium=twitter&extra=" + "x".repeat(200);
      const result = generateShareText({
        rank: 999,
        time: 3599,
        puzzleNumber: 999,
        url: longUrl,
      });

      expect(result.length).toBeLessThanOrEqual(280);
    });

    it("truncates URL if text exceeds Twitter limit", () => {
      const longUrl = "https://sudokurace.com?utm_source=share&utm_medium=twitter&extra=" + "x".repeat(300);
      const result = generateShareText({
        rank: 999,
        time: 3599,
        puzzleNumber: 999,
        url: longUrl,
      });

      expect(result).toContain("https://sudokurace.com");
      expect(result).not.toContain("?utm_source");
    });
  });
});
