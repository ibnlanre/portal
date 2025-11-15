import { describe, expect, it } from "vitest";

import { isEnabled } from "@/cookie-storage/helpers/is-enabled";

describe("isEnabled", () => {
  it("should return true for a truthy value", () => {
    expect(isEnabled(true)).toBe(true);
    expect(isEnabled("string")).toBe(true);
    expect(isEnabled(1)).toBe(true);
    expect(isEnabled({})).toBe(true);
    expect(isEnabled([])).toBe(true);
  });

  it("should return false for a falsy value", () => {
    expect(isEnabled(false)).toBe(false);
    expect(isEnabled(undefined)).toBe(false);
    expect(isEnabled(null)).toBe(false);
    expect(isEnabled(0)).toBe(true);
    expect(isEnabled("")).toBe(true);
  });
});
