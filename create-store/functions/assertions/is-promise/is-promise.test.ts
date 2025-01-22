import { describe, expect, it } from "vitest";
import { isPromise } from "./index";

describe("isPromise", () => {
  it("should return true for a Promise", () => {
    const promise = new Promise((resolve) => resolve("test"));
    expect(isPromise(promise)).toBe(true);
  });

  it("should return false for a non-Promise object", () => {
    const obj = {};
    expect(isPromise(obj)).toBe(false);
  });

  it("should return false for a string", () => {
    const str = "test";
    expect(isPromise(str)).toBe(false);
  });

  it("should return false for a number", () => {
    const num = 123;
    expect(isPromise(num)).toBe(false);
  });

  it("should return false for null", () => {
    expect(isPromise(null)).toBe(false);
  });

  it("should return false for undefined", () => {
    expect(isPromise(undefined)).toBe(false);
  });

  it("should return false for an array", () => {
    const arr = [1, 2, 3];
    expect(isPromise(arr)).toBe(false);
  });

  it("should return false for a function", () => {
    const func = () => {};
    expect(isPromise(func)).toBe(false);
  });
});
