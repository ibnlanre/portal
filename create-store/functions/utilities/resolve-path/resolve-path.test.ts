import type { Dictionary } from "@/create-store/types/dictionary";
import type { Paths } from "@/create-store/types/paths";

import { describe, expect, it } from "vitest";

import { resolvePath } from "./index";

describe("resolvePath", () => {
  it("should resolve the path correctly", () => {
    const state: Dictionary = { user: { age: 30, name: "John" } };
    const path: Paths<typeof state> = "user.name";
    const expectedResult = "John";

    const result = resolvePath(state, path);
    expect(result).toBe(expectedResult);
  });

  it("should handle non-existing path", () => {
    const state: Dictionary = { user: { age: 30, name: "John" } };
    const path: Paths<typeof state> = "user.address";
    const expectedResult = undefined;

    const result = resolvePath(state, path);
    expect(result).toBe(expectedResult);
  });

  it("should handle empty path", () => {
    const state: Dictionary = { user: { age: 30, name: "John" } };
    const result = resolvePath(state);
    expect(result).toBe(state);
  });
});
