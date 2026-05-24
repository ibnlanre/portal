import type { CompositeStore } from "@/create-store/types/composite-store";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";
import type { StandardSchema } from "@/create-store/types/schema";

import { expectTypeOf } from "vitest";
import { describe, it } from "vitest";

import { createStore } from "./index";

/**
 * Minimal typed schema factory for type-level tests.
 * The `output` type drives TypeScript overload resolution in `createStore`.
 */
function typed<Output>(output: Output): StandardSchema<unknown, Output> {
  return {
    "~standard": {
      types: { input: undefined as unknown, output },
      validate: () => ({ value: output }),
      vendor: "test",
      version: 1,
    },
  };
}

describe("createStore - Type Tests", () => {
  describe("Primitive store overloads", () => {
    it("should return PrimitiveStore<number> for number schemas", () => {
      const store = createStore(typed(0));
      expectTypeOf(store).toExtend<PrimitiveStore<number>>();
    });

    it("should return PrimitiveStore<string> for string schemas", () => {
      const store = createStore(typed("hello"));
      expectTypeOf(store).toExtend<PrimitiveStore<string>>();
    });

    it("should return PrimitiveStore<boolean> for boolean schemas", () => {
      const store = createStore(typed(true));
      expectTypeOf(store).toExtend<PrimitiveStore<boolean>>();
    });

    it("should return PrimitiveStore<null> for null schemas", () => {
      const store = createStore(typed(null as null));
      expectTypeOf(store).toExtend<PrimitiveStore<null>>();
    });

    it("should return PrimitiveStore<Date> for Date schemas", () => {
      const store = createStore(typed(new Date()));
      expectTypeOf(store).toExtend<PrimitiveStore<Date>>();
    });

    it("should return PrimitiveStore<RegExp> for RegExp schemas", () => {
      const store = createStore(typed(/test/));
      expectTypeOf(store).toExtend<PrimitiveStore<RegExp>>();
    });

    it("should return PrimitiveStore<number[]> for array schemas", () => {
      const store = createStore(typed([] as number[]));
      expectTypeOf(store).toExtend<PrimitiveStore<number[]>>();
    });

    it("should return PrimitiveStore<Set<string>> for Set schemas", () => {
      const store = createStore(typed(new Set<string>()));
      expectTypeOf(store).toExtend<PrimitiveStore<Set<string>>>();
    });

    it("should return PrimitiveStore<Map<string, number>> for Map schemas", () => {
      const store = createStore(typed(new Map<string, number>()));
      expectTypeOf(store).toExtend<PrimitiveStore<Map<string, number>>>();
    });
  });

  describe("Composite store overloads", () => {
    it("should return CompositeStore for plain object schemas", () => {
      const store = createStore(typed({ count: 0, name: "test" }));

      expectTypeOf(store).toExtend<
        CompositeStore<{
          count: number;
          name: string;
        }>
      >();
    });

    it("should return CompositeStore for nested object schemas", () => {
      const store = createStore(
        typed({
          settings: { notifications: true, theme: "dark" },
          user: { age: 30, name: "John" },
        })
      );

      expectTypeOf(store).toExtend<
        CompositeStore<{
          settings: { notifications: boolean; theme: string };
          user: { age: number; name: string };
        }>
      >();
    });

    it("should return CompositeStore for objects with method properties", () => {
      const store = createStore(
        typed({
          count: 0,
          decrement: () => {},
          increment() {},
        })
      );

      expectTypeOf(store).toExtend<
        CompositeStore<{
          count: number;
          decrement: () => void;
          increment(): void;
        }>
      >();
    });
  });

  describe("Edge cases and explicit typing", () => {
    it("should handle union types", () => {
      const store = createStore(typed(42 as number | string));
      expectTypeOf(store).toExtend<PrimitiveStore<number | string>>();
    });

    it("should handle optional properties in object schemas", () => {
      const store = createStore(
        typed({ optional: undefined as string | undefined, required: "value" })
      );
      expectTypeOf(store).toExtend<
        CompositeStore<{ optional: string | undefined; required: string }>
      >();
    });

    it("should handle generic object schemas", () => {
      interface GenericStore<T> {
        value: T;
      }

      const stringStore = createStore(
        typed<GenericStore<string>>({ value: "hello" })
      );
      expectTypeOf(stringStore.$get()).toExtend<GenericStore<string>>();
      expectTypeOf(stringStore.$get().value).toExtend<string>();

      const numberStore = createStore(
        typed<GenericStore<number>>({ value: 42 })
      );
      expectTypeOf(numberStore.$get()).toExtend<GenericStore<number>>();
      expectTypeOf(numberStore.$get().value).toExtend<number>();
    });
  });

  describe("Store accessor types", () => {
    it("should have correct accessor types for primitive stores", () => {
      const store = createStore(typed(42));

      expectTypeOf(store.$get).toExtend<
        <Value = number>(
          selector?: ((state: number) => Value) | undefined
        ) => Value
      >();

      expectTypeOf(store.$set).toExtend<
        (value: ((prev: number) => number) | number) => void
      >();

      expectTypeOf(store.$subscribe).toExtend<
        (subscriber: (value: number) => void, immediate?: boolean) => () => void
      >();
    });

    it("should have correct accessor types for composite stores", () => {
      const store = createStore(typed({ count: 0, name: "test" }));

      expectTypeOf(store.count).toExtend<{
        $get: <Value = number>(
          selector?: ((state: number) => Value) | undefined
        ) => Value;
        $set: (value: ((prev: number) => number) | number) => void;
      }>();

      expectTypeOf(store.name).toExtend<{
        $get: <Value = string>(
          selector?: ((state: string) => Value) | undefined
        ) => Value;
        $set: (value: ((prev: string) => string) | string) => void;
      }>();

      expectTypeOf(store.$get).toExtend<
        <Value = { count: number; name: string }>(
          selector?:
            | ((state: { count: number; name: string }) => Value)
            | undefined
        ) => Value
      >();
    });
  });
});
