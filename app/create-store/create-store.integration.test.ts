import type { StandardSchemaV1 } from "@standard-schema/spec";

import { describe, expect, it } from "vitest";
import { z } from "zod";

import * as v from "valibot";

import { createStore } from "./index";

describe("createStore - Integration tests (real schemas, no mocks)", () => {
  describe("Primitive schemas", () => {
    it("number schema with default produces working primitive store", () => {
      const store = createStore(z.number().default(42));
      expect(store.$get()).toBe(42);
    });

    it("string schema with default produces working primitive store", () => {
      const store = createStore(z.string().default("hello"));
      expect(store.$get()).toBe("hello");
    });

    it("number schema without default produces primitive store with undefined state", () => {
      const store = createStore(z.number());
      expect(store.$get()).toBeUndefined();
    });
  });

  describe("Object schemas", () => {
    it("object schema with defaults produces working composite store", () => {
      const store = createStore(
        z.object({
          count: z.number().default(0),
          label: z.string().default("hello"),
        })
      );
      expect(store.count.$get()).toBe(0);
      expect(store.label.$get()).toBe("hello");
      expect(store.$get()).toEqual({ count: 0, label: "hello" });
    });

    it("object schema without defaults produces primitive store with undefined state", () => {
      const store = createStore(z.object({ value: z.number() }));
      // Runtime: resolveSchema returns undefined → primitive store
      expect(store.$get()).toBeUndefined();
    });
  });

  describe("Explicit initialState", () => {
    it("explicit initialState bypasses schema resolution", () => {
      const store = createStore(z.object({ value: z.number() }), { value: 5 });
      expect(store.value.$get()).toBe(5);
    });

    it("explicit primitive initialState produces working primitive store", () => {
      const store = createStore(z.number(), 99);
      expect(store.$get()).toBe(99);
    });
  });

  describe("Valibot schemas", () => {
    it("valibot object schema with defaults produces working composite store", () => {
      const store = createStore(
        v.object({
          count: v.optional(v.number(), 0),
          label: v.optional(v.string(), "hi"),
        })
      );
      expect(store.count.$get()).toBe(0);
      expect(store.label.$get()).toBe("hi");
    });

    it("valibot primitive schema with default produces working primitive store", () => {
      const store = createStore(v.optional(v.number(), 7));
      expect(store.$get()).toBe(7);
    });
  });

  describe("Async schemas", () => {
    it("async schema resolves to a working primitive store", async () => {
      const schema: StandardSchemaV1<number> = {
        "~standard": {
          validate: () => Promise.resolve({ value: 7 }),
          vendor: "test",
          version: 1,
        },
      };

      const store = await createStore(schema);
      expect(store.$get()).toBe(7);
    });

    it("async schema resolves to a working composite store", async () => {
      const schema: StandardSchemaV1<{ count: number }> = {
        "~standard": {
          validate: () => Promise.resolve({ value: { count: 3 } }),
          vendor: "test",
          version: 1,
        },
      };

      const store = await createStore(schema);
      expect(store.count.$get()).toBe(3);
    });

    it("async object seed failure falls back to scalar seed", async () => {
      // Schema whose validate({}) fails but validate(undefined) succeeds.
      const schema: StandardSchemaV1<number> = {
        "~standard": {
          validate: (value) =>
            Promise.resolve(
              value !== undefined && typeof value === "object"
                ? { issues: [{ message: "not a number" }] }
                : { value: 42 }
            ),
          vendor: "test",
          version: 1,
        },
      };

      const store = await createStore(schema);
      expect(store.$get()).toBe(42);
    });
  });
});
