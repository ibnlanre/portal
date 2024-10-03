import { getValue } from "@/utilities";
import { describe, expect, test, vi } from "vitest";

describe("getValue", () => {
  const store = {
    foo: {
      bar: {
        baz: "Hello, World!",
      },
    },
  };

  test("should return the value at the specified path", () => {
    const result = getValue(store, "foo.bar.baz");
    expect(result).toBe(store.foo.bar.baz);
  });

  test("should return undefined if the path does not exist", () => {
    const result = getValue(store, "foo.bar");
    expect(result).toBeUndefined();
  });

  test("should return the default value if the path does not exist", () => {
    const result = getValue(store, "foo.bar");
    expect(result).toBeUndefined();
  });

  test("should handle nested objects correctly", () => {
    const nestedStore = {
      a: {
        b: {
          c: {
            d: "Nested Value",
          },
        },
      },
    };
    const result = getValue(nestedStore, "a.b.c.d");
    expect(result).toBe("Nested Value");
  });

  test("should handle arrays within objects", () => {
    const arrayStore = {
      arr: [
        { id: 1, value: "First" },
        { id: 2, value: "Second" },
      ],
    };
    const result = getValue(arrayStore, "arr");
    expect(result).toBe("Second");
  });

  test("should handle custom delimiters", () => {
    const customDelimiterStore = {
      foo: {
        bar: {
          baz: "Custom Delimiter",
        },
      },
    };
    const result = getValue(customDelimiterStore, "foo|bar|baz", "|");
    expect(result).toBe("Custom Delimiter");
  });

  test("should handle paths with special characters", () => {
    const specialCharStore = {
      "foo.bar": {
        "baz.qux": "Special Characters",
      },
    };
    const result = getValue(specialCharStore, "foo.bar.baz.qux");
    expect(result).toBe("Special Characters");
  });
});
