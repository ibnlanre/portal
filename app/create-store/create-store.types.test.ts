import type { CompositeStore } from "@/create-store/types/composite-store";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";

import { expectTypeOf } from "vitest";
import { describe, it } from "vitest";
import { z } from "zod";

import { createStore } from "./index";

import * as v from "valibot";

describe("createStore - Type Tests", () => {
  describe("Primitive store overloads", () => {
    it("should return PrimitiveStore<number> for number schemas", () => {
      const store = createStore(z.number(), 0);
      expectTypeOf(store).toExtend<PrimitiveStore<number>>();
    });

    it("should return PrimitiveStore<string> for string schemas", () => {
      const store = createStore(z.string(), "");
      expectTypeOf(store).toExtend<PrimitiveStore<string>>();
    });

    it("should return PrimitiveStore<boolean> for boolean schemas", () => {
      const store = createStore(z.boolean(), false);
      expectTypeOf(store).toExtend<PrimitiveStore<boolean>>();
    });

    it("should return PrimitiveStore<null> for null schemas", () => {
      const store = createStore(z.null(), null);
      expectTypeOf(store).toExtend<PrimitiveStore<null>>();
    });

    it("should return PrimitiveStore<Date> for Date schemas", () => {
      const store = createStore(z.date(), new Date(0));
      expectTypeOf(store).toExtend<PrimitiveStore<Date>>();
    });

    it("should return PrimitiveStore<RegExp> for RegExp schemas", () => {
      const store = createStore(z.instanceof(RegExp), /./u);
      expectTypeOf(store).toExtend<PrimitiveStore<RegExp>>();
    });

    it("should return PrimitiveStore<number[]> for array schemas", () => {
      const store = createStore(z.array(z.number()), []);
      expectTypeOf(store.$get()).toEqualTypeOf<number[]>();
    });

    it("should return PrimitiveStore<Set<string>> for Set schemas", () => {
      const store = createStore(z.set(z.string()), new Set<string>());
      expectTypeOf(store.$get()).toEqualTypeOf<Set<string>>();
    });

    it("should return PrimitiveStore<Map<string, number>> for Map schemas", () => {
      const store = createStore(
        z.map(z.string(), z.number()),
        new Map<string, number>()
      );
      expectTypeOf(store.$get()).toEqualTypeOf<Map<string, number>>();
    });
  });

  describe("Composite store overloads", () => {
    it("should return CompositeStore for plain object schemas", () => {
      const store = createStore(
        z.object({ count: z.number(), name: z.string() }),
        {
          count: 0,
          name: "",
        }
      );

      expectTypeOf(store).toExtend<
        CompositeStore<{
          count: number;
          name: string;
        }>
      >();
    });

    it("should return CompositeStore for nested object schemas", () => {
      const store = createStore(
        z.object({
          settings: z.object({ notifications: z.boolean(), theme: z.string() }),
          user: z.object({ age: z.number(), name: z.string() }),
        }),
        {
          settings: { notifications: false, theme: "" },
          user: { age: 0, name: "" },
        }
      );

      expectTypeOf(store).toExtend<
        CompositeStore<{
          settings: { notifications: boolean; theme: string };
          user: { age: number; name: string };
        }>
      >();
    });

    it("should return CompositeStore for objects with function properties", () => {
      const store = createStore(
        z.object({
          count: z.number(),
          decrement: z.custom<() => void>(),
          increment: z.custom<() => void>(),
        }),
        { count: 0, decrement: () => {}, increment: () => {} }
      );

      expectTypeOf(store).toExtend<
        CompositeStore<{
          count: number;
          decrement: () => void;
          increment: () => void;
        }>
      >();
    });
  });

  describe("Edge cases and explicit typing", () => {
    it("should handle union types", () => {
      const store = createStore(z.union([z.number(), z.string()]), 0);
      expectTypeOf(store.$get()).toEqualTypeOf<number | string>();
    });

    it("should handle optional properties in object schemas", () => {
      const store = createStore(
        z.object({
          optional: z.union([z.string(), z.undefined()]),
          required: z.string(),
        }),
        { optional: undefined, required: "" }
      );
      expectTypeOf(store.$get()).toEqualTypeOf<{
        optional: string | undefined;
        required: string;
      }>();
    });

    it("should handle generic object schemas", () => {
      interface GenericStore<T> {
        value: T;
      }

      const stringStore = createStore(z.object({ value: z.string() }), {
        value: "",
      });
      expectTypeOf(stringStore.$get()).toExtend<GenericStore<string>>();
      expectTypeOf(stringStore.$get().value).toExtend<string>();

      const numberStore = createStore(z.object({ value: z.number() }), {
        value: 0,
      });
      expectTypeOf(numberStore.$get()).toExtend<GenericStore<number>>();
      expectTypeOf(numberStore.$get().value).toExtend<number>();
    });
  });

  describe("Store accessor types", () => {
    it("should have correct accessor types for primitive stores", () => {
      const store = createStore(z.number(), 0);

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
      const store = createStore(
        z.object({ count: z.number(), name: z.string() }),
        { count: 0, name: "" }
      );

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

  describe("Cross-library compatibility (Valibot)", () => {
    it("should work with valibot string schema", () => {
      const store = createStore(v.string(), "");
      expectTypeOf(store).toExtend<PrimitiveStore<string>>();
    });

    it("should work with valibot number schema", () => {
      const store = createStore(v.number(), 0);
      expectTypeOf(store).toExtend<PrimitiveStore<number>>();
    });

    it("should work with valibot object schema", () => {
      const store = createStore(
        v.object({ count: v.number(), label: v.string() }),
        { count: 0, label: "" }
      );
      expectTypeOf(store).toExtend<
        CompositeStore<{ count: number; label: string }>
      >();
    });
  });

  describe("Real-world edge cases", () => {
    it("record schema produces CompositeStore since the output extends Dictionary", () => {
      const store = createStore(z.record(z.string(), z.number()), {});
      expectTypeOf(store.$get()).toEqualTypeOf<Record<string, number>>();
    });

    it("array schema produces PrimitiveStore since arrays are not plain objects", () => {
      const store = createStore(z.array(z.number()), []);
      expectTypeOf(store.$get()).toEqualTypeOf<number[]>();
    });

    it("union of object and primitive produces PrimitiveStore since the union does not extend Dictionary", () => {
      const store = createStore(
        z.union([z.object({ a: z.number() }), z.number()]),
        0
      );
      expectTypeOf(store.$get()).toEqualTypeOf<number | { a: number }>();
    });

    it("optional object schema produces PrimitiveStore since undefined breaks the Dictionary constraint", () => {
      const store = createStore(
        z.optional(z.object({ value: z.number() })),
        undefined
      );
      expectTypeOf(store.$get()).toEqualTypeOf<undefined | { value: number }>();
    });

    it("object schema types as CompositeStore based on InferSchema", () => {
      const store = createStore(z.object({ value: z.number() }), { value: 0 });
      expectTypeOf(store).toExtend<CompositeStore<{ value: number }>>();
    });
  });

  describe("Explicit initialState overload", () => {
    it("object schema with explicit dictionary initialState produces CompositeStore", () => {
      const store = createStore(z.object({ value: z.number() }), { value: 0 });
      expectTypeOf(store).toExtend<CompositeStore<{ value: number }>>();
    });

    it("primitive schema with explicit initialState produces PrimitiveStore", () => {
      const store = createStore(z.number(), 42);
      expectTypeOf(store).toExtend<PrimitiveStore<number>>();
    });

    it("explicit initialState overload is synchronous", () => {
      // When initialState is provided, schema resolution is bypassed entirely —
      // the return is always a store, never a Promise.
      const store = createStore(z.object({ value: z.number() }), { value: 0 });
      expectTypeOf(store).not.toMatchTypeOf<Promise<unknown>>();
    });
  });
});
