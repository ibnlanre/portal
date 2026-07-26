import type { Paths } from "@/create-store/types/paths";

import { describe, expect, it } from "vitest";

import { resolvePath } from "./index";

describe("resolvePath", () => {
  it("should resolve the path correctly", () => {
    const state = { user: { age: 30, name: "John" } };
    const expectedResult = "John";

    const result = resolvePath(state, "user.name");
    expect(result).toBe(expectedResult);
  });

  it("should handle non-existing path", () => {
    const state = { user: { age: 30, name: "John" } };
    const path = "user.address" as Paths<typeof state>;
    const expectedResult = undefined;

    const result = resolvePath(state, path);
    expect(result).toBe(expectedResult);
  });

  it("should handle empty path", () => {
    const state = { user: { age: 30, name: "John" } };
    const result = resolvePath(state);
    expect(result).toBe(state);
  });
});
