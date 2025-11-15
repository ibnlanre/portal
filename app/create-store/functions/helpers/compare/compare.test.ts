import { describe, expect, it } from "vitest";

import { compare } from "./index";

describe("compare", () => {
  it("returns true if both arrays are the same reference", () => {
    const arr = [1, 2, 3];
    expect(compare(arr, arr)).toBe(true);
  });

  it("returns false if one of the arrays is null or undefined", () => {
    expect(compare(undefined, [1, 2])).toBe(false);
    expect(compare([1, 2], undefined)).toBe(false);
    expect(compare(null, [1, 2])).toBe(false);
    expect(compare([1, 2], null)).toBe(false);
  });

  it("returns false if arrays have different lengths", () => {
    expect(compare([1, 2], [1, 2, 3])).toBe(false);
    expect(compare([1, 2, 3], [1, 2])).toBe(false);
  });

  it("returns true if arrays have same values and order", () => {
    expect(compare([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(compare(["a", "b"], ["a", "b"])).toBe(true);
  });

  it("returns true if arrays have same values but different order", () => {
    expect(compare([1, 2, 3], [3, 2, 1])).toBe(true);
  });

  it("returns false if any element is different", () => {
    expect(compare([1, 2, 3], [1, 2, 4])).toBe(false);
  });

  it("works with empty arrays", () => {
    expect(compare([], [])).toBe(true);
    expect(compare([], [1])).toBe(false);
    expect(compare([1], [])).toBe(false);
  });

  it("compares arrays with objects by value", () => {
    const obj = { a: 1 };
    expect(compare([obj], [obj])).toBe(true);
    expect(compare([{ a: 1 }], [{ a: 1 }])).toBe(true);
  });

  it("returns false for arrays with objects in different positions", () => {
    const obj1 = { a: 1 };
    const obj2 = { b: 2 };
    expect(compare([obj1, obj2], [obj2, obj1])).toBe(true);
  });
});
