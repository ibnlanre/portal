import { describe, expect, it } from "vitest";
import { tryParse } from "./index";

describe("tryParse", () => {
  it("should parse a valid JSON string", () => {
    const jsonString = '{"key": "value"}';
    const result = tryParse<{ key: string }>(jsonString);
    expect(result).toEqual({ key: "value" });
  });

  it("should return the original string if it is not valid JSON", () => {
    const invalidJsonString = "invalid json";
    const result = tryParse<string>(invalidJsonString);
    expect(result).toBe(invalidJsonString);
  });

  it("should parse a JSON string representing a number", () => {
    const jsonString = "123";
    const result = tryParse<number>(jsonString);
    expect(result).toBe(123);
  });

  it("should parse a JSON string representing an array", () => {
    const jsonString = "[1, 2, 3]";
    const result = tryParse<number[]>(jsonString);
    expect(result).toEqual([1, 2, 3]);
  });

  it("should parse a JSON string representing a boolean", () => {
    const jsonString = "true";
    const result = tryParse<boolean>(jsonString);
    expect(result).toBe(true);
  });

  it("should return the original string if it is an empty string", () => {
    const emptyString = "";
    const result = tryParse<string>(emptyString);
    expect(result).toBe(emptyString);
  });
});
