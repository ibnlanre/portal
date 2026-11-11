import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import { tryParse } from "./index";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("tryParse", () => {
  it("should parse a valid JSON string", () => {
    const result = tryParse<{ key: string }>('{"key": "value"}');
    expectTypeOf(result).toEqualTypeOf<undefined | { key: string }>();
    expect(result).toEqual({ key: "value" });
  });

  it("should parse JSON numbers, arrays, booleans and null", () => {
    expect(tryParse<number>("123")).toBe(123);
    expect(tryParse<number[]>("[1, 2, 3]")).toEqual([1, 2, 3]);
    expect(tryParse<boolean>("true")).toBe(true);
    expect(tryParse<null>("null")).toBeNull();
  });

  it("should treat text that is not valid JSON as absent and log it", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(tryParse<string>("invalid json")).toBeUndefined();
    expect(error).toHaveBeenCalledTimes(1);
  });

  it("should treat an empty string as absent", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(tryParse<string>("")).toBeUndefined();
  });
});
