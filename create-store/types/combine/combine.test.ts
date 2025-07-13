import type { Combine } from "./index";

import { describe, expectTypeOf, it } from "vitest";

describe("Combine", () => {
  type BaseStore = {
    id: string;
    name: string;
  };

  type Actions1 = {
    action1: () => void;
    shared: string;
  };

  type Actions2 = {
    action2: () => void;
    shared: number;
  };

  type Actions3 = {
    action3: () => void;
    extra: boolean;
  };

  describe("Union Dictionary Types vs Readonly Dictionary Types", () => {
    it("should produce the same result for union and tuple array types", () => {
      type UnionResult = Combine<BaseStore, (Actions1 | Actions2 | Actions3)[]>;

      type TupleResult = Combine<BaseStore, [Actions1, Actions2, Actions3]>;

      expectTypeOf<UnionResult>().toEqualTypeOf<TupleResult>();

      type Expected = {
        action1: () => void;
        action2: () => void;
        action3: () => void;
        extra: boolean;
        id: string;
        name: string;
        shared: number;
      };

      expectTypeOf<UnionResult>().toEqualTypeOf<Expected>();
      expectTypeOf<TupleResult>().toEqualTypeOf<Expected>();
    });

    it("should handle different union orderings consistently", () => {
      type UnionResult1 = Combine<
        BaseStore,
        (Actions1 | Actions2 | Actions3)[]
      >;

      type UnionResult2 = Combine<
        BaseStore,
        (Actions1 | Actions2 | Actions3)[]
      >;

      expectTypeOf<UnionResult1>().toEqualTypeOf<UnionResult2>();

      type TupleResult1 = Combine<BaseStore, [Actions1, Actions2, Actions3]>;
      type TupleResult2 = Combine<BaseStore, [Actions3, Actions1, Actions2]>;

      type ExpectedTuple1 = {
        action1: () => void;
        action2: () => void;
        action3: () => void;
        extra: boolean;
        id: string;
        name: string;
        shared: number;
      };

      type ExpectedTuple2 = {
        action1: () => void;
        action2: () => void;
        action3: () => void;
        extra: boolean;
        id: string;
        name: string;
        shared: number;
      };

      expectTypeOf<TupleResult1>().toEqualTypeOf<ExpectedTuple1>();
      expectTypeOf<TupleResult2>().toEqualTypeOf<ExpectedTuple2>();
    });

    it("should handle empty arrays correctly", () => {
      type UnionEmptyResult = Combine<BaseStore, never[]>;
      type TupleEmptyResult = Combine<BaseStore, []>;

      expectTypeOf<UnionEmptyResult>().toEqualTypeOf<BaseStore>();
      expectTypeOf<TupleEmptyResult>().toEqualTypeOf<BaseStore>();
      expectTypeOf<UnionEmptyResult>().toEqualTypeOf<TupleEmptyResult>();
    });

    it("should handle single type arrays correctly", () => {
      type UnionSingleResult = Combine<BaseStore, Actions1[]>;
      type TupleSingleResult = Combine<BaseStore, [Actions1]>;

      type Expected = {
        action1: () => void;
        id: string;
        name: string;
        shared: string;
      };

      expectTypeOf<UnionSingleResult>().toEqualTypeOf<Expected>();
      expectTypeOf<TupleSingleResult>().toEqualTypeOf<Expected>();
      expectTypeOf<UnionSingleResult>().toEqualTypeOf<TupleSingleResult>();
    });
  });

  describe("Property Overriding", () => {
    it("should override properties correctly in tuple order", () => {
      type ConflictType1 = { value: string };
      type ConflictType2 = { value: number };
      type ConflictType3 = { value: boolean };

      type Result = Combine<
        BaseStore,
        [ConflictType1, ConflictType2, ConflictType3]
      >;

      type Expected = {
        id: string;
        name: string;
        value: boolean;
      };

      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });

    it("should handle complex nested types", () => {
      type NestedType1 = {
        config: { size: number; theme: "light" };
        methods: { save: () => void };
      };

      type NestedType2 = {
        config: { margin: string; theme: "dark" };
        methods: { load: () => void };
      };

      type Result = Combine<BaseStore, [NestedType1, NestedType2]>;

      type Expected = {
        config: {
          margin: string;
          size: number;
          theme: "dark";
        };
        id: string;
        methods: {
          load: () => void;
          save: () => void;
        };
        name: string;
      };

      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });
  });

  describe("Complex Union Scenarios", () => {
    it("should handle unions with multiple overlapping properties", () => {
      type TypeA = { a: string; shared1: string; shared2: number };
      type TypeB = { b: number; shared1: number; shared2: string };
      type TypeC = { c: boolean; shared1: boolean };

      type UnionResult = Combine<BaseStore, (TypeA | TypeB | TypeC)[]>;
      type TupleResult = Combine<BaseStore, [TypeA, TypeB, TypeC]>;

      expectTypeOf<UnionResult>().toEqualTypeOf<TupleResult>();

      type Expected = {
        a: string;
        b: number;
        c: boolean;
        id: string;
        name: string;
        shared1: boolean;
        shared2: string;
      };

      expectTypeOf<UnionResult>().toEqualTypeOf<Expected>();
    });

    it("should handle function types correctly", () => {
      type FunctionActions1 = {
        execute: (data: string) => Promise<void>;
        validate: (input: string) => boolean;
      };

      type FunctionActions2 = {
        execute: (data: number) => Promise<string>;
        process: () => void;
      };

      type UnionResult = Combine<
        BaseStore,
        (FunctionActions1 | FunctionActions2)[]
      >;
      type TupleResult = Combine<
        BaseStore,
        [FunctionActions1, FunctionActions2]
      >;

      expectTypeOf<UnionResult>().toEqualTypeOf<TupleResult>();

      type Expected = {
        execute: (data: number) => Promise<string>;
        id: string;
        name: string;
        process: () => void;
        validate: (input: string) => boolean;
      };

      expectTypeOf<UnionResult>().toEqualTypeOf<Expected>();
    });
  });

  describe("Edge Cases", () => {
    it("should preserve method signatures with generic types", () => {
      type GenericActions1 = {
        process<T extends string>(data: T): T;
        transform<T>(input: T): T;
      };

      type GenericActions2 = {
        filter<T>(items: T[], predicate: (item: T) => boolean): T[];
        transform<U>(input: U[]): U[];
      };

      type Result = Combine<BaseStore, [GenericActions1, GenericActions2]>;

      type Expected = {
        filter<T>(items: T[], predicate: (item: T) => boolean): T[];
        id: string;
        name: string;
        process<T extends string>(data: T): T;
        transform<U>(input: U[]): U[];
      };

      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });
  });
});
