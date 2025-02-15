import { describe, expect, it } from "vitest";
import { isDictionary } from "./index";

describe("isDictionary", () => {
  it("should return true for an object", () => {
    expect(isDictionary({ key: "value" })).toBe(true);
  });

  it("should return false for null", () => {
    expect(isDictionary(null)).toBe(false);
  });

  it("should return false for an array", () => {
    expect(isDictionary([1, 2, 3])).toBe(false);
  });

  it("should return false for a string", () => {
    expect(isDictionary("string")).toBe(false);
  });

  it("should return false for a number", () => {
    expect(isDictionary(123)).toBe(false);
  });

  it("should return false for a boolean", () => {
    expect(isDictionary(true)).toBe(false);
  });

  it("should return false for undefined", () => {
    expect(isDictionary(undefined)).toBe(false);
  });
});
