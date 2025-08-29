import type { Replace } from "./index";

import { describe, it } from "vitest";
import { expectTypeOf } from "vitest";

describe("Replace Type", () => {
  describe("Basic functionality", () => {
    it("should replace primitive with primitive", () => {
      type Result = Replace<string, number>;

      expectTypeOf<Result>().toEqualTypeOf<number>();
    });

    it("should replace object with primitive", () => {
      type Target = { a: string };
      type Source = number;
      type Result = Replace<Target, Source>;

      expectTypeOf<Result>().toEqualTypeOf<number>();
    });

    it("should replace primitive with object", () => {
      type Target = string;
      type Source = { b: number };
      type Result = Replace<Target, Source>;

      expectTypeOf<Result>().toEqualTypeOf<{ b: number }>();
    });
  });

  describe("Reference handling", () => {
    it("should return Reference as-is when Source is Reference", () => {
      type TestReference = Date;
      type Target = { a: number };
      type Result = Replace<Target, TestReference>;

      expectTypeOf<Result>().toEqualTypeOf<TestReference>();
    });

    it("should preserve Reference type regardless of Target", () => {
      type TestReference = Array<string>;
      type Result1 = Replace<number, TestReference>;
      type Result2 = Replace<{ a: string }, TestReference>;
      type Result3 = Replace<any[], TestReference>;

      expectTypeOf<Result1>().toEqualTypeOf<TestReference>();
      expectTypeOf<Result2>().toEqualTypeOf<TestReference>();
      expectTypeOf<Result3>().toEqualTypeOf<TestReference>();
    });
  });

  describe("GenericObject to GenericObject replacement", () => {
    it("should merge objects with different properties", () => {
      type Target = { a: string; b: number };
      type Source = { c: boolean };
      type Result = Replace<Target, Source>;

      expectTypeOf<Result>().toEqualTypeOf<{
        a: string;
        b: number;
        c: boolean;
      }>();
    });

    it("should replace overlapping properties", () => {
      type Target = { a: string; b: number };
      type Source = { a: boolean; c: string };
      type Result = Replace<Target, Source>;

      expectTypeOf<Result>().toEqualTypeOf<{
        a: boolean;
        b: number;
        c: string;
      }>();
    });

    it("should handle nested object replacement", () => {
      type Target = {
        config: { api: string; timeout: number };
        user: { id: string };
      };
      type Source = {
        config: { api: string; debug: boolean };
        settings: { theme: string };
      };
      type Result = Replace<Target, Source>;

      expectTypeOf<Result>().toEqualTypeOf<{
        config: {
          api: string;
          debug: boolean;
          timeout: number;
        };
        settings: { theme: string };
        user: { id: string };
      }>();
    });

    it("should handle deeply nested replacements", () => {
      type Target = {
        level1: {
          level2: {
            count: number;
            value: string;
          };
        };
      };
      type Source = {
        level1: {
          level2: {
            extra: string;
            value: boolean;
          };
          newProp: number;
        };
      };
      type Result = Replace<Target, Source>;

      expectTypeOf<Result>().toEqualTypeOf<{
        level1: {
          level2: {
            count: number;
            extra: string;
            value: boolean;
          };
          newProp: number;
        };
      }>();
    });
  });

  describe("Non-GenericObject Source handling", () => {
    it("should return Source when Target is GenericObject but Source is not", () => {
      type Target = { a: string; b: number };
      type Source = string;
      type Result = Replace<Target, Source>;

      expectTypeOf<Result>().toEqualTypeOf<string>();
    });

    it("should handle null replacement", () => {
      type Target = { a: string };
      type Source = null;
      type Result = Replace<Target, Source>;

      expectTypeOf<Result>().toEqualTypeOf<null>();
    });

    it("should handle undefined replacement", () => {
      type Target = { a: string };
      type Source = undefined;
      type Result = Replace<Target, Source>;

      expectTypeOf<Result>().toEqualTypeOf<undefined>();
    });
  });

  describe("NonNullable behavior", () => {
    it("should apply NonNullable when Target is not GenericObject", () => {
      type Target = string;
      type Source = null | number | undefined;
      type Result = Replace<Target, Source>;

      expectTypeOf<Result>().toEqualTypeOf<number>();
    });

    it("should preserve non-nullable types", () => {
      type Target = boolean;
      type Source = string;
      type Result = Replace<Target, Source>;

      expectTypeOf<Result>().toEqualTypeOf<string>();
    });
  });

  describe("Optional properties", () => {
    it("should handle optional properties in Target", () => {
      type Target = { a?: string; b: number };
      type Source = { c: boolean };
      type Result = Replace<Target, Source>;

      expectTypeOf<Result>().toEqualTypeOf<{
        a?: string;
        b: number;
        c: boolean;
      }>();
    });

    it("should handle optional properties in Source", () => {
      type Target = { a: string; b: number };
      type Source = { a?: boolean; c?: string };
      type Result = Replace<Target, Source>;

      expectTypeOf<Result>().toEqualTypeOf<{
        a: boolean;
        b: number;
        c?: string;
      }>();
    });

    it("should replace optional with required", () => {
      type Target = { a?: string };
      type Source = { a: number };
      type Result = Replace<Target, Source>;

      expectTypeOf<Result>().toEqualTypeOf<{
        a: number;
      }>();
    });

    it("should replace required with optional", () => {
      type Target = { a: string };
      type Source = { a?: number };
      type Result = Replace<Target, Source>;

      expectTypeOf<Result>().toEqualTypeOf<{
        a: number;
      }>();
    });
  });

  describe("Complex type scenarios", () => {
    it("should handle function properties", () => {
      type Target = {
        count: number;
        getValue: () => string;
      };
      type Source = {
        getValue: () => number;
        setValue: (value: string) => void;
      };
      type Result = Replace<Target, Source>;

      expectTypeOf<Result>().toEqualTypeOf<{
        count: number;
        getValue: () => number;
        setValue: (value: string) => void;
      }>();
    });

    it("should handle array properties", () => {
      type Target = {
        count: number;
        items: string[];
      };
      type Source = {
        items: number[];
        metadata: { total: number };
      };
      type Result = Replace<Target, Source>;

      expectTypeOf<Result>().toEqualTypeOf<{
        count: number;
        items: number[];
        metadata: { total: number };
      }>();
    });

    it("should handle union types", () => {
      type Target = {
        type: "text";
        value: number | string;
      };
      type Source = {
        type: "boolean" | "text";
        value: boolean;
      };
      type Result = Replace<Target, Source>;

      expectTypeOf<Result>().toEqualTypeOf<{
        type: "boolean" | "text";
        value: boolean;
      }>();
    });

    it("should handle readonly properties", () => {
      type Target = {
        readonly id: string;
        name: string;
      };
      type Source = {
        readonly email: string;
        readonly id: number;
      };
      type Result = Replace<Target, Source>;

      expectTypeOf<Result>().toEqualTypeOf<{
        readonly email: string;
        readonly id: number;
        name: string;
      }>();
    });
  });

  describe("Extends relationships", () => {
    it("should test extends with primitive replacement", () => {
      type Result = Replace<string, number>;

      expectTypeOf<Result>().toExtend<number>();
      expectTypeOf<number>().toExtend<Result>();
    });

    it("should test extends with object merging", () => {
      type Target = { a: string };
      type Source = { b: number };
      type Result = Replace<Target, Source>;

      expectTypeOf<Result>().toExtend<{ a: string }>();
      expectTypeOf<Result>().toExtend<{ b: number }>();
      expectTypeOf<{ a: string; b: number }>().toExtend<Result>();
    });

    it("should test extends with nested object replacement", () => {
      type Target = {
        config: { api: string };
        user: { id: string };
      };
      type Source = {
        config: { timeout: number };
      };
      type Result = Replace<Target, Source>;

      expectTypeOf<Result>().toExtend<{
        config: { api: string; timeout: number };
      }>();
      expectTypeOf<Result>().toExtend<{ user: { id: string } }>();
    });

    it("should test extends with NonNullable behavior", () => {
      type Result = Replace<string, null | number | undefined>;

      expectTypeOf<Result>().toExtend<number>();
      expectTypeOf<number>().toExtend<Result>();
    });

    it("should test extends with empty objects", () => {
      type Result1 = Replace<{}, { a: string }>;
      type Result2 = Replace<{ a: string }, {}>;

      expectTypeOf<Result1>().toExtend<{ a: string }>();
      expectTypeOf<{ a: string }>().toExtend<Result1>();

      expectTypeOf<Result2>().toExtend<{ a: string }>();
      expectTypeOf<{ a: string }>().toExtend<Result2>();
    });

    it("should test extends with complex inheritance patterns", () => {
      interface BaseConfig {
        apiUrl: string;
        timeout: number;
      }

      interface UserConfig {
        debug?: boolean;
        timeout: 5000;
      }

      type Result = Replace<BaseConfig, UserConfig>;

      expectTypeOf<Result>().toExtend<{
        apiUrl: string;
        debug?: boolean;
        timeout: 5000;
      }>();
    });
  });

  describe("Edge cases", () => {
    it("should handle empty object replacement", () => {
      type Result1 = Replace<{}, {}>;
      type Result2 = Replace<{ a: string }, {}>;
      type Result3 = Replace<{}, { a: string }>;

      expectTypeOf<Result1>().toEqualTypeOf<{}>();
      expectTypeOf<Result2>().toEqualTypeOf<{ a: string }>();
      expectTypeOf<Result3>().toEqualTypeOf<{ a: string }>();
    });

    it("should handle never types", () => {
      type Result1 = Replace<never, { a: string }>;
      type Result2 = Replace<{ a: string }, never>;

      expectTypeOf<Result1>().toEqualTypeOf<never>();
      expectTypeOf<Result2>().toEqualTypeOf<never>();
    });

    it("should handle any types", () => {
      type Result1 = Replace<any, { a: string }>;
      type Result2 = Replace<{ a: string }, any>;

      expectTypeOf<Result1>().toEqualTypeOf<{
        [x: number]: any;
        [x: string]: any;
        [x: symbol]: any;
        a: string;
      }>();
      expectTypeOf<Result2>().toEqualTypeOf<any>();
    });

    it("should handle unknown types", () => {
      type Result1 = Replace<unknown, { a: string }>;
      type Result2 = Replace<{ a: string }, unknown>;

      expectTypeOf<Result1>().toEqualTypeOf<{ a: string }>();
      expectTypeOf<Result2>().toEqualTypeOf<unknown>();
    });
  });
});
