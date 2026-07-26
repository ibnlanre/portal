import type { Contains } from "./index";

import { describe, expectTypeOf, it } from "vitest";

describe("Contains Type", () => {
  describe("Basic functionality", () => {
    it("should return 1 when type is contained in array", () => {
      type Result1 = Contains<string, [string, number, boolean]>;
      type Result2 = Contains<number, [string, number, boolean]>;
      type Result3 = Contains<boolean, [string, number, boolean]>;

      expectTypeOf<Result1>().toEqualTypeOf<1>();
      expectTypeOf<Result2>().toEqualTypeOf<1>();
      expectTypeOf<Result3>().toEqualTypeOf<1>();
    });

    it("should return 0 when type is not contained in array", () => {
      type Result1 = Contains<symbol, [string, number, boolean]>;
      type Result2 = Contains<object, [string, number, boolean]>;
      type Result3 = Contains<null, [string, number, boolean]>;

      expectTypeOf<Result1>().toEqualTypeOf<0>();
      expectTypeOf<Result2>().toEqualTypeOf<0>();
      expectTypeOf<Result3>().toEqualTypeOf<0>();
    });

    it("should work with empty arrays", () => {
      type Result1 = Contains<string, []>;
      type Result2 = Contains<number, []>;
      type Result3 = Contains<any, []>;

      expectTypeOf<Result1>().toEqualTypeOf<0>();
      expectTypeOf<Result2>().toEqualTypeOf<0>();
      // any type with empty array should return 0
      expectTypeOf<Result3>().toEqualTypeOf<0>();
    });
  });

  describe("Literal types", () => {
    it("should work with string literals", () => {
      type Result1 = Contains<"hello", ["hello", "world"]>;
      type Result2 = Contains<"foo", ["hello", "world"]>;
      type Result3 = Contains<"world", ["hello", "world"]>;

      expectTypeOf<Result1>().toEqualTypeOf<1>();
      expectTypeOf<Result2>().toEqualTypeOf<0>();
      expectTypeOf<Result3>().toEqualTypeOf<1>();
    });

    it("should work with number literals", () => {
      type Result1 = Contains<42, [1, 42, 100]>;
      type Result2 = Contains<99, [1, 42, 100]>;
      type Result3 = Contains<1, [1, 42, 100]>;

      expectTypeOf<Result1>().toEqualTypeOf<1>();
      expectTypeOf<Result2>().toEqualTypeOf<0>();
      expectTypeOf<Result3>().toEqualTypeOf<1>();
    });

    it("should work with boolean literals", () => {
      type Result1 = Contains<true, [true, false]>;
      type Result2 = Contains<false, [true, false]>;
      type Result3 = Contains<true, [false]>;

      expectTypeOf<Result1>().toEqualTypeOf<1>();
      expectTypeOf<Result2>().toEqualTypeOf<1>();
      expectTypeOf<Result3>().toEqualTypeOf<0>();
    });
  });

  describe("Union types", () => {
    it("should work with union types as search type", () => {
      type Result1 = Contains<number | string, [string, boolean]>;
      type Result2 = Contains<number | string, [boolean, symbol]>;
      type Result3 = Contains<"a" | "b", ["a", "c", "d"]>;

      expectTypeOf<Result1>().toEqualTypeOf<0>(); // union type doesn't directly match
      expectTypeOf<Result2>().toEqualTypeOf<0>();
      expectTypeOf<Result3>().toEqualTypeOf<0>(); // literal union doesn't directly match
    });

    it("should work with union types in array", () => {
      type Result1 = Contains<string, [number | string, boolean]>;
      type Result2 = Contains<number, [number | string, boolean]>;
      type Result3 = Contains<symbol, [number | string, boolean]>;

      expectTypeOf<Result1>().toEqualTypeOf<1>();
      expectTypeOf<Result2>().toEqualTypeOf<1>();
      expectTypeOf<Result3>().toEqualTypeOf<0>();
    });
  });

  describe("Object types", () => {
    it("should work with object types", () => {
      type User = { age: number; name: string };
      type Admin = { name: string; role: string };

      type Result1 = Contains<User, [User, Admin]>;
      type Result2 = Contains<Admin, [User, Admin]>;
      type Result3 = Contains<{ id: number }, [User, Admin]>;

      expectTypeOf<Result1>().toEqualTypeOf<1>();
      expectTypeOf<Result2>().toEqualTypeOf<1>();
      expectTypeOf<Result3>().toEqualTypeOf<0>();
    });

    it("should work with interface types", () => {
      interface IPerson {
        name: string;
      }

      interface IEmployee extends IPerson {
        id: number;
      }

      type Result1 = Contains<IPerson, [IPerson, IEmployee]>;
      type Result2 = Contains<IEmployee, [IPerson, IEmployee]>;
      type Result3 = Contains<{ age: number }, [IPerson, IEmployee]>;

      expectTypeOf<Result1>().toEqualTypeOf<1>();
      expectTypeOf<Result2>().toEqualTypeOf<1>();
      expectTypeOf<Result3>().toEqualTypeOf<0>();
    });
  });

  describe("Function types", () => {
    it("should work with function types", () => {
      type Fn1 = () => string;
      type Fn2 = (x: number) => boolean;
      type Fn3 = (a: string, b: number) => void;

      type Result1 = Contains<Fn1, [Fn1, Fn2]>;
      type Result2 = Contains<Fn2, [Fn1, Fn2]>;
      type Result3 = Contains<Fn3, [Fn1, Fn2]>;

      expectTypeOf<Result1>().toEqualTypeOf<1>();
      expectTypeOf<Result2>().toEqualTypeOf<1>();
      expectTypeOf<Result3>().toEqualTypeOf<0>();
    });
  });

  describe("Array and tuple types", () => {
    it("should work with array types", () => {
      type Result1 = Contains<string[], [string[], number[], boolean[]]>;
      type Result2 = Contains<number[], [string[], number[], boolean[]]>;
      type Result3 = Contains<symbol[], [string[], number[], boolean[]]>;

      expectTypeOf<Result1>().toEqualTypeOf<1>();
      expectTypeOf<Result2>().toEqualTypeOf<1>();
      expectTypeOf<Result3>().toEqualTypeOf<0>();
    });

    it("should work with tuple types", () => {
      type Tuple1 = [string, number];
      type Tuple2 = [boolean, string];
      type Tuple3 = [number, boolean, string];

      type Result1 = Contains<Tuple1, [Tuple1, Tuple2]>;
      type Result2 = Contains<Tuple2, [Tuple1, Tuple2]>;
      type Result3 = Contains<Tuple3, [Tuple1, Tuple2]>;

      expectTypeOf<Result1>().toEqualTypeOf<1>();
      expectTypeOf<Result2>().toEqualTypeOf<1>();
      expectTypeOf<Result3>().toEqualTypeOf<0>();
    });
  });

  describe("Special types", () => {
    it("should work with null and undefined", () => {
      type Result1 = Contains<null, [null, undefined, string]>;
      type Result2 = Contains<undefined, [null, undefined, string]>;
      type Result3 = Contains<null, [undefined, string]>;

      expectTypeOf<Result1>().toEqualTypeOf<1>();
      expectTypeOf<Result2>().toEqualTypeOf<1>();
      expectTypeOf<Result3>().toEqualTypeOf<0>();
    });

    it("should work with never type", () => {
      type Result1 = Contains<never, [never, string, number]>;
      type Result2 = Contains<never, [string, number]>;

      expectTypeOf<Result1>().toEqualTypeOf<1>();
      expectTypeOf<Result2>().toEqualTypeOf<0>();
    });

    it("should work with any type", () => {
      type Result1 = Contains<any, [any, string, number]>;
      type Result2 = Contains<any, [string, number]>;

      expectTypeOf<Result1>().toEqualTypeOf<1>();
      expectTypeOf<Result2>().toEqualTypeOf<1>();
    });

    it("should work with unknown type", () => {
      type Result1 = Contains<unknown, [unknown, string, number]>;
      type Result2 = Contains<unknown, [string, number]>;

      expectTypeOf<Result1>().toEqualTypeOf<1>();
      expectTypeOf<Result2>().toEqualTypeOf<0>();
    });
  });

  describe("Readonly arrays", () => {
    it("should work with readonly arrays", () => {
      type Result1 = Contains<string, readonly [string, number, boolean]>;
      type Result2 = Contains<symbol, readonly [string, number, boolean]>;

      expectTypeOf<Result1>().toEqualTypeOf<1>();
      expectTypeOf<Result2>().toEqualTypeOf<0>();
    });

    it("should work with const assertions", () => {
      type ConstArray = readonly ["hello", "world", 42];

      type Result1 = Contains<"hello", ConstArray>;
      type Result2 = Contains<"world", ConstArray>;
      type Result3 = Contains<42, ConstArray>;
      type Result4 = Contains<"foo", ConstArray>;

      expectTypeOf<Result1>().toEqualTypeOf<1>();
      expectTypeOf<Result2>().toEqualTypeOf<1>();
      expectTypeOf<Result3>().toEqualTypeOf<1>();
      expectTypeOf<Result4>().toEqualTypeOf<0>();
    });
  });

  describe("Complex scenarios", () => {
    it("should work with generic types", () => {
      type GenericArray<T> = readonly [T, string, number];

      type Result1 = Contains<boolean, GenericArray<boolean>>;
      type Result2 = Contains<string, GenericArray<boolean>>;
      type Result3 = Contains<symbol, GenericArray<boolean>>;

      expectTypeOf<Result1>().toEqualTypeOf<1>();
      expectTypeOf<Result2>().toEqualTypeOf<1>();
      expectTypeOf<Result3>().toEqualTypeOf<0>();
    });

    it("should work with conditional types in arrays", () => {
      type ConditionalType<T> = T extends string ? "string" : "not-string";

      type Result1 = Contains<"string", [ConditionalType<string>, number]>;
      type Result2 = Contains<"not-string", [ConditionalType<number>, boolean]>;
      type Result3 = Contains<"unknown", [ConditionalType<string>, number]>;

      expectTypeOf<Result1>().toEqualTypeOf<1>();
      expectTypeOf<Result2>().toEqualTypeOf<1>();
      expectTypeOf<Result3>().toEqualTypeOf<0>();
    });

    it("should work with mapped types", () => {
      type StringifiedKeys<T> = {
        [K in keyof T]: string;
      };

      type User = { age: number; name: string };
      type StringifiedUser = StringifiedKeys<User>;

      type Result1 = Contains<StringifiedUser, [StringifiedUser, User]>;
      type Result2 = Contains<User, [StringifiedUser, User]>;
      type Result3 = Contains<{ id: string }, [StringifiedUser, User]>;

      expectTypeOf<Result1>().toEqualTypeOf<1>();
      expectTypeOf<Result2>().toEqualTypeOf<1>();
      expectTypeOf<Result3>().toEqualTypeOf<0>();
    });
  });

  describe("Type relationships with toExtend", () => {
    it("should test extends relationships for contained types", () => {
      type ContainedResult = Contains<string, [string, number, boolean]>;
      type NotContainedResult = Contains<symbol, [string, number, boolean]>;

      expectTypeOf<ContainedResult>().toExtend<1>();
      expectTypeOf<1>().toExtend<ContainedResult>();

      expectTypeOf<NotContainedResult>().toExtend<0>();
      expectTypeOf<0>().toExtend<NotContainedResult>();

      expectTypeOf<ContainedResult>().toExtend<number>();
      expectTypeOf<NotContainedResult>().toExtend<number>();
    });

    it("should test extends with union results", () => {
      type MaybeContained<T, Arr extends readonly unknown[]> = Contains<T, Arr>;

      type StringResult = MaybeContained<string, [string, number]>;
      type SymbolResult = MaybeContained<symbol, [string, number]>;

      expectTypeOf<StringResult>().toExtend<1>();
      expectTypeOf<SymbolResult>().toExtend<0>();
    });
  });

  describe("Edge cases", () => {
    it("should handle very long arrays", () => {
      type LongArray = readonly [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
      ];

      type Result1 = Contains<1, LongArray>;
      type Result2 = Contains<20, LongArray>;
      type Result3 = Contains<21, LongArray>;

      expectTypeOf<Result1>().toEqualTypeOf<1>();
      expectTypeOf<Result2>().toEqualTypeOf<1>();
      expectTypeOf<Result3>().toEqualTypeOf<0>();
    });

    it("should handle arrays with mixed types", () => {
      type MixedArray = readonly [
        string,
        42,
        true,
        null,
        undefined,
        symbol,
        () => void,
        { key: "value" },
        [1, 2, 3],
      ];

      type Result1 = Contains<string, MixedArray>;
      type Result2 = Contains<42, MixedArray>;
      type Result3 = Contains<false, MixedArray>;
      type Result4 = Contains<{ key: "value" }, MixedArray>;

      expectTypeOf<Result1>().toEqualTypeOf<1>();
      expectTypeOf<Result2>().toEqualTypeOf<1>();
      expectTypeOf<Result3>().toEqualTypeOf<0>();
      expectTypeOf<Result4>().toEqualTypeOf<1>();
    });

    it("should handle duplicate types in array", () => {
      type DuplicateArray = readonly [string, string, number, string, boolean];

      type Result1 = Contains<string, DuplicateArray>;
      type Result2 = Contains<number, DuplicateArray>;
      type Result3 = Contains<symbol, DuplicateArray>;

      expectTypeOf<Result1>().toEqualTypeOf<1>();
      expectTypeOf<Result2>().toEqualTypeOf<1>();
      expectTypeOf<Result3>().toEqualTypeOf<0>();
    });
  });
});
