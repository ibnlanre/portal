import { describe, expect, it } from "vitest";
import { removeCallableProperties } from "./index";

describe("removeCallableProperties", () => {
  it("should remove callable properties from a flat object", () => {
    const state = {
      a: 1,
      b: "string",
      c: () => "callable",
    };

    const result = removeCallableProperties(state);

    expect(result).toEqual({
      a: 1,
      b: "string",
    });
  });

  it("should remove callable properties from a nested object", () => {
    const state = {
      a: 1,
      b: {
        c: 2,
        d: () => "callable",
      },
      e: "string",
    };

    const result = removeCallableProperties(state);

    expect(result).toEqual({
      a: 1,
      b: {
        c: 2,
      },
      e: "string",
    });
  });

  it("should handle an empty object", () => {
    const state = {};

    const result = removeCallableProperties(state);

    expect(result).toEqual({});
  });

  it("should handle objects with no callable properties", () => {
    const state = {
      a: 1,
      b: "string",
      c: {
        d: 2,
        e: "nested",
      },
    };

    const result = removeCallableProperties(state);

    expect(result).toEqual(state);
  });

  it("should handle objects with only callable properties", () => {
    const state = {
      a: () => "callable",
      b: () => "another callable",
    };

    const result = removeCallableProperties(state);

    expect(result).toEqual({});
  });
});
