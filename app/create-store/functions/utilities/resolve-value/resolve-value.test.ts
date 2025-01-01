import { describe, expect, it } from "vitest";
import { resolveValue } from "./index";

describe("resolveValue", () => {
  it("should return the value if initialState is not a function", () => {
    const initialState = 42;
    const result = resolveValue(initialState);
    expect(result).toBe(42);
  });

  it("should return the result of the function if initialState is a function", () => {
    const initialState = () => 42;
    const result = resolveValue(initialState);
    expect(result).toBe(42);
  });

  it("should handle undefined state correctly", () => {
    const initialState = undefined;
    const result = resolveValue(initialState);
    expect(result).toBeUndefined();
  });

  it("should handle function returning undefined correctly", () => {
    const initialState = () => undefined;
    const result = resolveValue(initialState);
    expect(result).toBeUndefined();
  });
});
