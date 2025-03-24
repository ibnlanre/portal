import type { Dictionary } from "@/create-store/types/dictionary";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { describe, expect, it, vi } from "vitest";
import { isDictionarySlice } from "./index";

vi.mock("@/create-store/functions/assertions/is-dictionary", () => ({
  isDictionary: vi.fn(),
}));

describe("isDictionarySlice", () => {
  it("should return false if source is not a dictionary", () => {
    vi.mocked(isDictionary).mockReturnValue(false);
    const target: Dictionary = { key1: "value1", key2: "value2" };
    const result = isDictionarySlice(null, target);
    expect(result).toBe(false);
  });

  it("should return true if source is a valid partial dictionary of target", () => {
    vi.mocked(isDictionary).mockReturnValue(true);
    const source = { key1: "value1" };
    const target: Dictionary = { key1: "value1", key2: "value2" };
    const result = isDictionarySlice(source, target);
    expect(result).toBe(true);
  });

  it("should return false if source contains keys not in target", () => {
    vi.mocked(isDictionary).mockReturnValue(true);
    const source = { key3: "value3" };
    const target: Dictionary = { key1: "value1", key2: "value2" };
    const result = isDictionarySlice(source, target);
    expect(result).toBe(false);
  });

  it("should return true if source is an empty object and target is a dictionary", () => {
    vi.mocked(isDictionary).mockReturnValue(true);
    const source = {};
    const target: Dictionary = { key1: "value1", key2: "value2" };
    const result = isDictionarySlice(source, target);
    expect(result).toBe(true);
  });

  it("should return false if source is not an object", () => {
    vi.mocked(isDictionary).mockReturnValue(false);
    const source = "not-an-object";
    const target: Dictionary = { key1: "value1", key2: "value2" };
    const result = isDictionarySlice(source, target);
    expect(result).toBe(false);
  });
});
