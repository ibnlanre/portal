import { describe, expect, it } from "vitest";

import { combineHelper } from "./index";

describe("combineHelper", () => {
  describe("Basic Property Copying", () => {
    it("copies string properties from source to result", () => {
      const result = { existing: "value" };
      const source = { another: 42, newProp: "new" };
      const keys = ["newProp", "another"];

      combineHelper(result, keys, source);

      expect(result).toEqual({
        another: 42,
        existing: "value",
        newProp: "new",
      });
    });

    it("replaces existing properties", () => {
      const result = { keep: "unchanged", prop: "old" };
      const source = { prop: "new" };
      const keys = ["prop"];

      combineHelper(result, keys, source);

      expect(result).toEqual({
        keep: "unchanged",
        prop: "new",
      });
    });

    it("handles undefined and null values", () => {
      const result = { a: 1, b: 2 };
      const source = { a: undefined, b: null, c: "value" };
      const keys = ["a", "b", "c"];

      combineHelper(result, keys, source);

      expect(result).toEqual({
        a: undefined,
        b: null,
        c: "value",
      });
    });

    it("handles missing keys gracefully", () => {
      const result = { existing: "value" };
      const source = { a: 1 };
      const keys = ["a", "nonExistent"];

      combineHelper(result, keys, source);

      expect(result).toEqual({
        a: 1,
        existing: "value",
        nonExistent: undefined,
      });
    });
  });

  describe("Symbol Property Handling", () => {
    it("copies symbol properties", () => {
      const sym1 = Symbol("test1");
      const sym2 = Symbol("test2");
      const result = { normalProp: "value" };
      const source = { [sym1]: "symbol1", [sym2]: 42 };
      const keys = [sym1, sym2];

      combineHelper(result, keys, source);

      expect(result).toEqual({
        normalProp: "value",
        [sym1]: "symbol1",
        [sym2]: 42,
      });
    });

    it("handles mixed string and symbol keys", () => {
      const sym = Symbol("mixed");
      const result = { str: "original" };
      const source = { num: 123, str: "updated", [sym]: "symbolValue" };
      const keys = ["str", sym, "num"];

      combineHelper(result, keys, source);

      expect(result).toEqual({
        num: 123,
        str: "updated",
        [sym]: "symbolValue",
      });
    });
  });

  describe("Dictionary vs Non-Dictionary Handling", () => {
    it("replaces non-dictionary values with source values", () => {
      const result = { prop: "string" };
      const source = { prop: 42 };
      const keys = ["prop"];

      combineHelper(result, keys, source);

      expect(result.prop).toBe(42);
    });

    it("replaces arrays with source arrays", () => {
      const result = { arr: [1, 2] };
      const source = { arr: [3, 4, 5] };
      const keys = ["arr"];

      combineHelper(result, keys, source);

      expect(result.arr).toEqual([3, 4, 5]);
      expect(result.arr).toBe(source.arr);
    });

    it("recursively combines dictionary objects", () => {
      const result = {
        nested: {
          a: 1,
          b: 2,
        },
      };
      const source = {
        nested: {
          b: 3,
          c: 4,
        },
      };
      const keys = ["nested"];

      combineHelper(result, keys, source);

      expect(result.nested).toEqual({
        a: 1,
        b: 3,
        c: 4,
      });
      expect(result.nested).not.toBe(source.nested);
    });

    it("handles mixed dictionary and non-dictionary properties", () => {
      const result = {
        num: 1,
        obj: { keep: "this" },
        str: "original",
      };
      const source = {
        num: 2,
        obj: { add: "new", keep: "updated" },
        str: "replaced",
      };
      const keys = ["obj", "str", "num"];

      combineHelper(result, keys, source);

      expect(result).toEqual({
        num: 2,
        obj: { add: "new", keep: "updated" },
        str: "replaced",
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles empty keys array", () => {
      const result = { existing: "value" };
      const source = { ignored: "this" };
      const keys: string[] = [];

      combineHelper(result, keys, source);

      expect(result).toEqual({ existing: "value" });
    });

    it("handles null and undefined target values", () => {
      const result = { nullProp: null, undefinedProp: undefined };
      const source = {
        nullProp: { newObj: "value" },
        undefinedProp: { anotherObj: "value" },
      };
      const keys = ["nullProp", "undefinedProp"];

      combineHelper(result, keys, source);

      expect(result.nullProp).toBe(source.nullProp);
      expect(result.undefinedProp).toBe(source.undefinedProp);
    });

    it("handles function properties", () => {
      const fn1 = () => "original";
      const fn2 = () => "replacement";
      const result = { func: fn1 };
      const source = { func: fn2 };
      const keys = ["func"];

      combineHelper(result, keys, source);

      expect(result.func).toBe(fn2);
    });

    it("handles Date objects", () => {
      const date1 = new Date("2023-01-01");
      const date2 = new Date("2023-12-31");
      const result = { date: date1 };
      const source = { date: date2 };
      const keys = ["date"];

      combineHelper(result, keys, source);

      expect(result.date).toBe(date2);
    });

    it("handles RegExp objects", () => {
      const regex1 = /old/g;
      const regex2 = /new/i;
      const result = { pattern: regex1 };
      const source = { pattern: regex2 };
      const keys = ["pattern"];

      combineHelper(result, keys, source);

      expect(result.pattern).toBe(regex2);
    });
  });

  describe("Cyclic Reference Handling", () => {
    it("handles circular references by delegating to combine", () => {
      type Nested = {
        circular?: Nested | null;
        value: string;
      };
      type ResultType = {
        nested: Nested;
      };

      const result: ResultType = {
        nested: {
          circular: null,
          value: "original",
        },
      };

      // Create source with cyclic reference
      const source: ResultType = {
        nested: {
          circular: null,
          value: "updated",
        },
      };
      source.nested.circular = source.nested;

      const keys = ["nested"];

      combineHelper(result, keys, source);

      expect(result.nested.value).toBe("updated");
      // combineHelper calls combine internally, which preserves circular structure
      expect(result.nested.circular).toStrictEqual(
        expect.objectContaining({
          value: "updated",
        })
      );
    });

    it("merges dictionaries and assigns primitives directly", () => {
      const sharedObj = { shared: "value" };
      const result = {
        prop1: { old: "data" },
        prop2: { other: "data" },
      };
      const source = {
        prop1: sharedObj,
        prop2: sharedObj,
      };
      const keys = ["prop1", "prop2"];

      combineHelper(result, keys, source);

      // When both target and source are dictionaries, they get merged
      expect(result.prop1).toEqual({ old: "data", shared: "value" });
      expect(result.prop2).toEqual({ other: "data", shared: "value" });

      // They are no longer the same reference as sharedObj due to merging
      expect(result.prop1).not.toBe(sharedObj);
      expect(result.prop2).not.toBe(sharedObj);
    });
  });

  describe("Deep Nested Combining", () => {
    it("handles deeply nested object structures", () => {
      type ResultType = {
        level1: {
          level2: {
            level3: {
              add?: string;
              keep?: string;
              value: string;
            };
            newLevel3?: {
              fresh: string;
            };
          };
        };
      };

      const result: ResultType = {
        level1: {
          level2: {
            level3: {
              keep: "this",
              value: "original",
            },
          },
        },
      };

      const source: ResultType = {
        level1: {
          level2: {
            level3: {
              add: "new",
              value: "updated",
            },
            newLevel3: {
              fresh: "data",
            },
          },
        },
      };
      const keys = ["level1"];

      combineHelper(result, keys, source);

      expect(result.level1.level2.level3).toEqual({
        add: "new",
        keep: "this",
        value: "updated",
      });
      expect(result.level1.level2.newLevel3).toEqual({
        fresh: "data",
      });
    });

    it("handles complex mixed structures", () => {
      type ResultType = {
        config: {
          metadata: string;
          newSection?: {
            data: string;
          };
          settings: {
            features?: string[];
            locale?: string;
            theme: string;
          };
        };
      };

      const result: ResultType = {
        config: {
          metadata: "original",
          settings: {
            features: ["old"],
            theme: "dark",
          },
        },
      };

      const source: ResultType = {
        config: {
          metadata: "updated",
          newSection: {
            data: "fresh",
          },
          settings: {
            locale: "en",
            theme: "light",
          },
        },
      };

      const keys = ["config"];

      combineHelper(result, keys, source);

      expect(result.config.settings).toEqual({
        features: ["old"],
        locale: "en",
        theme: "light",
      });
      expect(result.config.metadata).toBe("updated");
      expect(result.config.newSection).toEqual({ data: "fresh" });
    });
  });

  describe("Property Descriptor Preservation", () => {
    it("copies properties regardless of descriptor configuration", () => {
      type ResultType = {
        normal?: string;
        special?: string;
      };

      const result: ResultType = { normal: "value" };
      const source: ResultType = {};

      // Define property with custom descriptor
      Object.defineProperty(source, "special", {
        configurable: true,
        enumerable: true,
        value: "special value",
        writable: false,
      });

      const keys = ["special"];

      combineHelper(result, keys, source);

      expect(result.special).toBe("special value");
    });

    it("handles non-enumerable properties when explicitly listed", () => {
      type ResultType = {
        existing?: string;
        hidden?: string;
      };

      const result: ResultType = { existing: "value" };
      const source: ResultType = {};

      Object.defineProperty(source, "hidden", {
        configurable: true,
        enumerable: false,
        value: "hidden value",
      });

      const keys = ["hidden"];

      combineHelper(result, keys, source);

      expect(result.hidden).toBe("hidden value");
    });
  });

  describe("Type Safety Edge Cases", () => {
    it("handles source properties that are not objects correctly", () => {
      const result = {
        willBeReplaced: {
          nested: "object",
        },
      };
      const source = {
        willBeReplaced: "now a string",
      };
      const keys = ["willBeReplaced"];

      combineHelper(result, keys, source);

      expect(result.willBeReplaced).toBe("now a string");
    });

    it("handles numeric keys as strings", () => {
      const result = { existing: "value" };
      const source = { 0: "zero", 1: "one" };
      const keys = ["0", "1"];

      combineHelper(result, keys, source);

      expect(result).toEqual({
        "0": "zero",
        "1": "one",
        existing: "value",
      });
    });
  });
});
