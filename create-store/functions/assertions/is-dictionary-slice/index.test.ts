import { describe, expect, it, vi } from "vitest";

import { isDictionarySlice } from "./index";
import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";

vi.mock("@/create-store/functions/assertions/is-dictionary", () => ({
  isDictionary: vi.fn(),
}));

describe("isDictionarySlice", () => {
  it("should return false if source is not a dictionary", () => {
    vi.mocked(isDictionary).mockReturnValue(false);
    const target = { key1: "value1", key2: "value2" };
    const source = null;

    const result = isDictionarySlice(target, source);
    expect(result).toBe(false);
  });

  it("should return true if source is a valid partial dictionary of target", () => {
    vi.mocked(isDictionary).mockReturnValue(true);
    const target = { key1: "value1", key2: "value2" };
    const source = { key1: "value1" };
    const result = isDictionarySlice(target, source);
    expect(result).toBe(true);
  });

  it("should return false if source contains keys not in target", () => {
    vi.mocked(isDictionary).mockReturnValue(true);
    const target = { key1: "value1", key2: "value2" };
    const source = { key3: "value3" };

    const result = isDictionarySlice(target, source);
    expect(result).toBe(false);
  });

  it("should return true if source is an empty object and target is a dictionary", () => {
    vi.mocked(isDictionary).mockReturnValue(true);
    const target = { key1: "value1", key2: "value2" };
    const source = {};
    const result = isDictionarySlice(target, source);
    expect(result).toBe(true);
  });

  it("should return false if source is not an object", () => {
    vi.mocked(isDictionary).mockReturnValue(false);
    const target = { key1: "value1", key2: "value2" };
    const source = "not-an-object";

    const result = isDictionarySlice(target, source);
    expect(result).toBe(false);
  });
});
