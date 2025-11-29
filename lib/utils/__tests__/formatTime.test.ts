import { formatTime } from "../formatTime";

describe("formatTime", () => {
  it("formats seconds to MM:SS", () => {
    expect(formatTime(754)).toBe("12:34");
    expect(formatTime(59)).toBe("00:59");
    expect(formatTime(60)).toBe("01:00");
    expect(formatTime(3661)).toBe("61:01");
  });

  it("handles zero seconds", () => {
    expect(formatTime(0)).toBe("00:00");
  });

  it("handles negative numbers", () => {
    expect(formatTime(-10)).toBe("00:00");
    expect(formatTime(-100)).toBe("00:00");
  });

  it("pads single digits with zero", () => {
    expect(formatTime(5)).toBe("00:05");
    expect(formatTime(65)).toBe("01:05");
  });

  it("handles large numbers", () => {
    expect(formatTime(6000)).toBe("100:00");
    expect(formatTime(5999)).toBe("99:59");
  });
});
