import { shallowCompare } from "@/utilities";
import { describe, expect, test } from "vitest";

describe("shallowCompare", () => {
  test("should return true when prevValue and currValue are both undefined", () => {
    expect(shallowCompare(undefined, undefined)).toBe(true);
  });

  test("should return false when prevValue is undefined and currValue is defined", () => {
    expect(shallowCompare(undefined, [1, 2, 3])).toBe(false);
  });

  test("should return false when prevValue is defined and currValue is undefined", () => {
    expect(shallowCompare([1, 2, 3], undefined)).toBe(false);
  });

  test("should return true when prevValue and currValue are the same array reference", () => {
    const arr = [1, 2, 3];
    expect(shallowCompare(arr, arr)).toBe(true);
  });

  test("should return false when prevValue and currValue have different lengths", () => {
    expect(shallowCompare([1, 2, 3], [1, 2])).toBe(false);
  });

  test("should return false when prevValue and currValue have different values at the same index", () => {
    expect(shallowCompare([1, 2, 3], [1, 4, 3])).toBe(false);
  });

  test("should return true when prevValue and currValue have the same values at the same index", () => {
    expect(shallowCompare([1, 2, 3], [1, 2, 3])).toBe(true);
  });

  test("should return true when prevValue and currValue are both empty arrays", () => {
    expect(shallowCompare([], [])).toBe(true);
  });

  test("should return false when prevValue is an empty array and currValue is a non-empty array", () => {
    expect(shallowCompare([], [1, 2, 3])).toBe(false);
  });

  test("should return false when prevValue is a non-empty array and currValue is an empty array", () => {
    expect(shallowCompare([1, 2, 3], [])).toBe(false);
  });

  test("should return true when prevValue and currValue are arrays with the same objects", () => {
    const obj1 = { id: 1, name: "John" };
    const obj2 = { id: 2, name: "Jane" };
    expect(shallowCompare([obj1, obj2], [obj1, obj2])).toBe(true);
  });

  test("should return false when prevValue and currValue are arrays with the same objects in different order", () => {
    const obj1 = { id: 1, name: "John" };
    const obj2 = { id: 2, name: "Jane" };
    expect(shallowCompare([obj1, obj2], [obj2, obj1])).toBe(false);
  });

  test("should return false when prevValue and currValue are arrays with different objects", () => {
    const obj1 = { id: 1, name: "John" };
    const obj2 = { id: 2, name: "Jane" };
    const obj3 = { id: 3, name: "Bob" };
    expect(shallowCompare([obj1, obj2], [obj1, obj3])).toBe(false);
  });
});
