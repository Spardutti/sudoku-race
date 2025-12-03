import { isYesterday, isSameDay, getDaysDifference } from "../date-utils";

describe("date-utils", () => {
  describe("isSameDay", () => {
    it("should return true for same day", () => {
      const date1 = new Date("2025-12-03T10:00:00Z");
      const date2 = new Date("2025-12-03T22:00:00Z");
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it("should return false for different days", () => {
      const date1 = new Date("2025-12-03T23:59:59Z");
      const date2 = new Date("2025-12-04T00:00:00Z");
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it("should handle timezone edge cases correctly", () => {
      const date1 = new Date("2025-12-03T23:00:00-05:00");
      const date2 = new Date("2025-12-04T02:00:00-02:00");
      expect(isSameDay(date1, date2)).toBe(true);
    });
  });

  describe("isYesterday", () => {
    beforeAll(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it("should return true for yesterday's date", () => {
      jest.setSystemTime(new Date("2025-12-04T12:00:00Z"));
      const yesterday = new Date("2025-12-03T10:00:00Z");
      expect(isYesterday(yesterday)).toBe(true);
    });

    it("should return false for today's date", () => {
      jest.setSystemTime(new Date("2025-12-03T12:00:00Z"));
      const today = new Date("2025-12-03T10:00:00Z");
      expect(isYesterday(today)).toBe(false);
    });

    it("should return false for 2 days ago", () => {
      jest.setSystemTime(new Date("2025-12-05T12:00:00Z"));
      const twoDaysAgo = new Date("2025-12-03T10:00:00Z");
      expect(isYesterday(twoDaysAgo)).toBe(false);
    });
  });

  describe("getDaysDifference", () => {
    it("should return 0 for same day", () => {
      const date1 = new Date("2025-12-03T10:00:00Z");
      const date2 = new Date("2025-12-03T22:00:00Z");
      expect(getDaysDifference(date1, date2)).toBe(0);
    });

    it("should return 1 for consecutive days", () => {
      const date1 = new Date("2025-12-03T10:00:00Z");
      const date2 = new Date("2025-12-04T10:00:00Z");
      expect(getDaysDifference(date1, date2)).toBe(1);
    });

    it("should return negative for past dates", () => {
      const date1 = new Date("2025-12-05T10:00:00Z");
      const date2 = new Date("2025-12-03T10:00:00Z");
      expect(getDaysDifference(date1, date2)).toBe(-2);
    });

    it("should return 7 for week difference", () => {
      const date1 = new Date("2025-12-01T10:00:00Z");
      const date2 = new Date("2025-12-08T10:00:00Z");
      expect(getDaysDifference(date1, date2)).toBe(7);
    });

    it("should handle timezone edge cases correctly", () => {
      const date1 = new Date("2025-12-03T23:00:00-05:00");
      const date2 = new Date("2025-12-04T02:00:00-02:00");
      expect(getDaysDifference(date1, date2)).toBe(0);
    });
  });
});
