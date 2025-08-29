import type { IsAny } from "./index";

import { describe, expectTypeOf, it } from "vitest";

describe("IsAny", () => {
  it("should return 1 for any type", () => {
    expectTypeOf<IsAny<any>>().toEqualTypeOf<1>();
  });

  it("should return 0 for string type", () => {
    expectTypeOf<IsAny<string>>().toEqualTypeOf<0>();
  });

  it("should return 0 for number type", () => {
    expectTypeOf<IsAny<number>>().toEqualTypeOf<0>();
  });

  it("should return 0 for boolean type", () => {
    expectTypeOf<IsAny<boolean>>().toEqualTypeOf<0>();
  });

  it("should return 0 for object type", () => {
    expectTypeOf<IsAny<object>>().toEqualTypeOf<0>();
  });

  it("should return 0 for null type", () => {
    expectTypeOf<IsAny<null>>().toEqualTypeOf<0>();
  });

  it("should return 0 for undefined type", () => {
    expectTypeOf<IsAny<undefined>>().toEqualTypeOf<0>();
  });

  it("should return 0 for unknown type", () => {
    expectTypeOf<IsAny<unknown>>().toEqualTypeOf<0>();
  });

  it("should return 0 for never type", () => {
    expectTypeOf<IsAny<never>>().toEqualTypeOf<0>();
  });

  it("should return 0 for array type", () => {
    expectTypeOf<IsAny<string[]>>().toEqualTypeOf<0>();
  });

  it("should return 0 for function type", () => {
    expectTypeOf<IsAny<() => void>>().toEqualTypeOf<0>();
  });
});
