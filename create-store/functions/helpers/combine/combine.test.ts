import { describe, expect, it } from "vitest";
import { combine } from "./index";

describe("combine", () => {
  it("should return the shallow merge of target and source if both are dictionaries and source is a dictionary slice of target", () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3 };

    const result = combine(target, source);
    expect(result).toEqual({ a: 1, b: 3 });
  });

  it("should return the source casted as Target if target is not a dictionary", () => {
    const target = { a: 1, b: 2 };
    const source = "not a dictionary";

    const result = combine(target, source);
    expect(result).toBe(source);
  });

  it("should return the source casted as Target if source is not a dictionary slice of target", () => {
    const target = { a: 1, b: 2 };
    const source = { c: 3 };

    const result = combine(target, source);
    expect(result).toBe(source);
  });
});
