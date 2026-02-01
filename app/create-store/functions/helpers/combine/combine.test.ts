import { describe, expect, expectTypeOf, it } from "vitest";

import { combine } from "./index";

describe("combine", () => {
  describe("Basic Merging with Spread", () => {
    it("should merge multiple objects using spread syntax", () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 3, c: 4 };
      const obj3 = { c: 5, d: 6 };

      const result = combine(obj1, obj2, obj3);

      expect(result).toEqual({ a: 1, b: 3, c: 5, d: 6 });
      expect(result).not.toBe(obj1);
      expect(result).not.toBe(obj2);
      expect(result).not.toBe(obj3);
    });

    it("should handle single object", () => {
      const obj = { a: 1, b: 2 };
      const result = combine(obj);

      expect(result).toEqual({ a: 1, b: 2 });
      expect(result).toBe(obj);
    });

    it("should handle empty arguments", () => {
      const result = combine();

      expect(result).toEqual({});
    });

    it("should handle two objects", () => {
      const obj1 = { a: 1 };
      const obj2 = { b: 2 };

      const result = combine(obj1, obj2);

      expect(result).toEqual({ a: 1, b: 2 });
    });
  });

  describe("Basic Property Copying", () => {
    it("copies string properties from source to result", () => {
      const result = { existing: "value" };
      const source = { another: 42, newProp: "new" };

      combine(result, source);

      expect(result).toEqual({
        another: 42,
        existing: "value",
        newProp: "new",
      });
    });

    it("replaces existing properties", () => {
      const result = { keep: "unchanged", prop: "old" };
      const source = { prop: "new" };

      combine(result, source);

      expect(result).toEqual({
        keep: "unchanged",
        prop: "new",
      });
    });

    it("handles undefined and null values", () => {
      const result = { a: 1, b: 2 };
      const source = { a: undefined, b: null, c: "value" };

      combine(result, source);

      expect(result).toEqual({
        a: undefined,
        b: null,
        c: "value",
      });
    });

    it("handles missing keys gracefully", () => {
      const result = { existing: "value" };
      const source = { a: 1 };

      combine(result, source);

      expect(result).toEqual({
        a: 1,
        existing: "value",
        nonExistent: undefined,
      });
    });
  });

  describe("Deep Merging with Spread", () => {
    it("should deeply merge nested objects", () => {
      const obj1 = {
        config: {
          features: { auth: true },
          theme: "light",
        },
      };

      const obj2 = {
        config: {
          features: { notifications: false },
          timeout: 5000,
        },
      };

      const obj3 = {
        config: {
          features: { analytics: true },
          theme: "dark",
        },
      };

      const result = combine(obj1, obj2, obj3);

      expect(result).toEqual({
        config: {
          features: {
            analytics: true,
            auth: true,
            notifications: false,
          },
          theme: "dark",
          timeout: 5000,
        },
      });
    });

    it("should handle many objects", () => {
      const objects = Array.from({ length: 10 }, (_, i) => ({
        [`prop${i}`]: i,
        shared: i,
      }));

      const result = combine(...objects);

      expect(result.prop0).toBe(0);
      expect(result.prop9).toBe(9);
      expect(result.shared).toBe(9); // Last value wins
      expect(Object.keys(result)).toHaveLength(11); // prop0-prop9 + shared

      expectTypeOf(result.shared).toEqualTypeOf<number>();
      expectTypeOf(result).toEqualTypeOf<{
        [k: string]: number;
        shared: number;
      }>();
    });
  });

  describe("Immutability with Spread", () => {
    it("should not modify original objects", () => {
      const obj1 = { a: 1, nested: { x: 10 } };
      const obj2 = { b: 2, nested: { y: 20 } };
      const obj3 = { c: 3 };

      const obj1Copy = JSON.parse(JSON.stringify(obj1));
      const obj2Copy = JSON.parse(JSON.stringify(obj2));
      const obj3Copy = JSON.parse(JSON.stringify(obj3));

      combine(obj1, obj2, obj3);

      expect(obj1).toEqual(obj1Copy);
      expect(obj2).toEqual(obj2Copy);
      expect(obj3).toEqual(obj3Copy);
    });

    it("should create independent result object", () => {
      const obj1 = { config: { timeout: 1000 } };
      const obj2 = { config: { retries: 3 } };

      const result = combine(obj1, obj2);

      result.config.timeout = 9999;
      result.config.retries = 9999;

      expect(obj1.config.timeout).toBe(1000);
      expect(obj2.config.retries).toBe(3);
    });
  });

  describe("Circular References with Spread", () => {
    it("should handle circular references in spread objects", () => {
      const obj1: any = { a: 1 };
      obj1.self = obj1;

      const obj2 = { b: 2 };

      const result = combine(obj1, obj2);

      expect(result.a).toBe(1);
      expect(result.b).toBe(2);
      expect(result.self.a).toBe(1);
      expect(result.self.b).toBe(2);
    });
  });

  describe("Special Values with Spread", () => {
    it("should handle mixed data types", () => {
      const obj1 = { date: new Date("2023-01-01"), str: "hello" };
      const obj2 = { bool: true, num: 42 };
      const obj3 = { arr: [1, 2, 3], regex: /test/i };

      const result = combine(obj1, obj2, obj3);

      expect(result.str).toBe("hello");
      expect(result.num).toBe(42);
      expect(result.bool).toBe(true);
      expect(result.date).toEqual(new Date("2023-01-01"));
      expect(result.regex).toEqual(/test/i);
      expect(result.arr).toEqual([1, 2, 3]);
    });

    it("should handle functions across multiple objects", () => {
      const fn1 = () => "first";
      const fn2 = () => "second";
      const fn3 = () => "third";

      const obj1 = { action: fn1, helper: fn1 };
      const obj2 = { action: fn2, utility: fn2 };
      const obj3 = { action: fn3 };

      const result = combine(obj1, obj2, obj3);

      expect(result.action).toBe(fn3);
      expect(result.helper).toBe(fn1);
      expect(result.utility).toBe(fn2);
      expect(result.action()).toBe("third");
    });
  });

  describe("Edge Cases with Spread", () => {
    it("should handle objects with symbol properties", () => {
      const sym1 = Symbol("sym1");
      const sym2 = Symbol("sym2");
      const sym3 = Symbol("sym3");

      const obj1 = { regular: "prop", [sym1]: "first" };
      const obj2 = { [sym2]: "second" };
      const obj3 = { [sym1]: "overridden", [sym3]: "third" };

      const result = combine(obj1, obj2, obj3);

      expect(result.regular).toBe("prop");
      expect(result[sym1]).toBe("overridden");
      expect(result[sym2]).toBe("second");
      expect(result[sym3]).toBe("third");
    });

    it("should handle precedence - later objects override earlier ones", () => {
      const obj1 = { name: "first", value: 1 };
      const obj2 = { type: "second", value: 2 };
      const obj3 = { status: "third", value: 3 };

      const result = combine(obj1, obj2, obj3);

      expect(result.value).toBe(3);
      expect(result.name).toBe("first");
      expect(result.type).toBe("second");
      expect(result.status).toBe("third");
    });
  });

  describe("Symbol Property Handling", () => {
    it("copies symbol properties", () => {
      const sym1 = Symbol("test1");
      const sym2 = Symbol("test2");
      const result = { normalProp: "value" };
      const source = { [sym1]: "symbol1", [sym2]: 42 };

      combine(result, source);

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

      combine(result, source);

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

      combine(result, source);

      expect(result.prop).toBe(42);
    });

    it("replaces arrays with source arrays", () => {
      const result = { arr: [1, 2] };
      const source = { arr: [3, 4, 5] };

      combine(result, source);

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

      combine(result, source);

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

      combine(result, source);

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

      combine(result, source);

      expect(result).toEqual({ existing: "value" });
    });

    it("handles null and undefined target values", () => {
      const result = { nullProp: null, undefinedProp: undefined };
      const source = {
        nullProp: { newObj: "value" },
        undefinedProp: { anotherObj: "value" },
      };

      combine(result, source);

      expect(result.nullProp).toBe(source.nullProp);
      expect(result.undefinedProp).toBe(source.undefinedProp);
    });

    it("handles function properties", () => {
      const fn1 = () => "original";
      const fn2 = () => "replacement";
      const result = { func: fn1 };
      const source = { func: fn2 };

      combine(result, source);

      expect(result.func).toBe(fn2);
    });

    it("handles Date objects", () => {
      const date1 = new Date("2023-01-01");
      const date2 = new Date("2023-12-31");
      const result = { date: date1 };
      const source = { date: date2 };

      combine(result, source);

      expect(result.date).toBe(date2);
    });

    it("handles RegExp objects", () => {
      const regex1 = /old/g;
      const regex2 = /new/i;
      const result = { pattern: regex1 };
      const source = { pattern: regex2 };

      combine(result, source);

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

      combine(result, source);

      expect(result.nested.value).toBe("updated");
      // combine calls combine internally, which preserves circular structure
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

      combine(result, source);

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

      combine(result, source);

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

      combine(result, source);

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

      combine(result, source);

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

      combine(result, source);

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

      combine(result, source);

      expect(result.willBeReplaced).toBe("now a string");
    });

    it("handles numeric keys as strings", () => {
      const result = { existing: "value" };
      const source = { 0: "zero", 1: "one" };

      combine(result, source);

      expect(result).toEqual({
        "0": "zero",
        "1": "one",
        existing: "value",
      });
    });
  });
});
