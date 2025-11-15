import type { Segments } from "./index";

import { describe, expectTypeOf, it } from "vitest";

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

    type Expected = ["a", "b", "c", 4] | ["a", "b", "c"] | ["a", "b"] | ["a"];
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

    type Expected = ["a", "b", "c", "d"] | ["a", "b", "c"] | ["a", "b"] | ["a"];
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

    type Expected = ["a", "b", "c"] | ["a", "b"] | ["a"];
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });
});
