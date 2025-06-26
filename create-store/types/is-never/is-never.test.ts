import type { IsNever } from "./index";

import { describe, expectTypeOf, it } from "vitest";

describe("IsNever", () => {
  it("should return 1 when type is never", () => {
    expectTypeOf<IsNever<never>>().toEqualTypeOf<1>();
  });

  it("should return 0 when type is not never", () => {
    expectTypeOf<IsNever<string>>().toEqualTypeOf<0>();
  });

  it("should return 0 for any other type", () => {
    expectTypeOf<IsNever<undefined>>().toEqualTypeOf<0>();
    expectTypeOf<IsNever<null>>().toEqualTypeOf<0>();
    expectTypeOf<IsNever<number>>().toEqualTypeOf<0>();
    expectTypeOf<IsNever<boolean>>().toEqualTypeOf<0>();
    expectTypeOf<IsNever<object>>().toEqualTypeOf<0>();
    expectTypeOf<IsNever<Function>>().toEqualTypeOf<0>();
  });
});
