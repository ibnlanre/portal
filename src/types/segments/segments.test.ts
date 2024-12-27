import { describe, expectTypeOf, it } from "vitest";
import type { Segments } from ".";

describe("Segments type", () => {
  it("should correctly infer types for nested objects", () => {
    type Result = Segments<{
      a: {
        b?: {
          c: {
            4: number;
          };
        };
      };
    }>;

    type Expected = ["a"] | ["a", "b"] | ["a", "b", "c"] | ["a", "b", "c", 4];
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });

  it("should handle optional properties", () => {
    type Result = Segments<{
      a?: {
        b: {
          c?: {
            d: string;
          };
        };
      };
    }>;

    type Expected = ["a"] | ["a", "b"] | ["a", "b", "c"] | ["a", "b", "c", "d"];
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });

  it("should handle arrays within the dictionary", () => {
    type Result = Segments<{
      a: {
        b: {
          c: number[];
        };
      };
    }>;

    type Expected = ["a"] | ["a", "b"] | ["a", "b", "c"];
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });
});
