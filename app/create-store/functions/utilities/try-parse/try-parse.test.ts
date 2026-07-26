import { describe, expect, expectTypeOf, it } from "vitest";

import { tryParse } from "./index";

describe("tryParse", () => {
  it("should parse a valid JSON string", () => {
    const jsonString = '{"key": "value"}';
    const result = tryParse<{ key: string }>(jsonString);
    expectTypeOf(result).toEqualTypeOf<{ key: string }>();
    expect(result).toEqual({ key: "value" });
  });

  it("should return the original string if it is not valid JSON", () => {
    const invalidJsonString = "invalid json";
    const result = tryParse<string>(invalidJsonString);
    expectTypeOf(result).toEqualTypeOf<string>();
    expect(result).toBe(invalidJsonString);
  });

  it("should parse a JSON string representing a number", () => {
    const jsonString = "123";
    const result = tryParse<number>(jsonString);
    expectTypeOf(result).toEqualTypeOf<number>();
    expect(result).toBe(123);
  });

  it("should parse a JSON string representing an array", () => {
    const jsonString = "[1, 2, 3]";
    const result = tryParse<number[]>(jsonString);
    expectTypeOf(result).toEqualTypeOf<number[]>();
    expect(result).toEqual([1, 2, 3]);
  });

  it("should parse a JSON string representing a boolean", () => {
    const jsonString = "true";
    const result = tryParse<boolean>(jsonString);
    expectTypeOf(result).toEqualTypeOf<boolean>();
    expect(result).toBe(true);
  });

  it("should return the original string if it is an empty string", () => {
    const emptyString = "";
    const result = tryParse<string>(emptyString);
    expectTypeOf(result).toEqualTypeOf<string>();
    expect(result).toBe(emptyString);
  });
});
