import type { Dictionary } from "@/create-store/types/dictionary";

import { describe, expect, it } from "vitest";
import { createPaths } from "./index";

describe("createPaths", () => {
  it("should generate paths for a flat dictionary", () => {
    const store: Dictionary = {
      key1: "value1",
      key2: "value2",
    };

    const result = createPaths(store);
    expect(result).toEqual(["key1", "key2"]);
  });

  it("should generate paths for a nested dictionary", () => {
    const store: Dictionary = {
      key1: {
        nestedKey1: "value1",
        nestedKey2: "value2",
      },
      key2: "value3",
    };

    const result = createPaths(store);

    expect(result).toEqual([
      "key1",
      "key1.nestedKey1",
      "key1.nestedKey2",
      "key2",
    ]);
  });

  it("should handle an empty dictionary", () => {
    const store: Dictionary = {};
    const result = createPaths(store);
    expect(result).toEqual([]);
  });

  it("should include the prefix in the generated paths", () => {
    const store: Dictionary = {
      key1: {
        nestedKey1: "value1",
      },
    };

    const result = createPaths(store, ["prefix"]);
    expect(result).toEqual(["prefix.key1", "prefix.key1.nestedKey1"]);
  });

  it("should handle deeply nested dictionaries", () => {
    const store: Dictionary = {
      key1: {
        nestedKey1: {
          deepKey1: "value1",
        },
      },
    };

    const result = createPaths(store);

    expect(result).toEqual([
      "key1",
      "key1.nestedKey1",
      "key1.nestedKey1.deepKey1",
    ]);
  });
});
