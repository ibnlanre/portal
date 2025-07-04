import type { StoreValueResolver } from ".";
import type { PrimitiveStore } from "../primitive-store";
import type { CompositeStore } from "@/create-store/types/composite-store";

import { describe, expectTypeOf, it } from "vitest";

describe("StoreValueResolver", () => {
  it("should keep functions as-is", () => {
    type TestFn = () => void;
    expectTypeOf<StoreValueResolver<TestFn>>().toEqualTypeOf<TestFn>();
  });

  it("should wrap primitive values in PrimitiveStore", () => {
    expectTypeOf<StoreValueResolver<string>>().toEqualTypeOf<
      PrimitiveStore<string>
    >();

    expectTypeOf<StoreValueResolver<number>>().toEqualTypeOf<
      PrimitiveStore<number>
    >();

    expectTypeOf<StoreValueResolver<boolean>>().toEqualTypeOf<
      PrimitiveStore<boolean>
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
      PrimitiveStore<"hello">
    >();

    expectTypeOf<StoreValueResolver<123>>().toEqualTypeOf<
      PrimitiveStore<123>
    >();
  });

  it("should handle nullish values", () => {
    expectTypeOf<StoreValueResolver<null>>().toEqualTypeOf<
      PrimitiveStore<null>
    >();

    expectTypeOf<StoreValueResolver<undefined>>().toEqualTypeOf<
      PrimitiveStore<undefined>
    >();
  });

  it("should handle union types", () => {
    expectTypeOf<StoreValueResolver<null | string>>().toEqualTypeOf<
      PrimitiveStore<null | string>
    >();

    expectTypeOf<StoreValueResolver<number | string>>().toEqualTypeOf<
      PrimitiveStore<number | string>
    >();

    expectTypeOf<StoreValueResolver<(() => void) | string>>().toEqualTypeOf<
      PrimitiveStore<(() => void) | string>
    >();

    expectTypeOf<StoreValueResolver<null | { foo: string }>>().toEqualTypeOf<
      PrimitiveStore<null | { foo: string }>
    >();
  });
});
