import type { CompositeStore } from "@/create-store/types/composite-store";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";

import { expectTypeOf } from "vitest";
import { describe, it } from "vitest";

import { createStore } from "./index";

describe("createStore - Type Tests", () => {
  describe("Primitive store inference", () => {
    it("should return PrimitiveStore<number> for a number value", () => {
      const store = createStore(0);
      expectTypeOf(store).toExtend<PrimitiveStore<number>>();
    });

    it("should return PrimitiveStore<string> for a string value", () => {
      const store = createStore("");
      expectTypeOf(store).toExtend<PrimitiveStore<string>>();
    });

    it("should return PrimitiveStore<boolean> for a boolean value", () => {
      const store = createStore(false);
      expectTypeOf(store).toExtend<PrimitiveStore<boolean>>();
    });

    it("should return PrimitiveStore<null> for null", () => {
      const store = createStore(null);
      expectTypeOf(store).toExtend<PrimitiveStore<null>>();
    });

    it("should return PrimitiveStore<Date> for a Date value", () => {
      const store = createStore(new Date(0));
      expectTypeOf(store).toExtend<PrimitiveStore<Date>>();
    });

    it("should return PrimitiveStore<RegExp> for a RegExp value", () => {
      const store = createStore(/./u);
      expectTypeOf(store).toExtend<PrimitiveStore<RegExp>>();
    });

    it("should return PrimitiveStore<number[]> for an array value", () => {
      const store = createStore<number[]>([1, 2, 3]);
      expectTypeOf(store.$get()).toEqualTypeOf<number[]>();
    });

    it("should return PrimitiveStore<Set<string>> for a Set value", () => {
      const store = createStore(new Set<string>());
      expectTypeOf(store.$get()).toEqualTypeOf<Set<string>>();
    });

    it("should return PrimitiveStore<Map<string, number>> for a Map value", () => {
      const store = createStore(new Map<string, number>());
      expectTypeOf(store.$get()).toEqualTypeOf<Map<string, number>>();
    });
  });

  describe("Composite store inference", () => {
    it("should return CompositeStore for a plain object value", () => {
      const store = createStore({ count: 0, name: "" });

      expectTypeOf(store).toExtend<
        CompositeStore<{
          count: number;
          name: string;
        }>
      >();
    });

    it("should return CompositeStore for a nested object value", () => {
      const store = createStore({
        settings: { notifications: false, theme: "" },
        user: { age: 0, name: "" },
      });

      expectTypeOf(store).toExtend<
        CompositeStore<{
          settings: { notifications: boolean; theme: string };
          user: { age: number; name: string };
        }>
      >();
    });

    it("should return CompositeStore for objects with function properties", () => {
      const store = createStore({
        count: 0,
        decrement: () => {},
        increment: () => {},
      });

      expectTypeOf(store).toExtend<
        CompositeStore<{
          count: number;
          decrement: () => void;
          increment: () => void;
        }>
      >();
    });

    it("should expose function properties as methods", () => {
      const store = createStore({
        count: 0,
        increment: () => {},
        reset: () => {},
      });

      expectTypeOf(store.increment).toEqualTypeOf<() => void>();
      expectTypeOf(store.reset).toEqualTypeOf<() => void>();
    });
  });

  describe("Edge cases and explicit typing", () => {
    it("should support explicit primitive state types", () => {
      const store = createStore<number | string>(0);
      expectTypeOf(store.$get()).toEqualTypeOf<number | string>();
    });

    it("should support explicit object state types", () => {
      const store = createStore<{
        optional: string | undefined;
        required: string;
      }>({
        optional: undefined,
        required: "",
      });
      expectTypeOf(store.$get()).toEqualTypeOf<{
        optional: string | undefined;
        required: string;
      }>();
    });

    it("should preserve generic object shape", () => {
      interface GenericStore<T> {
        value: T;
      }

      const stringStore = createStore({ value: "" });
      expectTypeOf(stringStore.$get()).toExtend<GenericStore<string>>();
      expectTypeOf(stringStore.$get().value).toExtend<string>();

      const numberStore = createStore({ value: 0 });
      expectTypeOf(numberStore.$get()).toExtend<GenericStore<number>>();
      expectTypeOf(numberStore.$get().value).toExtend<number>();
    });
  });

  describe("Store accessor types", () => {
    it("should have correct accessor types for primitive stores", () => {
      const store = createStore(0);

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
      const store = createStore({ count: 0, name: "" });

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

  describe("Real-world edge cases", () => {
    it("record-shaped object produces a CompositeStore", () => {
      const store = createStore<Record<string, number>>({});
      expectTypeOf(store.$get()).toEqualTypeOf<Record<string, number>>();
    });

    it("array value produces a PrimitiveStore since arrays are not plain objects", () => {
      const store = createStore<number[]>([1, 2, 3]);
      expectTypeOf(store.$get()).toEqualTypeOf<number[]>();
    });

    it("explicit union state types produce a PrimitiveStore", () => {
      const store = createStore<number | { a: number }>(0);
      expectTypeOf(store.$get()).toEqualTypeOf<number | { a: number }>();
    });

    it("object value types as a CompositeStore", () => {
      const store = createStore({ value: 0 });
      expectTypeOf(store).toExtend<CompositeStore<{ value: number }>>();
    });
  });

  describe("Dispatch overloads", () => {
    it("object value produces CompositeStore", () => {
      const store = createStore({ value: 0 });
      expectTypeOf(store).toExtend<CompositeStore<{ value: number }>>();
    });

    it("primitive value produces PrimitiveStore", () => {
      const store = createStore(42);
      expectTypeOf(store).toExtend<PrimitiveStore<number>>();
    });

    it("return is always a store, never a Promise", () => {
      const store = createStore({ value: 0 });
      expectTypeOf(store).not.toMatchTypeOf<Promise<unknown>>();
    });
  });
});
