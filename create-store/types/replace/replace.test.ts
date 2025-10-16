import type { Replace } from "./index";

import { describe, it } from "vitest";
import { expectTypeOf } from "vitest";

describe("Replace Type", () => {
  describe("Primitive replacements", () => {
    it("should replace primitive with primitive", () => {
      type Result = Replace<string, number>;
      expectTypeOf<Result>().toEqualTypeOf<number>();
    });

    it("should replace object with primitive", () => {
      type Result = Replace<{ a: string }, number>;
      expectTypeOf<Result>().toEqualTypeOf<number>();
    });

    it("should replace primitive with object", () => {
      type Result = Replace<string, { b: number }>;
      expectTypeOf<Result>().toEqualTypeOf<{ b: number }>();
    });
  });

  describe("Reference type handling", () => {
    it("should return Reference as-is when Source is Reference", () => {
      type Result = Replace<{ a: number }, Date>;
      expectTypeOf<Result>().toEqualTypeOf<Date>();
    });

    it("should preserve Reference type regardless of Target complexity", () => {
      type ArrayRef = Array<string>;
      type Result1 = Replace<number, ArrayRef>;
      type Result2 = Replace<{ a: string }, ArrayRef>;
      type Result3 = Replace<any[], ArrayRef>;

      expectTypeOf<Result1>().toEqualTypeOf<ArrayRef>();
      expectTypeOf<Result2>().toEqualTypeOf<ArrayRef>();
      expectTypeOf<Result3>().toEqualTypeOf<ArrayRef>();
    });

    it("should handle arrays as Reference types", () => {
      type Result = Replace<{ config: object }, string[]>;
      expectTypeOf<Result>().toEqualTypeOf<string[]>();
    });

    it("should preserve Sets, Maps, and other built-in types", () => {
      type Result = Replace<
        { cache: Map<string, number> },
        { users: Set<string> }
      >;
      expectTypeOf<Result>().toEqualTypeOf<{
        cache: Map<string, number>;
        users: Set<string>;
      }>();
    });
  });

  describe("Object merging - basic", () => {
    it("should merge non-overlapping properties", () => {
      type Result = Replace<{ a: string; b: number }, { c: boolean }>;
      expectTypeOf<Result>().toEqualTypeOf<{
        a: string;
        b: number;
        c: boolean;
      }>();
    });

    it("should replace overlapping properties with Source type", () => {
      type Result = Replace<
        { a: string; b: number },
        { a: boolean; c: string }
      >;
      expectTypeOf<Result>().toEqualTypeOf<{
        a: boolean;
        b: number;
        c: string;
      }>();
    });

    it("should handle empty object cases", () => {
      type Result1 = Replace<{}, {}>;
      type Result2 = Replace<{ a: string }, {}>;
      type Result3 = Replace<{}, { a: string }>;

      expectTypeOf<Result1>().toEqualTypeOf<{}>();
      expectTypeOf<Result2>().toEqualTypeOf<{ a: string }>();
      expectTypeOf<Result3>().toEqualTypeOf<{ a: string }>();
    });
  });

  describe("Object merging - nested", () => {
    it("should recursively merge nested objects", () => {
      type Result = Replace<
        { config: { api: string; timeout: number }; user: { id: string } },
        { config: { api: string; debug: boolean }; settings: { theme: string } }
      >;
      expectTypeOf<Result>().toEqualTypeOf<{
        config: { api: string; debug: boolean; timeout: number };
        settings: { theme: string };
        user: { id: string };
      }>();
    });

    it("should handle deeply nested structures", () => {
      type Result = Replace<
        { level1: { level2: { count: number; value: string } } },
        {
          level1: {
            level2: { extra: string; value: boolean };
            newProp: number;
          };
        }
      >;
      expectTypeOf<Result>().toEqualTypeOf<{
        level1: {
          level2: { count: number; extra: string; value: boolean };
          newProp: number;
        };
      }>();
    });

    it("should merge nested objects while preserving sibling properties", () => {
      type Result = Replace<
        { config: { api: string } },
        { config: { timeout: number }; settings: { theme: string } }
      >;
      expectTypeOf<Result>().toEqualTypeOf<{
        config: { api: string; timeout: number };
        settings: { theme: string };
      }>();
    });
  });

  describe("Optional properties", () => {
    it("should preserve optional properties from Target", () => {
      type Result = Replace<{ a?: string; b: number }, { c: boolean }>;
      expectTypeOf<Result>().toEqualTypeOf<{
        a?: string;
        b: number;
        c: boolean;
      }>();
    });

    it("should preserve optional properties from Source", () => {
      type Result = Replace<
        { a: string; b: number },
        { a?: boolean; c?: string }
      >;
      expectTypeOf<Result>().toEqualTypeOf<{
        a: boolean;
        b: number;
        c?: string;
      }>();
    });

    it("should replace optional with required when conflicting", () => {
      type Result = Replace<{ a?: string }, { a: number }>;
      expectTypeOf<Result>().toEqualTypeOf<{ a: number }>();
    });

    it("should replace required with optional when conflicting", () => {
      type Result = Replace<{ a: string }, { a?: number }>;
      expectTypeOf<Result>().toEqualTypeOf<{ a: number }>();
    });
  });

  describe("Special property types", () => {
    it("should handle function properties", () => {
      type Result = Replace<
        { count: number; getValue: () => string },
        { getValue: () => number; setValue: (value: string) => void }
      >;
      expectTypeOf<Result>().toEqualTypeOf<{
        count: number;
        getValue: () => number;
        setValue: (value: string) => void;
      }>();
    });

    it("should handle array properties with conflicts", () => {
      type Result = Replace<
        { count: number; items: string[] },
        { items: number[]; metadata: { total: number } }
      >;
      expectTypeOf<Result>().toEqualTypeOf<{
        count: number;
        items: number[];
        metadata: { total: number };
      }>();
    });

    it("should handle union type replacements", () => {
      type Result = Replace<
        { type: "text"; value: number | string },
        { type: "boolean" | "text"; value: boolean }
      >;
      expectTypeOf<Result>().toEqualTypeOf<{
        type: "boolean" | "text";
        value: boolean;
      }>();
    });

    it("should preserve readonly modifiers", () => {
      type Result = Replace<
        { readonly id: string; name: string },
        { readonly email: string; readonly id: number }
      >;
      expectTypeOf<Result>().toEqualTypeOf<{
        readonly email: string;
        readonly id: number;
        name: string;
      }>();
    });

    it("should handle index signatures", () => {
      type Result = Replace<
        { [key: string]: unknown },
        { specificProp: string }
      >;
      expectTypeOf<Result>().toEqualTypeOf<{
        [x: number]: unknown;
        [x: string]: unknown;
        specificProp: string;
      }>();
    });
  });

  describe("Non-GenericObject Source handling", () => {
    it("should return Source when Target is object but Source is primitive", () => {
      type Result = Replace<{ a: string; b: number }, string>;
      expectTypeOf<Result>().toEqualTypeOf<string>();
    });

    it("should handle null replacement", () => {
      type Result = Replace<{ a: string }, null>;
      expectTypeOf<Result>().toEqualTypeOf<null>();
    });

    it("should handle undefined replacement", () => {
      type Result = Replace<{ a: string }, undefined>;
      expectTypeOf<Result>().toEqualTypeOf<undefined>();
    });
  });

  describe("NonNullable behavior", () => {
    it("should apply NonNullable when Target is not GenericObject", () => {
      type Result = Replace<string, null | number | undefined>;
      expectTypeOf<Result>().toEqualTypeOf<null | number | undefined>();
    });

    it("should preserve non-nullable types", () => {
      type Result = Replace<boolean, string>;
      expectTypeOf<Result>().toEqualTypeOf<string>();
    });
  });

  describe("Edge cases", () => {
    it("should handle never types", () => {
      type Result1 = Replace<never, { a: string }>;
      type Result2 = Replace<{ a: string }, never>;

      expectTypeOf<Result1>().toEqualTypeOf<{ a: string }>();
      expectTypeOf<Result2>().toEqualTypeOf<{ a: string }>();
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

  describe("Real-world scenarios", () => {
    it("should merge configuration objects", () => {
      type BaseConfig = { apiUrl: string; timeout: number };
      type UserConfig = { debug?: boolean; timeout: 5000 };
      type Result = Replace<BaseConfig, UserConfig>;

      expectTypeOf<Result>().toEqualTypeOf<{
        apiUrl: string;
        debug?: boolean;
        timeout: 5000;
      }>();
    });

    it("should merge store state slices with nested conflicts", () => {
      type AuthState = { isAuthenticated: boolean; user: { id: string } };
      type UserDetailsState = { user: { name: string } };
      type LoadingState = { error: null | string; loading: boolean };

      type Step1 = Replace<AuthState, UserDetailsState>;
      type Result = Replace<Step1, LoadingState>;

      expectTypeOf<Result>().toEqualTypeOf<{
        error: null | string;
        isAuthenticated: boolean;
        loading: boolean;
        user: { id: string; name: string };
      }>();
    });

    it("should handle chained replacements", () => {
      type Result = Replace<
        Replace<{ a: string; b: boolean }, { a: number; c: Date }>,
        { a: RegExp; d: Function }
      >;

      expectTypeOf<Result>().toEqualTypeOf<{
        a: RegExp;
        b: boolean;
        c: Date;
        d: Function;
      }>();
    });
  });

  describe("Extends relationships", () => {
    it("should satisfy extends with primitive replacement", () => {
      type Result = Replace<string, number>;

      expectTypeOf<Result>().toExtend<number>();
      expectTypeOf<number>().toExtend<Result>();
    });

    it("should satisfy extends with merged objects", () => {
      type Result = Replace<{ a: string }, { b: number }>;

      expectTypeOf<Result>().toExtend<{ a: string }>();
      expectTypeOf<Result>().toExtend<{ b: number }>();
      expectTypeOf<{ a: string; b: number }>().toExtend<Result>();
    });

    it("should satisfy extends with nested replacements", () => {
      type Result = Replace<
        { config: { api: string }; user: { id: string } },
        { config: { timeout: number } }
      >;

      expectTypeOf<Result>().toExtend<{
        config: { api: string; timeout: number };
      }>();
      expectTypeOf<Result>().toExtend<{ user: { id: string } }>();
    });

    it("should satisfy extends with property conflicts", () => {
      type Result = Replace<{ a: string }, { a: number }>;

      expectTypeOf<Result>().toExtend<{}>();
      expectTypeOf<Result>().toExtend<{ a: number }>();
    });

    it("should satisfy extends with union narrowing", () => {
      type Result = Replace<{ a: number | string }, { a: string }>;

      expectTypeOf<Result>().toExtend<{ a: string }>();
      expectTypeOf<{ a: string }>().toExtend<Result>();
    });

    it("should satisfy extends with complex inheritance", () => {
      interface Base {
        id: number;
      }
      interface Extended extends Base {
        name: string;
      }
      type Result = Replace<Base, { name: string }>;

      expectTypeOf<Result>().toExtend<Base>();
      expectTypeOf<Extended>().toExtend<Result>();
      expectTypeOf<Result>().toExtend<Extended>();
    });

    it("should satisfy extends with function properties", () => {
      type Result = Replace<
        { getValue: () => number },
        { setValue: (x: number) => void }
      >;

      expectTypeOf<Result>().toExtend<{ getValue: () => number }>();
      expectTypeOf<Result>().toExtend<{ setValue: (x: number) => void }>();
      expectTypeOf<{
        getValue: () => number;
        setValue: (x: number) => void;
      }>().toExtend<Result>();
    });

    it("should satisfy extends with array properties", () => {
      type Result = Replace<
        { items: string[] },
        { count: number; items: readonly string[] }
      >;

      expectTypeOf<Result>().toExtend<{ count: number }>();
      expectTypeOf<Result>().toExtend<{}>();
    });
  });
});
