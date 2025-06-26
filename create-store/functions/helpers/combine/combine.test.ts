import { describe, expect, it } from "vitest";

import { combine } from "./index";

describe("combine", () => {
  describe("Basic Merging", () => {
    it("should merge simple objects", () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };

      const result = combine(target, source);

      expect(result).toEqual({ a: 1, b: 3, c: 4 });
      expect(result).not.toBe(target);
      expect(result).not.toBe(source);
    });

    it("should handle empty objects", () => {
      expect(combine({}, {})).toEqual({});
      expect(combine({ a: 1 }, {})).toEqual({ a: 1 });
      expect(combine({}, { b: 2 })).toEqual({ b: 2 });
    });

    it("should handle non-dictionary source", () => {
      const target = { a: 1, b: 2 };

      expect(combine(target, "string")).toBe("string");
      expect(combine(target, 42)).toBe(42);
      expect(combine(target, null)).toBe(null);
      expect(combine(target, undefined)).toBe(undefined);
      expect(combine(target, true)).toBe(true);
    });
  });

  describe("Deep Merging", () => {
    it("should recursively merge nested objects", () => {
      const target = {
        a: 1,
        nested: {
          deep: {
            value: "original",
          },
          x: 10,
          y: 20,
        },
      };

      const source = {
        b: 2,
        nested: {
          deep: {
            newProp: "added",
            value: "updated",
          },
          y: 99,
          z: 30,
        },
      };

      const result = combine(target, source);

      expect(result).toEqual({
        a: 1,
        b: 2,
        nested: {
          deep: {
            newProp: "added",
            value: "updated",
          },
          x: 10,
          y: 99,
          z: 30,
        },
      });

      expect(result.nested).not.toBe(target.nested);
      expect(result.nested.deep).not.toBe(target.nested.deep);
    });

    it("should handle mixed data types in nested structures", () => {
      const target = {
        config: {
          enabled: true,
          settings: {
            timeout: 1000,
          },
        },
        data: [1, 2, 3],
      };

      const source = {
        config: {
          enabled: false,
          newOption: "added",
          settings: {
            retries: 3,
          },
        },
        metadata: {
          version: "1.0.0",
        },
      };

      const result = combine(target, source);

      expect(result).toEqual({
        config: {
          enabled: false,
          newOption: "added",
          settings: {
            retries: 3,
            timeout: 1000,
          },
        },
        data: [1, 2, 3],
        metadata: {
          version: "1.0.0",
        },
      });
    });

    it("should overwrite non-dictionary values with dictionary sources", () => {
      const target = {
        prop: "string value",
      };

      const source = {
        prop: {
          nested: "object",
        },
      };

      const result = combine(target, source);

      expect(result).toEqual({
        prop: {
          nested: "object",
        },
      });
    });
  });

  describe("Circular References", () => {
    it("should handle circular references in target", () => {
      const target: any = { a: 1 };
      target.self = target;

      const source = { b: 2 };

      const result = combine(target, source);

      expect(result.a).toBe(1);
      expect(result.b).toBe(2);
      expect(result.self).toBe(result);
      expect(result.self.a).toBe(1);
      expect(result.self.b).toBe(2);
    });

    it("should handle circular references in source", () => {
      const target: any = { a: 1 };

      const source: any = { b: 2 };
      source.self = source;

      const result = combine(target, source);

      expect(result.a).toBe(1);
      expect(result.b).toBe(2);
      expect(result.self).toBe(result.self);
      expect(result.self.b).toBe(2);
    });

    it("should handle mutual circular references", () => {
      const objA: any = { name: "A" };
      const objB: any = { name: "B", ref: objA };
      objA.ref = objB;

      const target: any = { first: objA };
      const source = { second: objB };

      const result = combine(target, source);

      expect(result.first.name).toBe("A");
      expect(result.second.name).toBe("B");
      expect(result.first.ref).toBe(result.second);
      expect(result.second.ref).toBe(result.first);
    });

    it("should handle deeply nested circular references", () => {
      const target: any = {
        level1: {
          level2: {
            value: "deep",
          },
        },
      };
      target.level1.level2.backToRoot = target;

      const source = {
        level1: {
          level2: {
            newValue: "added",
          },
        },
      };

      const result = combine(target, source);

      expect(result.level1.level2.value).toBe("deep");
      expect(result.level1.level2.newValue).toBe("added");
      expect(result.level1.level2.backToRoot).toEqual(result);
      expect(result).not.toBe(target);
    });
  });

  describe("Array Handling", () => {
    it("should handle arrays in target and source", () => {
      const target = {
        list: [1, 2, 3],
      };

      const source = {
        list: [4, 5],
      };

      const result = combine(target, source);

      expect(result.list.length).toBe(2);
      expect(result.list[0]).toBe(4);
      expect(result.list[1]).toBe(5);
      expect(result.list).not.toBe(target.list);
      expect(result.list).not.toBe(source.list);
    });

    it("should handle array circular references", () => {
      const arr: any[] = [1, 2];
      arr.push(arr);

      const target = { data: arr };
      const source = { metadata: "info" };

      const result = combine(target, source) as {
        data: any[];
        metadata: string;
      };

      expect(result.data[0]).toBe(1);
      expect(result.data[1]).toBe(2);
      expect(result.data[2]).toBe(result.data);
      expect(result.metadata).toBe("info");
    });
  });

  describe("Special Values", () => {
    it("should handle Date objects", () => {
      const date = new Date("2023-01-01");
      const target = { created: date };
      const source = { updated: new Date("2023-01-02") };

      const result = combine(target, source) as {
        created: Date;
        updated: Date;
      };

      expect(result.created).not.toBe(date);
      expect(result.created).toEqual(date);
      expect(result.updated).toEqual(new Date("2023-01-02"));
    });

    it("should handle RegExp objects", () => {
      const regex = /test/gi;
      const target = { pattern: regex };
      const source = { flags: "added" };

      const result = combine(target, source) as {
        flags: string;
        pattern: RegExp;
      };

      expect(result.pattern).not.toBe(regex);
      expect(result.pattern).toEqual(regex);
      expect(result.flags).toBe("added");
    });

    it("should handle null and undefined values", () => {
      const target = {
        a: null as null | string,
        b: undefined as string | undefined,
        c: "value",
      };

      const source = {
        a: "not null",
        b: "not undefined",
        d: null,
      };

      const result = combine(target, source) as {
        a: string;
        b: string;
        c: string;
        d: null;
      };

      expect(result).toEqual({
        a: "not null",
        b: "not undefined",
        c: "value",
        d: null,
      });
    });

    it("should handle functions", () => {
      const fn1 = () => "target";
      const fn2 = () => "source";

      const target = { func: fn1 };
      const source = { func: fn2, newFunc: fn1 };

      const result = combine(target, source) as {
        func: () => string;
        newFunc: () => string;
      };

      expect(result.func).not.toBe(fn2);
      expect(result.newFunc).not.toBe(fn1);
      expect(result.func()).toBe("source");
      expect(result.newFunc()).toBe("target");
    });
  });

  describe("Symbol and Non-enumerable Properties", () => {
    it("should handle symbol keys", () => {
      const sym1 = Symbol("test1");
      const sym2 = Symbol("test2");

      const target = { regular: "prop", [sym1]: "target value" };
      const source = { regular: "updated", [sym2]: "source value" };

      const result = combine(target, source);

      expect(result[sym1]).toBe("target value");
      expect(result[sym2]).toBe("source value");
      expect(result.regular).toBe("updated");
    });

    it("should preserve non-enumerable properties", () => {
      const target = { regular: "prop" };
      Object.defineProperty(target, "hidden", {
        enumerable: false,
        value: "hidden value",
      });

      const source = { new: "prop", regular: "updated" };

      const result = combine(target, source) as {
        hidden: string;
        new: string;
        regular: string;
      };

      expect(result.regular).toBe("updated");
      expect(result.new).toBe("prop");
      expect(Object.getOwnPropertyDescriptor(result, "hidden")).toBeDefined();
      expect(result.hidden).toBe("hidden value");
    });
  });

  describe("Immutability", () => {
    it("should not modify the original target object", () => {
      const target = {
        a: 1,
        nested: {
          x: 10,
        },
      };

      const targetCopy = JSON.parse(JSON.stringify(target));
      const source = {
        a: 99,
        nested: {
          y: 20,
        },
      };

      combine(target, source);

      expect(target).toEqual(targetCopy);
    });

    it("should not modify the original source object", () => {
      const target = { a: 1 };
      const source = {
        b: 2,
        nested: {
          x: 10,
        },
      };

      const sourceCopy = JSON.parse(JSON.stringify(source));

      combine(target, source);

      expect(source).toEqual(sourceCopy);
    });

    it("should create completely independent objects", () => {
      const target = {
        config: {
          settings: {
            timeout: 1000,
          },
        },
      };

      const source = {
        config: {
          settings: {
            retries: 3,
          },
        },
      };

      const result = combine(target, source) as {
        config: {
          settings: {
            retries: number;
            timeout: number;
          };
        };
      };

      result.config.settings.timeout = 9999;
      result.config.settings.retries = 9999;

      expect(target.config.settings.timeout).toBe(1000);
      expect(source.config.settings.retries).toBe(3);
    });
  });

  describe("Edge Cases", () => {
    it("should handle objects with prototype chain", () => {
      class Parent {
        parentProp = "parent";
      }

      class Child extends Parent {
        childProp = "child";
      }

      const target = new Child() as any;
      const source = { childProp: "updated", newProp: "added" };

      const result = combine(target, source);

      expect(result.childProp).toBe("updated");
      expect(result.newProp).toBe("added");
      expect(result.parentProp).toBe("parent");
    });

    it("should handle very deeply nested objects", () => {
      const createDeepObject = (depth: number): any => {
        if (depth === 0) return { value: "deep" };
        return { nested: createDeepObject(depth - 1) };
      };

      const target = createDeepObject(10);
      const source = createDeepObject(10);
      source.nested.nested.nested.nested.nested.nested.nested.nested.nested.value =
        "updated";

      const result = combine(target, source);

      expect(
        result.nested.nested.nested.nested.nested.nested.nested.nested.nested
          .value
      ).toBe("updated");
    });

    it("should handle objects with many properties", () => {
      const target: Record<string, number> = {};
      const source: Record<string, number> = {};

      for (let i = 0; i < 1000; i++) {
        target[`prop${i}`] = i;
        source[`prop${i + 500}`] = i + 500;
      }

      const result = combine(target, source);

      expect(Object.keys(result)).toHaveLength(1500);
      expect(result.prop0).toBe(0);
      expect(result.prop999).toBe(999);
      expect(result.prop500).toBe(500);
      expect(result.prop1499).toBe(1499);
    });
  });
});
