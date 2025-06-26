import { describe, expect, it } from "vitest";

import { isValidKey } from ".";

describe("isValidKey", () => {
  it("should return true for valid keys", () => {
    expect(isValidKey("normalKey")).toBe(true);
    expect(isValidKey("foo")).toBe(true);
    expect(isValidKey(Symbol("validSymbol"))).toBe(true);
  });

  it("should return false for __proto__", () => {
    expect(isValidKey("__proto__")).toBe(false);
  });

  it("should return false for constructor", () => {
    expect(isValidKey("constructor")).toBe(false);
  });

  it("should return false for prototype", () => {
    expect(isValidKey("prototype")).toBe(false);
  });
});
