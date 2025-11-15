import { describe, expect, it } from "vitest";

import { safeStringify } from "./index";

describe("safeStringify", () => {
  it("should return the same string if the value is already a string", () => {
    const value = "test string";
    const result = safeStringify(value);
    expect(result).toBe(value);
  });

  it("should return a JSON string if the value is an object", () => {
    const value = { key: "value" };
    const result = safeStringify(value);
    expect(result).toBe(JSON.stringify(value));
  });

  it("should return a JSON string if the value is an array", () => {
    const value = [1, 2, 3];
    const result = safeStringify(value);
    expect(result).toBe(JSON.stringify(value));
  });

  it("should return a JSON string if the value is a number", () => {
    const value = 123;
    const result = safeStringify(value);
    expect(result).toBe(JSON.stringify(value));
  });

  it("should return a JSON string if the value is a boolean", () => {
    const value = true;
    const result = safeStringify(value);
    expect(result).toBe(JSON.stringify(value));
  });

  it("should return a JSON string if the value is null", () => {
    const value = null;
    const result = safeStringify(value);
    expect(result).toBe(JSON.stringify(value));
  });

  it("should return a JSON string if the value is undefined", () => {
    const value = undefined;
    const result = safeStringify(value);
    expect(result).toBe(JSON.stringify(value));
  });
});
