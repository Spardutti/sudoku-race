import { validateReturnUrl } from "../return-url-validator";

describe("validateReturnUrl", () => {
  it("should return / for null input", () => {
    expect(validateReturnUrl(null)).toBe("/");
  });

  it("should return / for empty string", () => {
    expect(validateReturnUrl("")).toBe("/");
  });

  it("should allow / (home page)", () => {
    expect(validateReturnUrl("/")).toBe("/");
  });

  it("should allow /puzzle", () => {
    expect(validateReturnUrl("/puzzle")).toBe("/puzzle");
  });

  it("should allow /leaderboard", () => {
    expect(validateReturnUrl("/leaderboard")).toBe("/leaderboard");
  });

  it("should allow /profile", () => {
    expect(validateReturnUrl("/profile")).toBe("/profile");
  });

  it("should preserve query parameters for allowed paths", () => {
    expect(validateReturnUrl("/puzzle?debug=true")).toBe("/puzzle?debug=true");
  });

  it("should preserve hash fragments for allowed paths", () => {
    expect(validateReturnUrl("/puzzle#section")).toBe("/puzzle#section");
  });

  it("should preserve both query and hash for allowed paths", () => {
    expect(validateReturnUrl("/puzzle?showCompletion=true#modal")).toBe("/puzzle?showCompletion=true#modal");
  });

  it("should reject external URLs (protocol present)", () => {
    expect(validateReturnUrl("http://evil.com")).toBe("/");
    expect(validateReturnUrl("https://evil.com")).toBe("/");
  });

  it("should reject protocol-relative URLs", () => {
    expect(validateReturnUrl("//evil.com")).toBe("/");
  });

  it("should reject paths with double slashes", () => {
    expect(validateReturnUrl("/puzzle//evil")).toBe("/");
  });

  it("should reject disallowed paths", () => {
    expect(validateReturnUrl("/admin")).toBe("/");
    expect(validateReturnUrl("/api/users")).toBe("/");
    expect(validateReturnUrl("/settings")).toBe("/");
  });

  it("should reject paths that don't start with /", () => {
    expect(validateReturnUrl("puzzle")).toBe("/");
    expect(validateReturnUrl("javascript:alert(1)")).toBe("/");
  });

  it("should allow paths with locale prefixes", () => {
    expect(validateReturnUrl("/en/puzzle")).toBe("/en/puzzle");
    expect(validateReturnUrl("/es/leaderboard")).toBe("/es/leaderboard");
    expect(validateReturnUrl("/fr/profile")).toBe("/fr/profile");
  });

  it("should preserve query params with locale paths", () => {
    expect(validateReturnUrl("/en/puzzle?debug=true")).toBe("/en/puzzle?debug=true");
    expect(validateReturnUrl("/es/puzzle?showCompletion=true")).toBe("/es/puzzle?showCompletion=true");
  });

  it("should reject disallowed paths even with locale prefix", () => {
    expect(validateReturnUrl("/en/admin")).toBe("/");
    expect(validateReturnUrl("/es/api/users")).toBe("/");
  });
});
