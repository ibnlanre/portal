import type { IsUnknown } from "./index";

import { describe, expectTypeOf, it } from "vitest";

describe("IsUnknown", () => {
  it("should return 1 for unknown type", () => {
    expectTypeOf<IsUnknown<unknown>>().toEqualTypeOf<1>();
  });

  it("should return 0 for any type", () => {
    expectTypeOf<IsUnknown<any>>().toEqualTypeOf<0>();
  });

  it("should return 0 for string type", () => {
    expectTypeOf<IsUnknown<string>>().toEqualTypeOf<0>();
  });

  it("should return 0 for number type", () => {
    expectTypeOf<IsUnknown<number>>().toEqualTypeOf<0>();
  });

  it("should return 0 for boolean type", () => {
    expectTypeOf<IsUnknown<boolean>>().toEqualTypeOf<0>();
  });

  it("should return 0 for object type", () => {
    expectTypeOf<IsUnknown<object>>().toEqualTypeOf<0>();
  });

  it("should return 0 for null type", () => {
    expectTypeOf<IsUnknown<null>>().toEqualTypeOf<0>();
  });

  it("should return 0 for undefined type", () => {
    expectTypeOf<IsUnknown<undefined>>().toEqualTypeOf<0>();
  });

  it("should return 0 for never type", () => {
    expectTypeOf<IsUnknown<never>>().toEqualTypeOf<0>();
  });
});
