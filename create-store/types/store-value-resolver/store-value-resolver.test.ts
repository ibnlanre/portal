import type { StoreValueResolver } from ".";
import type { BasicStore } from "@/create-store/types/basic-store";
import type { CompositeStore } from "@/create-store/types/composite-store";

import { describe, expectTypeOf, it } from "vitest";

describe("StoreValueResolver", () => {
  it("should keep functions as-is", () => {
    type TestFn = () => void;
    expectTypeOf<StoreValueResolver<TestFn>>().toEqualTypeOf<TestFn>();
  });

  it("should wrap primitive values in BasicStore", () => {
    expectTypeOf<StoreValueResolver<string>>().toEqualTypeOf<
      BasicStore<string>
    >();
    expectTypeOf<StoreValueResolver<number>>().toEqualTypeOf<
      BasicStore<number>
    >();
    expectTypeOf<StoreValueResolver<boolean>>().toEqualTypeOf<
      BasicStore<boolean>
    >();
  });

  it("should wrap objects in CompositeStore", () => {
    type TestObject = {
      bar: number;
      foo: string;
    };

    expectTypeOf<StoreValueResolver<TestObject>>().toEqualTypeOf<
      CompositeStore<TestObject>
    >();
  });

  it("should widen literal types", () => {
    expectTypeOf<StoreValueResolver<"hello">>().toEqualTypeOf<
      BasicStore<string>
    >();
    expectTypeOf<StoreValueResolver<123>>().toEqualTypeOf<BasicStore<number>>();
  });

  it("should handle nullish values", () => {
    expectTypeOf<StoreValueResolver<null>>().toEqualTypeOf<BasicStore<null>>();

    expectTypeOf<StoreValueResolver<undefined>>().toEqualTypeOf<
      BasicStore<undefined>
    >();
  });

  it("should handle union types", () => {
    expectTypeOf<StoreValueResolver<null | string>>().toEqualTypeOf<
      BasicStore<null | string>
    >();

    expectTypeOf<StoreValueResolver<number | string>>().toEqualTypeOf<
      BasicStore<number | string>
    >();

    expectTypeOf<StoreValueResolver<(() => void) | string>>().toEqualTypeOf<
      BasicStore<(() => void) | string>
    >();

    expectTypeOf<StoreValueResolver<null | { foo: string }>>().toEqualTypeOf<
      BasicStore<null | { foo: string }>
    >();
  });
});
