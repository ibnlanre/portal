import type { Dictionary } from "@/create-store/types/dictionary";
import type { Paths } from "@/create-store/types/paths";

import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

import { resolvePath } from "./index";
import { splitPath } from "@/create-store/functions/helpers/split-path";
import { resolveSegment } from "@/create-store/functions/utilities/resolve-segment";

vi.mock("@/create-store/functions/helpers/split-path");
vi.mock("@/create-store/functions/utilities/resolve-segment");

afterEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe("resolvePath", () => {
  it("should resolve the path correctly", () => {
    const state: Dictionary = { user: { age: 30, name: "John" } };
    const path: Paths<typeof state> = "user.name";
    const segments = ["user", "name"];
    const expectedResult = "John";

    vi.mocked(splitPath).mockReturnValue(segments);
    vi.mocked(resolveSegment).mockReturnValue(expectedResult);

    const result = resolvePath(state, path);

    expect(splitPath).toHaveBeenCalledWith(path);
    expect(resolveSegment).toHaveBeenCalledWith(state, segments);
    expect(result).toBe(expectedResult);
  });

  it("should handle non-existing path", () => {
    const state: Dictionary = { user: { age: 30, name: "John" } };
    const path: Paths<typeof state> = "user.address";
    const expectedResult = undefined;

    const result = resolvePath(state, path);

    expect(splitPath).not.toHaveBeenCalled();
    expect(resolveSegment).not.toHaveBeenCalled();
    expect(result).toBe(expectedResult);
  });

  it("should handle empty path", () => {
    const state: Dictionary = { user: { age: 30, name: "John" } };
    const result = resolvePath(state);

    expect(splitPath).not.toHaveBeenCalled();
    expect(resolveSegment).not.toHaveBeenCalled();
    expect(result).toBe(state);
  });
});
