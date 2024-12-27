import { describe, expectTypeOf, it } from "vitest";
import type { Paths } from ".";

describe("Paths type", () => {
  it("should generate correct paths for nested objects", () => {
    type Result = Paths<{
      a: {
        b: {
          c: {
            d: string;
          };
        };
      };
    }>;

    type Expected = "a" | "a.b" | "a.b.c" | "a.b.c.d";
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });

  it("should generate correct paths for optional nested objects", () => {
    type Result = Paths<{
      a?: {
        b?: {
          e: () => void;
          c?: {
            d?: string;
            f: [number, string];
          };
        };
      };
    }>;

    type Expected = "a" | "a.b" | "a.b.c" | "a.b.c.d" | "a.b.e" | "a.b.c.f";
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });

  it("should generate correct paths for objects with number keys", () => {
    type Result = Paths<{
      1: {
        2: {
          3: string;
        };
      };
    }>;

    type Expected = "1" | "1.2" | "1.2.3";
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });

  it("should generate correct paths for mixed key types", () => {
    type Result = Paths<{
      a: {
        b?: {
          c: {
            4: number;
          };
        };
      };
    }>;

    type Expected = "a" | "a.b" | "a.b.c" | "a.b.c.4";
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });

  it("should generate correct paths for symbols", () => {
    const A = Symbol("a");
    const B = Symbol("b");
    const C = Symbol("c");

    type Result = Paths<{
      [A]: {
        [B]: {
          [C]: number;
        };
      };
    }>;

    type Expected = never;
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });
});
