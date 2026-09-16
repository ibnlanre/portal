import { z } from "zod";
import { describe, expect, expectTypeOf, it } from "vitest";

import type { CompositeStore } from "@/create-store/types/composite-store";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";
import type { StoreDefinition } from "@/create-store/types/store-definition";

import { createContextStore } from "@/create-store/functions/library/create-context-store";
import { setup } from "@/vitest.react";

import { defineStore } from "./index";

const counterSchema = z.object({
  count: z.number().default(0),
  label: z.string().default("counter"),
});

const counterDefinition = defineStore(counterSchema);

describe("defineStore - runtime", () => {
  it("returns a callable definition carrying the schema", () => {
    expect(typeof counterDefinition).toBe("function");
    expect(counterDefinition.schema).toBe(counterSchema);
  });

  it("creates a fresh default instance when called with no value", () => {
    const first = counterDefinition();
    const second = counterDefinition();

    expect(first.$get()).toEqual({ count: 0, label: "counter" });
    expect(second.$get()).toEqual({ count: 0, label: "counter" });
  });

  it("does not share state between instances", () => {
    const first = counterDefinition();
    const second = counterDefinition();

    first.$set({ count: 10 });

    expect(first.$get()).toEqual({ count: 10, label: "counter" });
    expect(second.$get()).toEqual({ count: 0, label: "counter" });
  });

  it("parses a value and fills remaining defaults from the schema", () => {
    const store = counterDefinition({ count: 5 });

    expect(store.$get()).toEqual({ count: 5, label: "counter" });
  });

  it("throws when the value does not conform to the schema", () => {
    expect(() =>
      counterDefinition({ count: "not a number" as unknown as number })
    ).toThrow(/does not conform/);
  });

  it("handles scalar schemas", () => {
    const scalar = defineStore(z.number().default(0));

    expect(scalar().$get()).toBe(0);
    expect(scalar(7).$get()).toBe(7);
  });

  it("rejects async schemas with a clear error", () => {
    const asyncSchema = {
      "~standard": {
        validate: () => Promise.resolve({ value: 7 }),
        vendor: "test",
        version: 1,
      },
    } as unknown as Parameters<typeof defineStore>[0];

    expect(() => defineStore(asyncSchema)()).toThrow(/resolveSchemaAsync/);
  });

  it("rejects a value that is not a schema", () => {
    expect(() => defineStore({} as Parameters<typeof defineStore>[0])).toThrow(
      /Standard Schema/
    );
  });

  it("throws when the schema defines no default value", () => {
    const required = defineStore(z.object({ name: z.string() }));

    expect(() => required()).toThrow(
      /does not define a complete default value/
    );
    expect(required({ name: "Ridwan" }).$get()).toEqual({ name: "Ridwan" });
  });
});

const isolationSchema = z.object({
  settings: z
    .object({
      preferences: z
        .object({ theme: z.string().default("dark") })
        .default({ theme: "dark" }),
    })
    .default({ preferences: { theme: "dark" } }),
  tags: z.array(z.string()).default(["alpha"]),
});

const Isolation = defineStore(isolationSchema);

describe("defineStore - instance isolation", () => {
  it("isolates deeply nested defaults between instances", () => {
    const one = Isolation();
    const two = Isolation();

    one.settings.preferences.theme.$set("light");

    expect(one.settings.preferences.theme.$get()).toBe("light");
    expect(two.settings.preferences.theme.$get()).toBe("dark");
  });

  it("isolates array defaults between instances", () => {
    const one = Isolation();
    const two = Isolation();

    one.tags.$set(["alpha", "beta"]);

    expect(one.tags.$get()).toEqual(["alpha", "beta"]);
    expect(two.tags.$get()).toEqual(["alpha"]);
  });

  it("isolates default-derived references from direct mutation", () => {
    const one = Isolation();
    const two = Isolation();

    one.tags.$get().push("mutated");

    expect(two.tags.$get()).toEqual(["alpha"]);
  });
});

describe("defineStore - type level", () => {
  it("returns a CompositeStore from an object schema", () => {
    const store = counterDefinition();

    expectTypeOf(store).toExtend<
      CompositeStore<{ count: number; label: string }>
    >();
  });

  it("accepts partial input and returns the typed store", () => {
    const store = counterDefinition({ count: 3 });

    expectTypeOf(store).toExtend<
      CompositeStore<{ count: number; label: string }>
    >();
  });

  it("returns a PrimitiveStore from a scalar schema", () => {
    const scalar = defineStore(z.number().default(0));

    expectTypeOf(scalar()).toExtend<PrimitiveStore<number>>();
    expectTypeOf(scalar(9)).toExtend<PrimitiveStore<number>>();
    expectTypeOf(scalar).toExtend<StoreDefinition<z.ZodDefault<z.ZodNumber>>>();
  });

  it("flows into createContextStore without annotation", () => {
    const [CounterProvider, useCounterStore] =
      createContextStore(counterDefinition);

    expectTypeOf(CounterProvider).toBeFunction();
    expectTypeOf(useCounterStore).returns.toExtend<
      CompositeStore<{ count: number; label: string }>
    >();
  });
});

describe("defineStore - createContextStore composition", () => {
  it("seeds the scoped store from the provider value", () => {
    const [CounterProvider, useCounterStore] =
      createContextStore(counterDefinition);

    function Display() {
      const store = useCounterStore();
      return <div data-testid="count">{store.$get().count}</div>;
    }

    setup(
      <CounterProvider value={{ count: 5 }}>
        <Display />
      </CounterProvider>
    );

    expect(document.querySelector('[data-testid="count"]')?.textContent).toBe(
      "5"
    );
  });
});
