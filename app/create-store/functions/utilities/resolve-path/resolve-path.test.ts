import type { Dictionary } from "@/create-store/types/dictionary";
import type { Paths } from "@/create-store/types/paths";

import { splitPath } from "@/create-store/functions/helpers/split-path";
import { resolveSegment } from "@/create-store/functions/utilities/resolve-segment";
import { describe, expect, it, vi } from "vitest";
import { resolvePath } from "./index";

vi.mock("@/create-store/functions/helpers/split-path");
vi.mock("@/create-store/functions/utilities/resolve-segment");

describe("resolvePath", () => {
  it("should resolve the path correctly", () => {
    const state: Dictionary = { user: { name: "John", age: 30 } };
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

  it("should handle empty path", () => {
    const state: Dictionary = { user: { name: "John", age: 30 } };
    const path: Paths<typeof state> = "";
    const segments: string[] = [];
    const expectedResult = state;

    vi.mocked(splitPath).mockReturnValue(segments);
    vi.mocked(resolveSegment).mockReturnValue(expectedResult);

    const result = resolvePath(state, path);

    expect(splitPath).toHaveBeenCalledWith(path);
    expect(resolveSegment).toHaveBeenCalledWith(state, segments);
    expect(result).toBe(expectedResult);
  });

  it("should handle non-existing path", () => {
    const state: Dictionary = { user: { name: "John", age: 30 } };
    const path: Paths<typeof state> = "user.address";
    const segments = ["user", "address"];
    const expectedResult = undefined;

    vi.mocked(splitPath).mockReturnValue(segments);
    vi.mocked(resolveSegment).mockReturnValue(expectedResult);

    const result = resolvePath(state, path);

    expect(splitPath).toHaveBeenCalledWith(path);
    expect(resolveSegment).toHaveBeenCalledWith(state, segments);
    expect(result).toBe(expectedResult);
  });
});
