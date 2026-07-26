import type { Join } from "./index";

import { describe, expectTypeOf, it } from "vitest";

describe("Join", () => {
  it("should join components with the default delimiter '.'", () => {
    type Result = Join<["a", "b", "c"]>;
    expectTypeOf<Result>().toEqualTypeOf<"a.b.c">();
  });

  it("should join components with a custom delimiter", () => {
    type Result = Join<["a", "b", "c"], "-">;
    expectTypeOf<Result>().toEqualTypeOf<"a-b-c">();
  });

  it("should return an empty string for an empty array", () => {
    type Result = Join<[]>;
    expectTypeOf<Result>().toEqualTypeOf<"">();
  });

  it("should skip empty strings in the components", () => {
    type Result = Join<["a", "", "c"]>;
    expectTypeOf<Result>().toEqualTypeOf<"a.c">();
  });

  it("should return the single component if the array has one element", () => {
    type Result = Join<["a"]>;
    expectTypeOf<Result>().toEqualTypeOf<"a">();
  });

  it("should handle an array with only empty strings", () => {
    type Result = Join<["", "", ""]>;
    expectTypeOf<Result>().toEqualTypeOf<"">();
  });
});
