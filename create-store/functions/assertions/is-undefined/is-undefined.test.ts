import { describe, expect, it } from "vitest";
import { isUndefined } from "./index";

describe("isUndefined", () => {
  it("should return true for undefined", () => {
    expect(isUndefined(undefined)).toBe(true);
  });

  it("should return false for null", () => {
    expect(isUndefined(null)).toBe(false);
  });

  it("should return false for false", () => {
    expect(isUndefined(false)).toBe(false);
  });

  it("should return false for 0", () => {
    expect(isUndefined(0)).toBe(false);
  });

  it("should return false for NaN", () => {
    expect(isUndefined(NaN)).toBe(false);
  });

  it("should return false for an empty string", () => {
    expect(isUndefined("")).toBe(false);
  });

  it("should return false for an empty array", () => {
    expect(isUndefined([])).toBe(false);
  });

  it("should return false for an empty object", () => {
    expect(isUndefined({})).toBe(false);
  });
});
