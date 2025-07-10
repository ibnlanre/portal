import { describe, expect, it } from "vitest";

import { stringify } from "./index";

describe("stringify", () => {
  it("stringifies primitives", () => {
    expect(stringify(42)).toBe("42");
    expect(stringify(true)).toBe("true");
    expect(stringify(false)).toBe("false");
    expect(stringify(undefined)).toBe("undefined");
    expect(stringify(null)).toBe("null");
    expect(stringify("hello")).toBe('"hello"');
    expect(stringify('he"llo')).toBe('"he\\"llo"');
    expect(stringify("he\\llo")).toBe('"he\\\\llo"');
    expect(stringify(123n)).toBe("123");
    expect(stringify(Symbol("sym")).startsWith("Symbol(")).toBe(true);
  });

  it("stringifies functions", () => {
    function foo() {}
    expect(stringify(foo)).toBe("Function(function foo() { })");
    const anon = () => {};
    expect(stringify(anon)).toBe("Function(() => { })");
  });

  it("stringifies Date, RegExp, and Error", () => {
    const date = new Date("2020-01-01T00:00:00.000Z");
    expect(stringify(date)).toBe('Date("2020-01-01T00:00:00.000Z")');
    expect(stringify(/abc/gi)).toBe("/abc/gi");
    expect(stringify(new Error("fail"))).toBe('Error("fail")');
  });

  it("stringifies arrays", () => {
    expect(stringify([])).toBe("[]");
    expect(stringify([1, 2, 3])).toBe("[1,2,3]");
    expect(stringify(["b", "a"])).toBe('["a","b"]');
    expect(stringify([3, 1, 2])).toBe("[1,2,3]");
    expect(stringify([null, undefined, false])).toBe("[false,null,undefined]");
  });

  it("stringifies objects", () => {
    expect(stringify({})).toBe("{}");
    expect(stringify({ a: 1, b: 2 })).toBe("{a:1,b:2}");
    expect(stringify({ a: 1, b: 2 })).toBe("{a:1,b:2}");
    expect(stringify({ baz: [1, 2], foo: "bar" })).toBe(
      '{baz:[1,2],foo:"bar"}'
    );
  });

  it("stringifies nested objects and arrays", () => {
    const obj = { a: [2, 1], b: { c: 3, d: 4 } };
    expect(stringify(obj)).toBe("{a:[1,2],b:{c:3,d:4}}");
  });

  it("stringifies Set", () => {
    expect(stringify(new Set())).toBe("Set()");
    expect(stringify(new Set([1, 2]))).toBe("Set([1,2])");
    expect(stringify(new Set(["a", "b"]))).toBe('Set(["a","b"])');
  });

  it("stringifies Map", () => {
    expect(stringify(new Map())).toBe("Map()");
    const map = new Map([
      ["a", 1],
      ["b", 2],
    ]);
    expect(stringify(map)).toBe('Map([["a",1],["b",2]])');
    const map2 = new Map([
      [1, "a"],
      [2, "b"],
    ]);
    expect(stringify(map2)).toBe('Map([[1,"a"],[2,"b"]])');
  });

  it("handles circular references", () => {
    const obj: { a: number; self?: typeof obj } = { a: 1 };
    obj.self = obj;
    expect(stringify(obj)).toMatch(/\{a:1,self:\[Circular:ref_\d+\]\}/);
  });

  it("handles complex circular structures", () => {
    const a: { b?: typeof b } = {};
    const b: { a: typeof a } = { a };
    a.b = b;
    expect(stringify(a)).toMatch(/\{b:\{a:\[Circular:ref_\d+\]\}\}/);
  });

  it("stringifies objects with special values", () => {
    expect(stringify({ a: undefined, b: null, c: false })).toBe(
      "{a:undefined,b:null,c:false}"
    );
  });
});
