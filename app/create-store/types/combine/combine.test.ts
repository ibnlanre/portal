import type { Combine } from "./index";

import { describe, expectTypeOf, it } from "vitest";

describe("Combine type", () => {
  it("should handle empty array", () => {
    type Result = Combine<[]>;
    expectTypeOf<Result>().toEqualTypeOf<{}>();
  });

  it("should return single object as-is", () => {
    type Result = Combine<[{ a: number }]>;
    expectTypeOf<Result>().toEqualTypeOf<{ a: number }>();
  });

  it("should merge two objects", () => {
    type Result = Combine<[{ a: number }, { b: string }]>;
    expectTypeOf<Result>().toEqualTypeOf<{ a: number; b: string }>();
  });

  it("should merge three objects with later overriding earlier", () => {
    type Result = Combine<
      [{ a: number; b: number }, { b: string; c: boolean }, { c: string }]
    >;
    expectTypeOf<Result>().toEqualTypeOf<{
      a: number;
      b: string;
      c: string;
    }>();
  });

  it("should handle nested object merging", () => {
    type Result = Combine<
      [
        { config: { theme: string; timeout: number } },
        { config: { retries: number; theme: "dark" } },
      ]
    >;
    expectTypeOf<Result>().toEqualTypeOf<{
      config: { retries: number; theme: "dark"; timeout: number };
    }>();
  });

  it("should merge many objects", () => {
    type Result = Combine<
      [{ a: 1 }, { b: 2 }, { c: 3 }, { d: 4 }, { e: 5 }, { f: 6 }, { g: 7 }]
    >;
    expectTypeOf<Result>().toEqualTypeOf<{
      a: 1;
      b: 2;
      c: 3;
      d: 4;
      e: 5;
      f: 6;
      g: 7;
    }>();
  });

  it("should handle complex nested structures", () => {
    type Result = Combine<
      [
        { user: { age: number; name: string } },
        { settings: { theme: string }; user: { email: string } },
        { settings: { lang: string; theme: "light" } },
      ]
    >;
    expectTypeOf<Result>().toEqualTypeOf<{
      settings: { lang: string; theme: "light" };
      user: { age: number; email: string; name: string };
    }>();
  });

  it("should handle optional properties", () => {
    type Result = Combine<
      [{ a: number; b?: string }, { b: string; c?: boolean }]
    >;
    expectTypeOf<Result>().toEqualTypeOf<{
      a: number;
      b: string;
      c?: boolean;
    }>();
  });

  it("should handle union types", () => {
    type Result = Combine<
      [{ value: number | string }, { value: boolean | number }]
    >;
    expectTypeOf<Result>().toEqualTypeOf<{ value: boolean | number }>();
  });

  it("should handle arrays", () => {
    type Result = Combine<[{ items: string[] }, { items: number[] }]>;
    expectTypeOf<Result>().toEqualTypeOf<{ items: number[] }>();
  });

  it("should preserve functions", () => {
    type Result = Combine<
      [{ fn: () => string }, { fn: () => number; helper: () => void }]
    >;
    expectTypeOf<Result>().toEqualTypeOf<{
      fn: () => number;
      helper: () => void;
    }>();
  });
});
