import type { StandardSchemaV1 } from "@standard-schema/spec";

import { describe, expect, it } from "vitest";
import { z } from "zod";

import { resolveSchema } from "./index";

import * as v from "valibot";

describe("resolveSchema", () => {
  describe("Object schemas", () => {
    it("should return field defaults when all fields have defaults", () => {
      const schema = z.object({
        count: z.number().default(0),
        label: z.string().default("hello"),
      });

      expect(resolveSchema(schema)).toEqual({ count: 0, label: "hello" });
    });

    it("should return undefined when the schema has required fields but no defaults", () => {
      const schema = z.object({ value: z.number() });
      expect(resolveSchema(schema)).toBeUndefined();
    });

    it("should return undefined when some fields are required and others have defaults", () => {
      // Zod validates all-or-nothing: a single required field causes validate({}) to
      // fail, so partial defaults cannot be extracted.
      const schema = z.object({
        optional: z.boolean().default(true),
        required: z.string(),
      });

      expect(resolveSchema(schema)).toBeUndefined();
    });

    it("should return undefined when a nested object has no top-level default", () => {
      // validate({}) fails because `user` is required with no default.
      const schema = z.object({
        user: z.object({
          age: z.number().default(0),
          name: z.string().default("guest"),
        }),
      });

      expect(resolveSchema(schema)).toBeUndefined();
    });

    it("should return nested defaults when the top-level object field has a default", () => {
      const schema = z.object({
        user: z
          .object({
            age: z.number().default(0),
            name: z.string().default("guest"),
          })
          .default({ age: 0, name: "guest" }),
      });

      expect(resolveSchema(schema)).toEqual({
        user: { age: 0, name: "guest" },
      });
    });
  });

  describe("Primitive schemas", () => {
    it("should return the default value for a number schema", () => {
      expect(resolveSchema(z.number().default(42))).toBe(42);
    });

    it("should return the default value for a string schema", () => {
      expect(resolveSchema(z.string().default("hello"))).toBe("hello");
    });

    it("should return the default value for a boolean schema", () => {
      expect(resolveSchema(z.boolean().default(false))).toBe(false);
    });

    it("should return undefined for a primitive schema with no default", () => {
      expect(resolveSchema(z.number())).toBeUndefined();
    });

    it("should return undefined for a string schema with no default", () => {
      expect(resolveSchema(z.string())).toBeUndefined();
    });
  });

  describe("Valibot schemas", () => {
    it("should return field defaults for a valibot object schema", () => {
      const schema = v.object({
        count: v.optional(v.number(), 0),
        label: v.optional(v.string(), "hello"),
      });

      expect(resolveSchema(schema)).toEqual({ count: 0, label: "hello" });
    });

    it("should return the default value for a valibot primitive schema", () => {
      const schema = v.optional(v.number(), 99);
      expect(resolveSchema(schema)).toBe(99);
    });
  });

  describe("Async schemas", () => {
    it("should return a Promise when validate returns a Promise", async () => {
      const schema: StandardSchemaV1<number> = {
        "~standard": {
          validate: () => Promise.resolve({ value: 7 }),
          vendor: "test",
          version: 1,
        },
      };

      const result = resolveSchema(schema);
      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBe(7);
    });

    it("should resolve to undefined when the async result has issues", async () => {
      const schema: StandardSchemaV1<number> = {
        "~standard": {
          validate: () => Promise.resolve({ issues: [{ message: "invalid" }] }),
          vendor: "test",
          version: 1,
        },
      };

      const result = resolveSchema(schema);
      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBeUndefined();
    });

    it("should fall back to the scalar seed when the object seed fails asynchronously", async () => {
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

      const result = resolveSchema(schema);
      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBe(42);
    });
  });

  describe("Custom schemas", () => {
    it("should return undefined for a schema that rejects all seeds and has no shape", () => {
      const schema: StandardSchemaV1<number> = {
        "~standard": {
          validate: () => ({ issues: [{ message: "required" }] }),
          vendor: "test",
          version: 1,
        },
      };

      expect(resolveSchema(schema)).toBeUndefined();
    });
  });
});
