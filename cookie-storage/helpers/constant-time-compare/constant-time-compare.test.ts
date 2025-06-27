import { describe, it, expect } from "vitest";
import { constantTimeCompare } from "./index";

describe("constantTimeCompare", () => {
  it("returns true for identical strings", () => {
    expect(constantTimeCompare("hello", "hello")).toBe(true);
    expect(constantTimeCompare("", "")).toBe(true);
    expect(constantTimeCompare("abc123!@#", "abc123!@#")).toBe(true);
  });

  it("returns false for different strings of same length", () => {
    expect(constantTimeCompare("hello", "world")).toBe(false);
    expect(constantTimeCompare("test1", "test2")).toBe(false);
  });

  it("returns false for strings of different lengths", () => {
    expect(constantTimeCompare("short", "shorter")).toBe(false);
    expect(constantTimeCompare("long", "")).toBe(false);
  });

  it("is case sensitive", () => {
    expect(constantTimeCompare("Test", "test")).toBe(false);
    expect(constantTimeCompare("TOKEN", "token")).toBe(false);
  });
});
