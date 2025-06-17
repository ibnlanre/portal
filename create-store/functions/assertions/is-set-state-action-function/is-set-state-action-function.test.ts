import { describe, expect, it } from "vitest";

import { isSetStateActionFunction } from "./index";

describe("isSetStateActionFunction", () => {
  it("should return true for a function", () => {
    const fn = (prev: number) => prev + 1;
    expect(isSetStateActionFunction(fn)).toBe(true);
  });

  it("should return false for a non-function value", () => {
    expect(isSetStateActionFunction(123)).toBe(false);
    expect(isSetStateActionFunction("string")).toBe(false);
    expect(isSetStateActionFunction({})).toBe(false);
    expect(isSetStateActionFunction([])).toBe(false);
    expect(isSetStateActionFunction(null)).toBe(false);
    expect(isSetStateActionFunction(undefined)).toBe(false);
  });

  it("should return false for an object with a function property", () => {
    const obj = { fn: (prev: number) => prev + 1 };
    expect(isSetStateActionFunction(obj)).toBe(false);
  });

  it("should return false for an array of functions", () => {
    const arr = [(prev: number) => prev + 1, (prev: number) => prev - 1];
    expect(isSetStateActionFunction(arr)).toBe(false);
  });
});
