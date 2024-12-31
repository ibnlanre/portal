import { describe, expect, it } from "vitest";
import { isDefined } from "./index";

describe("isDefined", () => {
  it("should return true for defined values", () => {
    expect(isDefined(1)).toBe(true);
    expect(isDefined("string")).toBe(true);
    expect(isDefined(true)).toBe(true);
    expect(isDefined({})).toBe(true);
    expect(isDefined([])).toBe(true);
  });

  it("should return false for null or undefined values", () => {
    expect(isDefined(null)).toBe(false);
    expect(isDefined(undefined)).toBe(false);
  });
});
