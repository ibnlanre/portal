import type { Split } from "./index";

import { describe, expectTypeOf, it } from "vitest";

describe("Split", () => {
  it("should split a string by dots", () => {
    type Result = Split<"a.b.c">;
    type Expected = ["a", "b", "c"];
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });

  it("should handle numbers in the string", () => {
    type Result = Split<"a.42.c">;
    type Expected = ["a", 42, "c"];
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });

  it("should return an empty array for an empty string", () => {
    type Result = Split<"">;
    type Expected = [];
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });

  it("should handle a single segment string", () => {
    type Result = Split<"segment">;
    type Expected = ["segment"];
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });
});
