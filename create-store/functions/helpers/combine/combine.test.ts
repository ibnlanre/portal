import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isDictionarySlice } from "@/create-store/functions/assertions/is-dictionary-slice";
import { shallowMerge } from "@/create-store/functions/helpers/shallow-merge";

import { beforeEach, describe, expect, it, vi } from "vitest";
import { combine } from "./index";

vi.mock("@/create-store/functions/assertions/is-dictionary", () => ({
  isDictionary: vi.fn(),
}));

vi.mock("@/create-store/functions/assertions/is-dictionary-slice", () => ({
  isDictionarySlice: vi.fn(),
}));

vi.mock("@/create-store/functions/helpers/shallow-merge", () => ({
  shallowMerge: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("combine", () => {
  it("should return the shallow merge of target and source if both are dictionaries and source is a dictionary slice of target", () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3 };

    vi.mocked(isDictionary).mockReturnValue(true);
    vi.mocked(isDictionarySlice).mockReturnValue(true);
    vi.mocked(shallowMerge).mockReturnValue({ a: 1, b: 3 });

    const result = combine(target, source);

    expect(isDictionary).toHaveBeenCalledWith(target);
    expect(isDictionarySlice).toHaveBeenCalledWith(source, target);
    expect(shallowMerge).toHaveBeenCalledWith(target, source);
    expect(result).toEqual({ a: 1, b: 3 });
  });

  it("should return the source casted as Target if target is not a dictionary", () => {
    const target = { a: 1, b: 2 };
    const source = "not a dictionary";

    vi.mocked(isDictionary).mockReturnValue(false);

    const result = combine(target, source);

    expect(isDictionary).toHaveBeenCalledWith(target);
    expect(isDictionarySlice).not.toHaveBeenCalled();
    expect(shallowMerge).not.toHaveBeenCalled();
    expect(result).toBe(source);
  });

  it("should return the source casted as Target if source is not a dictionary slice of target", () => {
    const target = { a: 1, b: 2 };
    const source = { c: 3 };

    vi.mocked(isDictionary).mockReturnValue(true);
    vi.mocked(isDictionarySlice).mockReturnValue(false);

    const result = combine(target, source);

    expect(isDictionary).toHaveBeenCalledWith(target);
    expect(isDictionarySlice).toHaveBeenCalledWith(source, target);
    expect(shallowMerge).not.toHaveBeenCalled();
    expect(result).toBe(source);
  });
});
