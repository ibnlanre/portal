import type { Merge } from "./index";

import { describe, expectTypeOf, it } from "vitest";

describe("Merge type", () => {
  it("should merge source object with target when source is an object", () => {
    type Target = { a: string };
    type Source = { b: number };
    type Result = Merge<Target, Source>;

    expectTypeOf<Result>().toMatchObjectType<{ a: string; b: number }>();
  });

  it("should return source when source is not an object", () => {
    type Target = { a: string };
    type Source = string;
    type Result = Merge<Target, Source>;

    expectTypeOf<Result>().toEqualTypeOf<string>();
  });

  it("should handle primitive source types", () => {
    type Target = { a: string };

    expectTypeOf<Merge<Target, number>>().toEqualTypeOf<number>();
    expectTypeOf<Merge<Target, boolean>>().toEqualTypeOf<boolean>();
    expectTypeOf<Merge<Target, null>>().toEqualTypeOf<null>();
    expectTypeOf<Merge<Target, undefined>>().toEqualTypeOf<undefined>();
  });

  it("should handle overlapping properties", () => {
    type Target = { a: string; b: string };
    type Source = { b: number; c: boolean };
    type Result = Merge<Target, Source>;

    expectTypeOf<Result>().toMatchObjectType<{
      a: string;
      b: never;
      c: boolean;
    }>();
  });

  it("should handle empty objects", () => {
    type Target = { a: string };
    type Source = {};
    type Result = Merge<Target, Source>;

    expectTypeOf<Result>().toEqualTypeOf<{ a: string }>();
  });
});
