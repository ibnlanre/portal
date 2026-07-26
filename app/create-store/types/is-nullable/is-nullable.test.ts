import type { IsNullable } from "./index";

import { describe, expectTypeOf, it } from "vitest";

describe("IsNullable", () => {
  describe("should return false for non-nullable types", () => {
    it("should return false for string type", () => {
      expectTypeOf<IsNullable<string>>().toEqualTypeOf<false>();
    });

    it("should return false for number type", () => {
      expectTypeOf<IsNullable<number>>().toEqualTypeOf<false>();
    });

    it("should return false for boolean type", () => {
      expectTypeOf<IsNullable<boolean>>().toEqualTypeOf<false>();
    });

    it("should return false for object type", () => {
      expectTypeOf<IsNullable<object>>().toEqualTypeOf<false>();
    });

    it("should return false for array type", () => {
      expectTypeOf<IsNullable<string[]>>().toEqualTypeOf<false>();
    });

    it("should return false for function type", () => {
      expectTypeOf<IsNullable<() => void>>().toEqualTypeOf<false>();
    });

    it("should return false for never type", () => {
      expectTypeOf<IsNullable<never>>().toEqualTypeOf<false>();
    });

    it("should return false for unknown type", () => {
      expectTypeOf<IsNullable<unknown>>().toEqualTypeOf<false>();
    });
  });

  describe("should return true for nullable types", () => {
    it("should return true for null type", () => {
      expectTypeOf<IsNullable<null>>().toEqualTypeOf<true>();
    });

    it("should return true for undefined type", () => {
      expectTypeOf<IsNullable<undefined>>().toEqualTypeOf<true>();
    });

    it("should return true for union with null", () => {
      expectTypeOf<IsNullable<null | string>>().toEqualTypeOf<true>();
    });

    it("should return true for union with undefined", () => {
      expectTypeOf<IsNullable<string | undefined>>().toEqualTypeOf<true>();
    });

    it("should return true for union with both null and undefined", () => {
      expectTypeOf<
        IsNullable<null | string | undefined>
      >().toEqualTypeOf<true>();
    });

    it("should return true for optional property type", () => {
      type Optional = { prop?: string };
      expectTypeOf<IsNullable<Optional["prop"]>>().toEqualTypeOf<true>();
    });

    it("should return true for nullable object", () => {
      expectTypeOf<
        IsNullable<undefined | { name: string }>
      >().toEqualTypeOf<true>();
    });

    it("should return true for nullable array", () => {
      expectTypeOf<IsNullable<null | string[]>>().toEqualTypeOf<true>();
    });
  });

  describe("should handle any type specially", () => {
    it("should return false for any type", () => {
      expectTypeOf<IsNullable<any>>().toEqualTypeOf<false>();
    });

    it("should distinguish any from undefined", () => {
      type NotAny = undefined;
      expectTypeOf<IsNullable<NotAny>>().toEqualTypeOf<true>();
      expectTypeOf<IsNullable<any>>().toEqualTypeOf<false>();
    });
  });

  describe("should handle complex union types", () => {
    it("should return true for multi-type union with null", () => {
      expectTypeOf<IsNullable<null | number | string>>().toEqualTypeOf<true>();
    });

    it("should return true for multi-type union with undefined", () => {
      expectTypeOf<
        IsNullable<number | string | undefined>
      >().toEqualTypeOf<true>();
    });

    it("should return false for union without null or undefined", () => {
      expectTypeOf<
        IsNullable<boolean | number | string>
      >().toEqualTypeOf<false>();
    });
  });
});
