import { describe, expect, it } from "vitest";
import { z } from "zod";

import { createStore } from "./index";

import * as v from "valibot";

describe("createStore - Integration tests (real schemas, no mocks)", () => {
  describe("Primitive schemas", () => {
    it("number schema with explicit initialState produces working primitive store", () => {
      const store = createStore(z.number(), 42);
      expect(store.$get()).toBe(42);
    });

    it("string schema with explicit initialState produces working primitive store", () => {
      const store = createStore(z.string(), "hello");
      expect(store.$get()).toBe("hello");
    });

    it("number schema with zero as initialState produces primitive store", () => {
      const store = createStore(z.number(), 0);
      expect(store.$get()).toBe(0);
    });
  });

  describe("Object schemas", () => {
    it("object schema with explicit initialState produces working composite store", () => {
      const store = createStore(
        z.object({
          count: z.number(),
          label: z.string(),
        }),
        { count: 0, label: "hello" }
      );
      expect(store.count.$get()).toBe(0);
      expect(store.label.$get()).toBe("hello");
      expect(store.$get()).toEqual({ count: 0, label: "hello" });
    });

    it("nested object schema with explicit initialState produces working composite store", () => {
      const store = createStore(
        z.object({
          settings: z.object({ notifications: z.boolean(), theme: z.string() }),
          user: z.object({ age: z.number(), name: z.string() }),
        }),
        {
          settings: { notifications: true, theme: "dark" },
          user: { age: 30, name: "Alice" },
        }
      );
      expect(store.settings.theme.$get()).toBe("dark");
      expect(store.user.name.$get()).toBe("Alice");
    });
  });

  describe("Valibot schemas", () => {
    it("valibot object schema with explicit initialState produces working composite store", () => {
      const store = createStore(
        v.object({ count: v.number(), label: v.string() }),
        { count: 0, label: "hi" }
      );
      expect(store.count.$get()).toBe(0);
      expect(store.label.$get()).toBe("hi");
    });

    it("valibot primitive schema with explicit initialState produces working primitive store", () => {
      const store = createStore(v.number(), 7);
      expect(store.$get()).toBe(7);
    });
  });

  describe("Schema defaults applied at initialization", () => {
    describe("Zod schemas", () => {
      it("object schema fills all missing fields with defaults when initialState is empty", () => {
        const store = createStore(
          z.object({
            count: z.number().default(0),
            label: z.string().default("hello"),
          }),
          {} as { count: number; label: string }
        );
        expect(store.count.$get()).toBe(0);
        expect(store.label.$get()).toBe("hello");
        expect(store.$get()).toEqual({ count: 0, label: "hello" });
      });

      it("object schema preserves provided values and fills only missing defaults", () => {
        const store = createStore(
          z.object({
            count: z.number().default(0),
            label: z.string().default("hello"),
          }),
          { count: 5 } as { count: number; label: string }
        );
        expect(store.count.$get()).toBe(5);
        expect(store.label.$get()).toBe("hello");
      });

      it("primitive schema applies default when initialState is undefined", () => {
        const store = createStore(
          z.number().default(99),
          undefined as unknown as number
        );
        expect(store.$get()).toBe(99);
      });

      it("schema-defaulted composite fields are accessible as store nodes", () => {
        const store = createStore(
          z.object({ enabled: z.boolean().default(true) }),
          {} as { enabled: boolean }
        );
        expect(store.enabled.$get()).toBe(true);
        store.enabled.$set(false);
        expect(store.enabled.$get()).toBe(false);
      });

      it("throws at creation time when initialState is invalid against the schema", () => {
        expect(() =>
          createStore(z.object({ count: z.number() }), { count: "bad" } as any)
        ).toThrow();
      });

      it("coerces initialState values at creation time when schema uses coercion", () => {
        const store = createStore(z.object({ count: z.coerce.number() }), {
          count: "7",
        } as unknown as { count: number });
        expect(store.count.$get()).toBe(7);
      });

      it("$set with a partial value still applies schema defaults", () => {
        const store = createStore(
          z.object({
            fontSize: z.number().default(14),
            theme: z.string().default("light"),
          }),
          { fontSize: 20, theme: "dark" }
        );

        store.$set({ theme: "system" });
        expect(store.$get()).toEqual({ fontSize: 20, theme: "system" });
      });
    });

    describe("Valibot schemas", () => {
      it("object schema fills missing fields with optional defaults", () => {
        const store = createStore(
          v.object({
            count: v.optional(v.number(), 0),
            label: v.optional(v.string(), "hello"),
          }),
          {} as { count: number; label: string }
        );
        expect(store.count.$get()).toBe(0);
        expect(store.label.$get()).toBe("hello");
      });

      it("primitive schema applies default when initialState is undefined", () => {
        const store = createStore(
          v.optional(v.number(), 42),
          undefined as unknown as number
        );
        expect(store.$get()).toBe(42);
      });
    });
  });

  describe("Union schemas", () => {
    it("number branch produces a primitive store at runtime", () => {
      const store = createStore(
        z.union([z.number(), z.object({ count: z.number() })]),
        42
      );

      expect(store.$get()).toBe(42);
    });

    it("object branch works via $get at runtime", () => {
      const store = createStore(
        z.union([z.number(), z.object({ count: z.number() })]),
        { count: 5 }
      );

      expect(store.$get()).toEqual({ count: 5 });
    });

    it("valibot union with object branch works via $get at runtime", () => {
      const store = createStore(
        v.union([v.number(), v.object({ count: v.number() })]),
        { count: 10 }
      );

      expect(store.$get()).toEqual({ count: 10 });
    });
  });
});
