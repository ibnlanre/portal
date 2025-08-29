/* eslint-disable vitest/expect-expect */

import type { CompositeStore } from "@/create-store/types/composite-store";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";

import { expectTypeOf } from "vitest";
import { describe, it } from "vitest";

import { createStore } from "./index";

describe("createStore - Type Tests", () => {
  describe("Primitive store overloads", () => {
    it("should return PrimitiveStore<undefined> when called with no arguments", () => {
      const store = createStore();
      expectTypeOf(store).toExtend<PrimitiveStore<undefined>>();
    });

    it("should return PrimitiveStore<number> for number primitives", () => {
      const store = createStore(42);
      expectTypeOf(store).toExtend<PrimitiveStore<number>>();
    });

    it("should return PrimitiveStore<string> for string primitives", () => {
      const store = createStore("hello");
      expectTypeOf(store).toExtend<PrimitiveStore<string>>();
    });

    it("should return PrimitiveStore<boolean> for boolean primitives", () => {
      const store = createStore(true);
      expectTypeOf(store).toExtend<PrimitiveStore<boolean>>();
    });

    it("should return PrimitiveStore<null> for null", () => {
      const store = createStore(null);
      expectTypeOf(store).toExtend<PrimitiveStore<null>>();
    });

    it("should return PrimitiveStore<Date> for Date objects", () => {
      const store = createStore(new Date());
      expectTypeOf(store).toExtend<PrimitiveStore<Date>>();
    });

    it("should return PrimitiveStore<RegExp> for RegExp objects", () => {
      const store = createStore(/test/);
      expectTypeOf(store).toExtend<PrimitiveStore<RegExp>>();
    });

    it("should return PrimitiveStore<number[]> for arrays", () => {
      const store = createStore([1, 2, 3]);
      expectTypeOf(store).toExtend<PrimitiveStore<number[]>>();
    });

    it("should return PrimitiveStore<Set<string>> for Set objects", () => {
      const store = createStore(new Set(["a", "b"]));
      expectTypeOf(store).toExtend<PrimitiveStore<Set<string>>>();
    });

    it("should return PrimitiveStore<Map<string, number>> for Map objects", () => {
      const store = createStore(new Map([["key", 1]]));
      expectTypeOf(store).toExtend<PrimitiveStore<Map<string, number>>>();
    });
  });

  describe("Composite store overloads", () => {
    it("should return CompositeStore for plain objects", () => {
      const store = createStore({
        count: 0,
        name: "test",
      });

      expectTypeOf(store).toExtend<
        CompositeStore<{
          count: number;
          name: string;
        }>
      >();
    });

    it("should return CompositeStore for nested objects", () => {
      const store = createStore({
        settings: {
          notifications: true,
          theme: "dark",
        },
        user: {
          age: 30,
          name: "John",
        },
      });

      expectTypeOf(store).toExtend<
        CompositeStore<{
          settings: {
            notifications: boolean;
            theme: string;
          };
          user: {
            age: number;
            name: string;
          };
        }>
      >();
    });

    it("should return CompositeStore for objects with methods", () => {
      const store = createStore({
        count: 0,
        decrement: () => {
          store.count.$set((prev) => prev - 1);
        },
        increment() {
          store.count.$set((prev) => prev + 1);
        },
      });

      expectTypeOf(store).toExtend<
        CompositeStore<{
          count: number;
          decrement: () => void;
          increment(): void;
        }>
      >();
    });

    it("should return CompositeStore for objects with mixed property types", () => {
      const store = createStore({
        active: true,
        id: 1,
        metadata: {
          created: new Date(),
          version: "1.0.0",
        },
        name: "test",
        process() {
          return "processed";
        },
        tags: ["tag1", "tag2"],
      });

      expectTypeOf(store).toExtend<
        CompositeStore<{
          active: boolean;
          id: number;
          metadata: {
            created: Date;
            version: string;
          };
          name: string;
          process(): "processed";
          tags: string[];
        }>
      >();
    });
  });

  describe("Promise overloads", () => {
    it("should return Promise<PrimitiveStore<number>> for async number", async () => {
      const asyncNumber = async () => 42;
      const storePromise = createStore(asyncNumber);
      expectTypeOf(storePromise).toExtend<Promise<PrimitiveStore<number>>>();

      const store = await storePromise;
      expectTypeOf(store).toExtend<PrimitiveStore<number>>();
    });

    it("should return Promise<PrimitiveStore<string>> for async string", async () => {
      const asyncString = async () => "hello";
      const storePromise = createStore(asyncString);
      expectTypeOf(storePromise).toExtend<Promise<PrimitiveStore<string>>>();

      const store = await storePromise;
      expectTypeOf(store).toExtend<PrimitiveStore<string>>();
    });

    it("should return Promise<PrimitiveStore<object>> for async object", async () => {
      const asyncObject = async () => ({ count: 0 });
      const storePromise = createStore(asyncObject);
      expectTypeOf(storePromise).toExtend<
        Promise<PrimitiveStore<{ count: number }>>
      >();

      const store = await storePromise;
      expectTypeOf(store).toExtend<PrimitiveStore<{ count: number }>>();
    });
  });

  describe("Factory function overloads", () => {
    it("should return PrimitiveStore for factory returning primitive", () => {
      const factory = () => 42;
      const store = createStore(factory);
      expectTypeOf(store).toExtend<PrimitiveStore<number>>();
    });

    it("should return CompositeStore for factory returning object", () => {
      const factory = () => ({ count: 0, name: "test" });
      const store = createStore(factory);
      expectTypeOf(store).toExtend<
        CompositeStore<{
          count: number;
          name: string;
        }>
      >();
    });
  });

  describe("Edge cases and explicit typing", () => {
    it("should respect explicit generic typing", () => {
      interface User {
        age: number;
        greet(): void;
        name: string;
      }

      const store = createStore<User>({
        age: 30,
        greet() {
          console.log("Hello");
        },
        name: "John",
      });

      expectTypeOf(store).toExtend<CompositeStore<User>>();
    });

    it("should handle union types correctly", () => {
      const store = createStore<number | string>(42);
      expectTypeOf(store).toExtend<PrimitiveStore<number | string>>();
    });

    it("should handle optional properties", () => {
      const store = createStore({
        optional: undefined as string | undefined,
        required: "value",
      });
      expectTypeOf(store).toExtend<
        CompositeStore<{
          optional: string | undefined;
          required: string;
        }>
      >();
    });

    it("should handle readonly properties", () => {
      const store = createStore({
        mutable: "value",
        readonly: "value" as const,
      });
      expectTypeOf(store).toExtend<
        CompositeStore<{
          mutable: string;
          readonly: "value";
        }>
      >();
    });

    it("should handle generic object types", () => {
      interface GenericStore<T> {
        value: T;
      }

      const stringStore = createStore<GenericStore<string>>({
        value: "hello",
      });

      expectTypeOf(stringStore).toExtend<
        CompositeStore<GenericStore<string>>
      >();

      const numberStore = createStore<GenericStore<number>>({
        value: 42,
      });

      expectTypeOf(numberStore).toExtend<
        CompositeStore<GenericStore<number>>
      >();
    });
  });

  describe("Store accessor types", () => {
    it("should have correct accessor types for primitive stores", () => {
      const primitiveStore = createStore(42);

      expectTypeOf(primitiveStore.$get).toExtend<
        <Value = number>(
          selector?: ((state: number) => Value) | undefined
        ) => Value
      >();

      expectTypeOf(primitiveStore.$set).toExtend<
        (value: ((prev: number) => number) | number) => void
      >();

      expectTypeOf(primitiveStore.$act).toExtend<
        (subscriber: (value: number) => void, immediate?: boolean) => () => void
      >();
    });

    it("should have correct accessor types for composite stores", () => {
      const compositeStore = createStore({
        count: 0,
        name: "test",
      });

      expectTypeOf(compositeStore.count).toExtend<{
        $get: <Value = number>(
          selector?: ((state: number) => Value) | undefined
        ) => Value;
        $set: (value: ((prev: number) => number) | number) => void;
      }>();

      expectTypeOf(compositeStore.name).toExtend<{
        $get: <Value = string>(
          selector?: ((state: string) => Value) | undefined
        ) => Value;
        $set: (value: ((prev: string) => string) | string) => void;
      }>();

      expectTypeOf(compositeStore.$get).toExtend<
        <Value = { count: number; name: string }>(
          selector?:
            | ((state: { count: number; name: string }) => Value)
            | undefined
        ) => Value
      >();
    });
  });
});
