import type { Prettify } from "./index";

import { describe, it } from "vitest";
import { expectTypeOf } from "vitest";

describe("Prettify Type", () => {
  describe("Basic functionality", () => {
    it("should handle empty array", () => {
      type Result = Prettify<[]>;

      expectTypeOf<Result>().toEqualTypeOf<{}>();
    });

    it("should handle single object", () => {
      type Input = [{ a: string }];
      type Result = Prettify<Input>;

      expectTypeOf<Result>().toEqualTypeOf<{ a: string }>();
    });

    it("should merge two objects with different properties", () => {
      type Input = [{ a: string }, { b: number }];
      type Result = Prettify<Input>;

      expectTypeOf<Result>().toEqualTypeOf<{ a: string; b: number }>();
    });

    it("should merge three objects with different properties", () => {
      type Input = [{ a: string }, { b: number }, { c: boolean }];
      type Result = Prettify<Input>;

      expectTypeOf<Result>().toEqualTypeOf<{
        a: string;
        b: number;
        c: boolean;
      }>();
    });
  });

  describe("Property intersection behavior", () => {
    it("should create intersection for conflicting properties", () => {
      type Input = [{ a: string }, { a: number }];
      type Result = Prettify<Input>;

      expectTypeOf<Result>().toEqualTypeOf<{ a: never }>();
    });

    it("should handle compatible intersections", () => {
      type Input = [{ a: number | string }, { a: string }];
      type Result = Prettify<Input>;

      expectTypeOf<Result>().toEqualTypeOf<{ a: string }>();
    });

    it("should handle object intersections", () => {
      type Input = [{ user: { name: string } }, { user: { age: number } }];
      type Result = Prettify<Input>;

      expectTypeOf<Result>().toEqualTypeOf<{
        user: { age: number } & { name: string };
      }>();
    });
  });

  describe("Complex intersections", () => {
    it("should handle nested object merging", () => {
      type Input = [
        { config: { api: string } },
        { config: { timeout: number } },
        { settings: { theme: string } },
      ];
      type Result = Prettify<Input>;

      expectTypeOf<Result>().toEqualTypeOf<{
        config: { api: string } & { timeout: number };
        settings: { theme: string };
      }>();
    });

    it("should handle optional properties", () => {
      type Input = [{ a?: string }, { b: number }];
      type Result = Prettify<Input>;

      expectTypeOf<Result>().toEqualTypeOf<{
        a?: string;
        b: number;
      }>();
    });

    it("should intersect optional and required properties", () => {
      type Input = [{ a?: string }, { a: string }];
      type Result = Prettify<Input>;

      expectTypeOf<Result>().toEqualTypeOf<{ a: string }>();
    });

    it("should handle function properties", () => {
      type Input = [
        { getName: () => string },
        { setName: (name: string) => void },
        { age: number },
      ];
      type Result = Prettify<Input>;

      expectTypeOf<Result>().toEqualTypeOf<{
        age: number;
        getName: () => string;
        setName: (name: string) => void;
      }>();
    });
  });

  describe("Edge cases", () => {
    it("should handle single empty object", () => {
      type Input = [{}];
      type Result = Prettify<Input>;

      expectTypeOf<Result>().toEqualTypeOf<{}>();
    });

    it("should handle multiple empty objects", () => {
      type Input = [{}, {}, {}];
      type Result = Prettify<Input>;

      expectTypeOf<Result>().toEqualTypeOf<{}>();
    });

    it("should handle mix of empty and non-empty objects", () => {
      type Input = [{}, { a: string }, {}, { b: number }, {}];
      type Result = Prettify<Input>;

      expectTypeOf<Result>().toEqualTypeOf<{
        a: string;
        b: number;
      }>();
    });
  });

  describe("Real-world usage examples", () => {
    it("should merge compatible configuration objects", () => {
      type BaseConfig = {
        apiUrl: string;
        timeout: number;
      };

      type UserConfig = {
        debug?: boolean;
        timeout: 5000;
      };

      type RuntimeConfig = {
        timestamp: Date;
      };

      type Input = [BaseConfig, UserConfig, RuntimeConfig];
      type Result = Prettify<Input>;

      expectTypeOf<Result>().toEqualTypeOf<{
        apiUrl: string;
        debug?: boolean;
        timeout: 5000;
        timestamp: Date;
      }>();
    });

    it("should merge store state slices", () => {
      type AuthState = {
        isAuthenticated: boolean;
        user: { id: string };
      };

      type UserDetailsState = {
        user: { name: string };
      };

      type UIState = {
        error: null | string;
        loading: boolean;
      };

      type Input = [AuthState, UserDetailsState, UIState];
      type Result = Prettify<Input>;

      expectTypeOf<Result>().toEqualTypeOf<{
        error: null | string;
        isAuthenticated: boolean;
        loading: boolean;
        user: { id: string } & { name: string };
      }>();
    });

    it("should handle union type intersections", () => {
      type Input = [
        { value: number | string },
        { value: boolean | number },
        { extra: string },
      ];
      type Result = Prettify<Input>;

      expectTypeOf<Result>().toEqualTypeOf<{
        extra: string;
        value: number;
      }>();
    });
  });

  describe("Type distribution behavior", () => {
    it("should maintain readonly modifiers", () => {
      type Input = [{ readonly a: string }, { b: number }];
      type Result = Prettify<Input>;

      expectTypeOf<Result>().toEqualTypeOf<{
        readonly a: string;
        b: number;
      }>();
    });

    it("should handle index signatures", () => {
      type Input = [{ [key: string]: unknown }, { specificProp: string }];
      type Result = Prettify<Input>;

      expectTypeOf<Result>().toEqualTypeOf<{
        [key: string]: unknown;
        specificProp: string;
      }>();
    });
  });

  describe("Extends relationships", () => {
    it("should test extends relationships with empty array", () => {
      type EmptyResult = Prettify<[]>;

      expectTypeOf<EmptyResult>().toExtend<{}>();
      expectTypeOf<{}>().toExtend<EmptyResult>();
    });

    it("should test extends relationships with single object", () => {
      type SingleObject = Prettify<[{ a: number }]>;

      expectTypeOf<SingleObject>().toExtend<{ a: number }>();
      expectTypeOf<{ a: number }>().toExtend<SingleObject>();

      expectTypeOf<SingleObject>().toExtend<{}>();
    });

    it("should test extends relationships with merged objects", () => {
      type MergedObjects = Prettify<[{ a: number }, { b: string }]>;

      expectTypeOf<MergedObjects>().toExtend<{ a: number }>();
      expectTypeOf<MergedObjects>().toExtend<{ b: string }>();
      expectTypeOf<MergedObjects>().toExtend<{}>();

      expectTypeOf<{ a: number; b: string }>().toExtend<MergedObjects>();
    });

    it("should test extends with property conflicts", () => {
      type ConflictingProps = Prettify<[{ a: string }, { a: number }]>;

      expectTypeOf<ConflictingProps>().toExtend<{}>();
    });

    it("should test extends with compatible intersections", () => {
      type CompatibleIntersection = Prettify<
        [{ a: number | string }, { a: string }]
      >;

      expectTypeOf<CompatibleIntersection>().toExtend<{ a: string }>();
      expectTypeOf<{ a: string }>().toExtend<CompatibleIntersection>();

      expectTypeOf<CompatibleIntersection>().toExtend<{}>();
    });

    it("should test extends with nested objects", () => {
      type NestedMerge = Prettify<
        [{ user: { id: number } }, { user: { name: string } }]
      >;

      expectTypeOf<NestedMerge>().toExtend<{}>();

      expectTypeOf<NestedMerge>().toExtend<{
        user: { id: number; name: string };
      }>();
    });

    it("should test extends with optional properties", () => {
      type OptionalMerge = Prettify<[{ a?: string }, { a: string; b: number }]>;

      expectTypeOf<OptionalMerge>().toExtend<{ a: string }>();
      expectTypeOf<OptionalMerge>().toExtend<{ b: number }>();
      expectTypeOf<OptionalMerge>().toExtend<{}>();
    });

    it("should test extends with function properties", () => {
      type FunctionMerge = Prettify<
        [{ getValue: () => number }, { setValue: (x: number) => void }]
      >;

      expectTypeOf<FunctionMerge>().toExtend<{ getValue: () => number }>();
      expectTypeOf<FunctionMerge>().toExtend<{
        setValue: (x: number) => void;
      }>();

      expectTypeOf<{
        getValue: () => number;
        setValue: (x: number) => void;
      }>().toExtend<FunctionMerge>();
    });

    it("should test extends with complex inheritance chains", () => {
      interface Base {
        id: number;
      }

      interface Extended extends Base {
        name: string;
      }

      type PrettifiedExtended = Prettify<[Base, { name: string }]>;

      expectTypeOf<PrettifiedExtended>().toExtend<Base>();
      expectTypeOf<Extended>().toExtend<PrettifiedExtended>();
      expectTypeOf<PrettifiedExtended>().toExtend<Extended>();
    });

    it("should test extends with array and tuple properties", () => {
      type ArrayMerge = Prettify<
        [{ items: string[] }, { count: number; items: readonly string[] }]
      >;

      expectTypeOf<ArrayMerge>().toExtend<{ count: number }>();
      expectTypeOf<ArrayMerge>().toExtend<{}>();
    });

    it("should test extends with discriminated unions", () => {
      type UnionMerge = Prettify<
        [{ id: number; type: "user" }, { permissions: string[]; type: "admin" }]
      >;

      expectTypeOf<UnionMerge>().toBeNever();
    });
  });
});
