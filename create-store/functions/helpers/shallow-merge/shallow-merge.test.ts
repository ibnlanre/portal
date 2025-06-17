import { describe, expect, it } from "vitest";

import { shallowMerge } from "./index";

describe("shallowMerge", () => {
  it("should merge properties from source to target", () => {
    const target = { a: 1 };
    const source = { b: 2 };
    const result = shallowMerge(target, source);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("should override properties in target with properties from source", () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3 };
    const result = shallowMerge(target, source);
    expect(result).toEqual({ a: 1, b: 3 });
  });

  it("should not modify the source object", () => {
    const target = { a: 1 };
    const source = { b: 2 };
    shallowMerge(target, source);
    expect(source).toEqual({ b: 2 });
  });

  it("should modify the target object", () => {
    const target = { a: 1 };
    const source = { b: 2 };
    const result = shallowMerge(target, source);

    expect(result).toEqual({ a: 1, b: 2 });
    expect(result).toBe(target);
    expect(result).not.toBe(source);
  });

  it("should handle empty target object", () => {
    const target = {};
    const source = { b: 2 };
    const result = shallowMerge(target, source);
    expect(result).toEqual({ b: 2 });
  });

  it("should handle empty source object", () => {
    const target = { a: 1 };
    const source = {};
    const result = shallowMerge(target, source);
    expect(result).toEqual({ a: 1 });
  });

  it("should handle both target and source being empty objects", () => {
    const target = {};
    const source = {};
    const result = shallowMerge(target, source);
    expect(result).toEqual({});
  });

  it("should not remove getters and setters from target", () => {
    const target = {
      _a: 1,
      get a() {
        return this._a;
      },
      set a(value: number) {
        this._a = value;
      },
    };

    const source = {
      _b: 2,
      get b() {
        return this._b;
      },
      set b(value: number) {
        this._b = value;
      },
    };

    const result = shallowMerge(target, source);

    expect(result).toHaveProperty("a");
    expect(result.a).toBe(1);

    result.a = 3;
    expect(result._a).toBe(3);

    expect(result).toHaveProperty("b");
    expect(result.b).toBe(2);

    result.b = 3;
    expect(result._b).toBe(3);
  });
});
