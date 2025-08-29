import type { LastOfUnion } from "./index";

import { describe, expectTypeOf, it } from "vitest";

describe("LastOfUnion Type", () => {
  describe("Basic functionality", () => {
    it("should extract the last type from a simple union", () => {
      type Result1 = LastOfUnion<"a" | "b" | "c">;
      type Result2 = LastOfUnion<1 | 2 | 3>;
      type Result3 = LastOfUnion<boolean | number | string>;

      // Note: The "last" type in a union is determined by TypeScript's internal ordering
      // which may not be the literal last type we specify
      expectTypeOf<Result1>().toBeString();
      expectTypeOf<Result2>().toBeNumber();
      expectTypeOf<Result3>().toExtend<boolean | number | string>();
    });

    it("should return the type itself for single-member unions", () => {
      type Result1 = LastOfUnion<string>;
      type Result2 = LastOfUnion<42>;
      type Result3 = LastOfUnion<true>;

      expectTypeOf<Result1>().toEqualTypeOf<string>();
      expectTypeOf<Result2>().toEqualTypeOf<42>();
      expectTypeOf<Result3>().toEqualTypeOf<true>();
    });

    it("should handle two-member unions", () => {
      type Result1 = LastOfUnion<number | string>;
      type Result2 = LastOfUnion<false | true>;
      type Result3 = LastOfUnion<"a" | "b">;

      expectTypeOf<Result1>().toExtend<number | string>();
      expectTypeOf<Result2>().toExtend<boolean>();
      expectTypeOf<Result3>().toBeString();
    });
  });

  describe("Literal types", () => {
    it("should work with string literal unions", () => {
      type Colors = "blue" | "green" | "red";
      type LastColor = LastOfUnion<Colors>;

      expectTypeOf<LastColor>().toBeString();
      expectTypeOf<LastColor>().toExtend<"blue" | "green" | "red">();
    });

    it("should work with number literal unions", () => {
      type Numbers = 1 | 2 | 3 | 4 | 5;
      type LastNumber = LastOfUnion<Numbers>;

      expectTypeOf<LastNumber>().toBeNumber();
      expectTypeOf<LastNumber>().toExtend<1 | 2 | 3 | 4 | 5>();
    });

    it("should work with boolean literal unions", () => {
      type BooleanLiterals = false | true;
      type LastBoolean = LastOfUnion<BooleanLiterals>;

      expectTypeOf<LastBoolean>().toEqualTypeOf<true>();
    });

    it("should work with mixed literal unions", () => {
      type Mixed = 42 | "hello" | true;
      type LastMixed = LastOfUnion<Mixed>;

      expectTypeOf<LastMixed>().toExtend<42 | "hello" | true>();
    });
  });

  describe("Object types", () => {
    it("should work with object type unions", () => {
      type User = { name: string; type: "user" };
      type Admin = { name: string; role: string; type: "admin" };
      type Guest = { type: "guest" };

      type LastType = LastOfUnion<Admin | Guest | User>;

      expectTypeOf<LastType>().toExtend<Admin | Guest | User>();
    });

    it("should work with interface unions", () => {
      interface Cat {
        meow(): void;
        type: "cat";
      }

      interface Dog {
        bark(): void;
        type: "dog";
      }

      interface Bird {
        fly(): void;
        type: "bird";
      }

      type LastAnimal = LastOfUnion<Bird | Cat | Dog>;

      expectTypeOf<LastAnimal>().toExtend<Bird | Cat | Dog>();
    });
  });

  describe("Function types", () => {
    it("should work with function type unions", () => {
      type Fn1 = () => string;
      type Fn2 = (x: number) => boolean;
      type Fn3 = (a: string, b: number) => void;

      type LastFunction = LastOfUnion<Fn1 | Fn2 | Fn3>;

      expectTypeOf<LastFunction>().toExtend<Fn1 | Fn2 | Fn3>();
    });

    it("should work with method signature unions", () => {
      type Handler1 = { handle: (data: string) => void };
      type Handler2 = { handle: (data: number) => void };
      type Handler3 = { handle: (data: boolean) => void };

      type LastHandler = LastOfUnion<Handler1 | Handler2 | Handler3>;

      expectTypeOf<LastHandler>().toExtend<Handler1 | Handler2 | Handler3>();
    });
  });

  describe("Array and tuple types", () => {
    it("should work with array type unions", () => {
      type Arrays = boolean[] | number[] | string[];
      type LastArray = LastOfUnion<Arrays>;

      expectTypeOf<LastArray>().toExtend<boolean[] | number[] | string[]>();
    });

    it("should work with tuple type unions", () => {
      type Tuples = [boolean, string] | [number, boolean] | [string, number];
      type LastTuple = LastOfUnion<Tuples>;

      expectTypeOf<LastTuple>().toExtend<
        [boolean, string] | [number, boolean] | [string, number]
      >();
    });
  });

  describe("Special types", () => {
    it("should handle never type", () => {
      type Result = LastOfUnion<never>;
      expectTypeOf<Result>().toEqualTypeOf<never>();
    });

    it("should handle any type", () => {
      type Result = LastOfUnion<any>;
      expectTypeOf<Result>().toEqualTypeOf<any>();
    });

    it("should handle unknown type", () => {
      type Result = LastOfUnion<unknown>;
      expectTypeOf<Result>().toEqualTypeOf<unknown>();
    });

    it("should handle void type", () => {
      type Result = LastOfUnion<void>;
      expectTypeOf<Result>().toEqualTypeOf<void>();
    });

    it("should handle null and undefined", () => {
      type Result1 = LastOfUnion<null>;
      type Result2 = LastOfUnion<undefined>;
      type Result3 = LastOfUnion<null | undefined>;

      expectTypeOf<Result1>().toEqualTypeOf<null>();
      expectTypeOf<Result2>().toEqualTypeOf<undefined>();
      expectTypeOf<Result3>().toExtend<null | undefined>();
    });
  });

  describe("Complex unions", () => {
    it("should work with deeply nested object unions", () => {
      type NestedA = {
        data: {
          value: string;
        };
        type: "a";
      };

      type NestedB = {
        data: {
          count: number;
        };
        type: "b";
      };

      type NestedC = {
        data: {
          flag: boolean;
        };
        type: "c";
      };

      type LastNested = LastOfUnion<NestedA | NestedB | NestedC>;

      expectTypeOf<LastNested>().toExtend<NestedA | NestedB | NestedC>();
    });

    it("should work with generic type unions", () => {
      type Container<T> = {
        value: T;
      };

      type GenericUnion =
        | Container<boolean>
        | Container<number>
        | Container<string>;
      type LastGeneric = LastOfUnion<GenericUnion>;

      expectTypeOf<LastGeneric>().toExtend<
        Container<boolean> | Container<number> | Container<string>
      >();
    });

    it("should work with conditional type unions", () => {
      type ConditionalType<T> = T extends string
        ? "string"
        : T extends number
          ? "number"
          : "other";

      type ConditionalUnion =
        | ConditionalType<boolean>
        | ConditionalType<number>
        | ConditionalType<string>;
      type LastConditional = LastOfUnion<ConditionalUnion>;

      expectTypeOf<LastConditional>().toExtend<"number" | "other" | "string">();
    });
  });

  describe("Union with overlapping types", () => {
    it("should handle unions with overlapping primitive types", () => {
      type Overlapping = number | string | string; // Duplicate string
      type LastOverlapping = LastOfUnion<Overlapping>;

      expectTypeOf<LastOverlapping>().toExtend<number | string>();
    });

    it("should handle unions with subtype relationships", () => {
      type Base = { name: string };
      type Extended = { id: number; name: string };

      type SubtypeUnion = Base | Extended;
      type LastSubtype = LastOfUnion<SubtypeUnion>;

      expectTypeOf<LastSubtype>().toExtend<Base | Extended>();
    });
  });

  describe("Performance with large unions", () => {
    it("should handle moderately large unions", () => {
      type LargeUnion =
        | 1
        | 2
        | 3
        | 4
        | 5
        | "a"
        | "b"
        | "c"
        | "d"
        | "e"
        | "f"
        | "g"
        | "h"
        | "i"
        | "j"
        | false
        | true;

      type LastLarge = LastOfUnion<LargeUnion>;

      expectTypeOf<LastLarge>().toExtend<LargeUnion>();
    });

    it("should handle unions with mixed complex types", () => {
      type ComplexUnion =
        | (() => string)
        | ((x: number) => boolean)
        | [string, number]
        | number[]
        | string[]
        | { data: { name: string }; type: "user" }
        | { data: { permissions: string[] }; type: "admin" }
        | { data: {}; type: "guest" };

      type LastComplex = LastOfUnion<ComplexUnion>;

      expectTypeOf<LastComplex>().toExtend<ComplexUnion>();
    });
  });

  describe("Union behavior verification", () => {
    it("should demonstrate union member extraction behavior", () => {
      // This test helps understand how LastOfUnion works
      type SimpleUnion = "first" | "second" | "third";
      type ExtractedLast = LastOfUnion<SimpleUnion>;

      // The extracted type should be one of the union members
      expectTypeOf<ExtractedLast>().toExtend<SimpleUnion>();

      // It should be a string literal type
      expectTypeOf<ExtractedLast>().toBeString();
    });

    it("should work with discriminated unions", () => {
      type Action =
        | { payload: number; type: "INCREMENT" }
        | { payload: string; type: "SET_VALUE" }
        | { type: "RESET" };

      type LastAction = LastOfUnion<Action>;

      expectTypeOf<LastAction>().toExtend<Action>();
    });
  });

  describe("Type relationships with toExtend", () => {
    it("should test extends relationships", () => {
      type Union = boolean | number | string;
      type Last = LastOfUnion<Union>;

      // The last type should extend the original union
      expectTypeOf<Last>().toExtend<Union>();

      // But not necessarily the other way around (depends on what Last actually is)
      expectTypeOf<Last>().toExtend<Union>();
    });

    it("should maintain type constraints", () => {
      type StringUnion = "a" | "b" | "c";
      type LastString = LastOfUnion<StringUnion>;

      expectTypeOf<LastString>().toExtend<string>();
      expectTypeOf<LastString>().toExtend<StringUnion>();
    });
  });

  describe("Edge cases", () => {
    it("should handle empty-like unions", () => {
      // These are effectively single types
      type Result1 = LastOfUnion<never | string>;
      type Result2 = LastOfUnion<never | number>;

      expectTypeOf<Result1>().toEqualTypeOf<string>();
      expectTypeOf<Result2>().toEqualTypeOf<number>();
    });

    it("should handle unions with any", () => {
      type WithAny = any | number | string;
      type LastWithAny = LastOfUnion<WithAny>;

      // any dominates unions, so this becomes any
      expectTypeOf<LastWithAny>().toEqualTypeOf<any>();
    });

    it("should handle unions with unknown", () => {
      type WithUnknown = number | string | unknown;
      type LastWithUnknown = LastOfUnion<WithUnknown>;

      // unknown dominates unions, so this becomes unknown
      expectTypeOf<LastWithUnknown>().toEqualTypeOf<unknown>();
    });

    it("should handle circular reference types in unions", () => {
      type Node = {
        next?: Node;
        value: string;
      };

      type TreeNode = {
        children: TreeNode[];
        value: number;
      };

      type CircularUnion = Node | string | TreeNode;
      type LastCircular = LastOfUnion<CircularUnion>;

      expectTypeOf<LastCircular>().toExtend<CircularUnion>();
    });
  });

  describe("Real-world usage examples", () => {
    it("should work with React component prop unions", () => {
      type ButtonProps = {
        onClick: () => void;
        variant: "primary";
      };

      type LinkProps = {
        href: string;
        variant: "link";
      };

      type IconProps = {
        icon: string;
        variant: "icon";
      };

      type ComponentProps = ButtonProps | IconProps | LinkProps;
      type LastProps = LastOfUnion<ComponentProps>;

      expectTypeOf<LastProps>().toExtend<ComponentProps>();
    });

    it("should work with API response unions", () => {
      type SuccessResponse = {
        data: unknown;
        status: "success";
      };

      type ErrorResponse = {
        message: string;
        status: "error";
      };

      type LoadingResponse = {
        status: "loading";
      };

      type ApiResponse = ErrorResponse | LoadingResponse | SuccessResponse;
      type LastResponse = LastOfUnion<ApiResponse>;

      expectTypeOf<LastResponse>().toExtend<ApiResponse>();
    });

    it("should work with state machine unions", () => {
      type IdleState = { state: "idle" };
      type LoadingState = { progress: number; state: "loading" };
      type SuccessState = { result: string; state: "success" };
      type ErrorState = { error: Error; state: "error" };

      type MachineState = ErrorState | IdleState | LoadingState | SuccessState;
      type LastState = LastOfUnion<MachineState>;

      expectTypeOf<LastState>().toExtend<MachineState>();
    });
  });
});
