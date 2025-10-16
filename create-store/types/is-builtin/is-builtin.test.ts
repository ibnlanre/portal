import type { IsBuiltIn } from "./index";

import { describe, expectTypeOf, it } from "vitest";

describe("IsBuiltIn Type", () => {
  describe("Special types", () => {
    it("should return 1 for never type", () => {
      type Result = IsBuiltIn<never>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for any type", () => {
      type Result = IsBuiltIn<any>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for unknown type", () => {
      type Result = IsBuiltIn<unknown>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });
  });

  describe("Primitive types", () => {
    it("should return 1 for string", () => {
      type Result = IsBuiltIn<string>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for number", () => {
      type Result = IsBuiltIn<number>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for boolean", () => {
      type Result = IsBuiltIn<boolean>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for null", () => {
      type Result = IsBuiltIn<null>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for undefined", () => {
      type Result = IsBuiltIn<undefined>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for symbol", () => {
      type Result = IsBuiltIn<symbol>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for bigint", () => {
      type Result = IsBuiltIn<bigint>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });
  });

  describe("Reference types - Functions", () => {
    it("should return 1 for Function", () => {
      type Result = IsBuiltIn<Function>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for function types", () => {
      type Result = IsBuiltIn<() => void>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for function with parameters", () => {
      type Result = IsBuiltIn<(x: number) => string>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });
  });

  describe("Reference types - Arrays", () => {
    it("should return 1 for Array<any>", () => {
      type Result = IsBuiltIn<Array<any>>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for string arrays", () => {
      type Result = IsBuiltIn<string[]>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for number arrays", () => {
      type Result = IsBuiltIn<number[]>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for ReadonlyArray<any>", () => {
      type Result = IsBuiltIn<ReadonlyArray<any>>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for readonly string arrays", () => {
      type Result = IsBuiltIn<readonly string[]>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for object arrays", () => {
      interface User {
        id: number;
        name: string;
      }
      type Result = IsBuiltIn<User[]>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });
  });

  describe("Reference types - Collections", () => {
    it("should return 1 for Set<any>", () => {
      type Result = IsBuiltIn<Set<any>>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for Set<string>", () => {
      type Result = IsBuiltIn<Set<string>>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for ReadonlySet<any>", () => {
      type Result = IsBuiltIn<ReadonlySet<any>>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for Map<any, any>", () => {
      type Result = IsBuiltIn<Map<any, any>>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for Map<string, number>", () => {
      type Result = IsBuiltIn<Map<string, number>>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for ReadonlyMap<any, any>", () => {
      type Result = IsBuiltIn<ReadonlyMap<any, any>>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for WeakMap<WeakKey, any>", () => {
      type Result = IsBuiltIn<WeakMap<WeakKey, any>>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for WeakSet<WeakKey>", () => {
      type Result = IsBuiltIn<WeakSet<WeakKey>>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });
  });

  describe("Reference types - Built-in objects", () => {
    it("should return 1 for Date", () => {
      type Result = IsBuiltIn<Date>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for RegExp", () => {
      type Result = IsBuiltIn<RegExp>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for Error", () => {
      type Result = IsBuiltIn<Error>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for Promise<any>", () => {
      type Result = IsBuiltIn<Promise<any>>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for Promise<string>", () => {
      type Result = IsBuiltIn<Promise<string>>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });
  });

  describe("Reference types - Typed arrays", () => {
    it("should return 1 for ArrayBuffer", () => {
      type Result = IsBuiltIn<ArrayBuffer>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for SharedArrayBuffer", () => {
      type Result = IsBuiltIn<SharedArrayBuffer>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for DataView", () => {
      type Result = IsBuiltIn<DataView>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for Int8Array", () => {
      type Result = IsBuiltIn<Int8Array>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for Uint8Array", () => {
      type Result = IsBuiltIn<Uint8Array>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for Float32Array", () => {
      type Result = IsBuiltIn<Float32Array>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for BigInt64Array", () => {
      type Result = IsBuiltIn<BigInt64Array>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });
  });

  describe("Reference types - Wrapper objects", () => {
    it("should return 1 for String wrapper", () => {
      type Result = IsBuiltIn<String>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for Number wrapper", () => {
      type Result = IsBuiltIn<Number>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for Boolean wrapper", () => {
      type Result = IsBuiltIn<Boolean>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for Symbol wrapper", () => {
      type Result = IsBuiltIn<Symbol>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for BigInt wrapper", () => {
      type Result = IsBuiltIn<BigInt>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });
  });

  describe("Non-built-in types", () => {
    it("should return 0 for empty object", () => {
      type Result = IsBuiltIn<{}>;
      expectTypeOf<Result>().toEqualTypeOf<0>();
    });

    it("should return 0 for plain objects", () => {
      type Result = IsBuiltIn<{ a: string }>;
      expectTypeOf<Result>().toEqualTypeOf<0>();
    });

    it("should return 0 for interface types", () => {
      interface User {
        id: number;
        name: string;
      }
      type Result = IsBuiltIn<User>;
      expectTypeOf<Result>().toEqualTypeOf<0>();
    });

    it("should return 0 for custom classes", () => {
      class CustomClass {
        prop: string = "";
      }
      type Result = IsBuiltIn<CustomClass>;
      expectTypeOf<Result>().toEqualTypeOf<0>();
    });

    it("should return 0 for object literals", () => {
      type Result = IsBuiltIn<{ x: number; y: number }>;
      expectTypeOf<Result>().toEqualTypeOf<0>();
    });

    it("should return 0 for nested objects", () => {
      type Result = IsBuiltIn<{ user: { id: number; name: string } }>;
      expectTypeOf<Result>().toEqualTypeOf<0>();
    });
  });

  describe("Union types", () => {
    it("should return 0 for union with non-built-in (extends behavior)", () => {
      type Result = IsBuiltIn<string | { name: string }>;
      expectTypeOf<Result>().toEqualTypeOf<0>();
    });

    it("should return 1 for union of built-ins", () => {
      type Result = IsBuiltIn<number | string>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for union including arrays", () => {
      type Result = IsBuiltIn<number[] | string[]>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });
  });

  describe("Literal types", () => {
    it("should return 1 for string literals", () => {
      type Result = IsBuiltIn<"hello">;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for number literals", () => {
      type Result = IsBuiltIn<42>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should return 1 for boolean literals", () => {
      type Result = IsBuiltIn<true>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });
  });

  describe("Algorithm priority verification", () => {
    it("should handle never before other checks", () => {
      type Result = IsBuiltIn<never>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should handle any before BuiltIn check", () => {
      type Result = IsBuiltIn<any>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should handle unknown before BuiltIn check", () => {
      type Result = IsBuiltIn<unknown>;
      expectTypeOf<Result>().toEqualTypeOf<1>();
    });

    it("should fall back to BuiltIn check for normal types", () => {
      type Result1 = IsBuiltIn<string>;
      type Result2 = IsBuiltIn<{ name: string }>;

      expectTypeOf<Result1>().toEqualTypeOf<1>();
      expectTypeOf<Result2>().toEqualTypeOf<0>();
    });
  });
});
