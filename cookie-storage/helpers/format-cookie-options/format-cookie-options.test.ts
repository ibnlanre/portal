import type { CookieOptions } from "@/cookie-storage/types/cookie-options";
import { describe, expect, it, vi } from "vitest";
import { formatCookieOptions } from "./index";

describe("formatCookieOptions", () => {
  it("should return default path when no options are provided", () => {
    const withoutPath = formatCookieOptions();
    expect(withoutPath).toBe("; path=/");

    const withPath = formatCookieOptions({ path: "/test" });
    expect(withPath).toBe("; path=/test");
  });

  it("should format domain option correctly", () => {
    const result = formatCookieOptions({ domain: "example.com" });
    expect(result).toBe("; path=/; domain=example.com");
  });

  it("should format secure option correctly", () => {
    expect(formatCookieOptions({ secure: true })).toBe("; path=/; secure");
    expect(formatCookieOptions({ secure: false })).toBe("; path=/");
  });

  it("should format httpOnly option correctly", () => {
    expect(formatCookieOptions({ httpOnly: true })).toBe("; path=/; httpOnly");
    expect(formatCookieOptions({ httpOnly: false })).toBe("; path=/");
  });

  it("should format partitioned option correctly", () => {
    expect(formatCookieOptions({ partitioned: true })).toBe(
      "; path=/; partitioned"
    );

    expect(formatCookieOptions({ partitioned: false })).toBe("; path=/");
  });

  it("should format expires option correctly", () => {
    vi.useFakeTimers();

    const expires = new Date();
    const options: CookieOptions = { expires };
    const result = formatCookieOptions(options);
    expect(result).toBe(`; path=/; expires=${expires.toUTCString()}`);

    vi.useRealTimers();
  });

  it("should format sameSite option correctly", () => {
    expect(formatCookieOptions({ sameSite: "Strict" })).toBe(
      "; path=/; SameSite=Strict"
    );

    expect(formatCookieOptions({ sameSite: "Lax" })).toBe(
      "; path=/; SameSite=Lax"
    );

    expect(formatCookieOptions({ sameSite: "None" })).toBe(
      "; path=/; SameSite=None"
    );
  });

  it("should format maxAge option correctly", () => {
    expect(formatCookieOptions({ maxAge: 3600 })).toBe(
      "; path=/; max-age=3600"
    );
  });

  it("should format multiple options correctly", () => {
    const options: CookieOptions = {
      domain: "example.com",
      secure: true,
      httpOnly: true,
      sameSite: "Lax",
      maxAge: 3600,
      partitioned: true,
    };
    const result = formatCookieOptions(options);
    expect(result).toBe(
      "; path=/; domain=example.com; secure; httpOnly; SameSite=Lax; max-age=3600; partitioned"
    );
  });
});
