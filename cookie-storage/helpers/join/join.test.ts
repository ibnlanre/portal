import { describe, expect, it } from "vitest";

import { join } from "./index";

describe("join", () => {
  it("should join segments with the specified connector", () => {
    expect(join(["a", "b", "c"], "-")).toBe("a-b-c");
  });

  it("should join segments with an empty string connector by default", () => {
    expect(join(["a", "b", "c"])).toBe("abc");
  });

  it("should filter out falsy segments", () => {
    expect(join(["a", "", "b", "c"], "-")).toBe("a-b-c");
  });

  it("should return an empty string when all segments are falsy", () => {
    expect(join([""], "-")).toBe("");
  });

  it("should return an empty string when the input array is empty", () => {
    expect(join([])).toBe("");
  });
});
