import { describe, expect, it } from "vitest";

import { resolveSegment } from "./index";

describe("resolveSegment", () => {
  it("should resolve a single segment", () => {
    const state = { a: 1, b: 2 };
    const result = resolveSegment(state, ["a"]);
    expect(result).toBe(1);
  });

  it("should resolve nested segments", () => {
    const state = { a: { b: { c: 3 } } };
    const result = resolveSegment(state, ["a", "b", "c"]);
    expect(result).toBe(3);
  });

  it("should return undefined for non-existent segments", () => {
    const state = { a: { b: { c: 3 } } };
    const result = resolveSegment(state, <any>["a", "b", "d"]);
    expect(result).toBeUndefined();
  });

  it("should handle empty keys array", () => {
    const state = { a: 1, b: 2 };
    const result = resolveSegment(state, <any>[]);
    expect(result).toEqual(state);
  });
});
