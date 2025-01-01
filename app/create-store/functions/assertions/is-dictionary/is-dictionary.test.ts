import type { Dictionary } from "@/create-store/types/dictionary";

import { describe, expect, it } from "vitest";
import { isDictionary } from "./index";

describe("isDictionary", () => {
  it("should return true for an object", () => {
    const value: Dictionary = { key: "value" };
    expect(isDictionary(value)).toBe(true);
  });

  it("should return false for null", () => {
    const value = null;
    expect(isDictionary(value)).toBe(false);
  });

  it("should return false for an array", () => {
    const value = [1, 2, 3];
    expect(isDictionary(value)).toBe(false);
  });

  it("should return false for a string", () => {
    const value = "string";
    expect(isDictionary(value)).toBe(false);
  });

  it("should return false for a number", () => {
    const value = 123;
    expect(isDictionary(value)).toBe(false);
  });

  it("should return false for a boolean", () => {
    const value = true;
    expect(isDictionary(value)).toBe(false);
  });

  it("should return false for undefined", () => {
    const value = undefined;
    expect(isDictionary(value)).toBe(false);
  });
});
