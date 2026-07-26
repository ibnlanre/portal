import type { Initializer } from "@/create-store/types/initializer";

import { describe, expect, it } from "vitest";

import { isFunction } from "./index";

describe("isFunction", () => {
  it("should return true for function values", () => {
    const func = () => {};
    expect(isFunction(func)).toBe(true);
  });

  it("should return false for non-function values", () => {
    expect(isFunction(123)).toBe(false);
    expect(isFunction("string")).toBe(false);
    expect(isFunction({})).toBe(false);
    expect(isFunction([])).toBe(false);
    expect(isFunction(null)).toBe(false);
    expect(isFunction(undefined)).toBe(false);
  });

  it("should return true for Initializer type functions", () => {
    const initializer: Initializer<any> = () => ({});
    expect(isFunction(initializer)).toBe(true);
  });
});
