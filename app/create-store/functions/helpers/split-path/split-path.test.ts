import { describe, expect, it } from "vitest";
import { splitPath } from "./index";

describe("splitPath", () => {
  it("should split a simple path string by dots", () => {
    const path = "a.b.c";
    const result = splitPath(path);
    expect(result).toEqual(["a", "b", "c"]);
  });

  it("should return an array with a single element if there are no dots", () => {
    const path = "abc";
    const result = splitPath(path);
    expect(result).toEqual(["abc"]);
  });

  it("should handle empty string", () => {
    const path = "";
    const result = splitPath(path);
    expect(result).toEqual([""]);
  });

  it("should handle leading and trailing dots", () => {
    const path = ".a.b.c.";
    const result = splitPath(path);
    expect(result).toEqual(["", "a", "b", "c", ""]);
  });

  it("should handle consecutive dots", () => {
    const path = "a..b.c";
    const result = splitPath(path);
    expect(result).toEqual(["a", "", "b", "c"]);
  });
});
