import type { Prettify } from "./index";

import { describe, expectTypeOf, it } from "vitest";

describe("Prettify", () => {
  it("should flatten intersected types", () => {
    type A = { a: string };
    type B = { b: number };
    type Result = Prettify<A & B>;

    expectTypeOf<Result>().toEqualTypeOf<{ a: string; b: number }>();
  });

  it("should preserve primitive types", () => {
    type Result = Prettify<{ active: boolean; age: number; name: string }>;

    expectTypeOf<Result>().toEqualTypeOf<{
      active: boolean;
      age: number;
      name: string;
    }>();
  });

  it("should handle intersected interfaces", () => {
    interface A {
      id: string;
    }
    interface B {
      value: number;
    }
    type Result = Prettify<A & B>;

    expectTypeOf<Result>().toEqualTypeOf<{ id: string; value: number }>();
  });

  it("should handle nested interfaces", () => {
    interface A {
      user: B;
    }
    interface B {
      name: string;
    }
    interface C {
      user: { age: number };
    }
    type Result = Prettify<A & C>;

    expectTypeOf<Result>().toEqualTypeOf<{
      user: { age: number; name: string };
    }>();
  });

  it("should handle nested objects", () => {
    type Input = { user: { age: number } } & { user: { name: string } };
    type Result = Prettify<Input>;

    expectTypeOf<Result>().toEqualTypeOf<{
      user: { age: number; name: string };
    }>();
  });

  it("should handle empty object", () => {
    type Result = Prettify<{}>;

    expectTypeOf<Result>().toEqualTypeOf<{}>();
  });

  it("should preserve optional properties", () => {
    type Input = { optional?: number } & { required: string };
    type Result = Prettify<Input>;

    expectTypeOf<Result>().toEqualTypeOf<{
      optional?: number;
      required: string;
    }>();
  });

  it("should preserve readonly properties", () => {
    type Input = { name: string } & { readonly id: string };
    type Result = Prettify<Input>;

    expectTypeOf<Result>().toEqualTypeOf<{
      readonly id: string;
      name: string;
    }>();
  });

  it("should preserve arrays", () => {
    type Input = { items: string[] } & { numbers: number[] };
    type Result = Prettify<Input>;

    expectTypeOf<Result>().toEqualTypeOf<{
      items: string[];
      numbers: number[];
    }>();
  });

  it("should preserve readonly arrays", () => {
    type Input = { data: number[] } & { readonly items: readonly string[] };
    type Result = Prettify<Input>;

    expectTypeOf<Result>().toEqualTypeOf<{
      data: number[];
      readonly items: readonly string[];
    }>();
  });

  it("should preserve Sets", () => {
    type Input = { ids: Set<number> } & { users: Set<string> };
    type Result = Prettify<Input>;

    expectTypeOf<Result>().toEqualTypeOf<{
      ids: Set<number>;
      users: Set<string>;
    }>();
  });

  it("should preserve Maps", () => {
    type Input = { cache: Map<string, number> } & {
      lookup: Map<number, string>;
    };
    type Result = Prettify<Input>;

    expectTypeOf<Result>().toEqualTypeOf<{
      cache: Map<string, number>;
      lookup: Map<number, string>;
    }>();
  });

  it("should preserve WeakSets and WeakMaps", () => {
    type Input = { weakMap: WeakMap<object, string> } & {
      weakSet: WeakSet<object>;
    };
    type Result = Prettify<Input>;

    expectTypeOf<Result>().toEqualTypeOf<{
      weakMap: WeakMap<object, string>;
      weakSet: WeakSet<object>;
    }>();
  });

  it("should preserve Date objects", () => {
    type Input = { created: Date } & { updated: Date };
    type Result = Prettify<Input>;

    expectTypeOf<Result>().toEqualTypeOf<{
      created: Date;
      updated: Date;
    }>();
  });

  it("should preserve RegExp objects", () => {
    type Input = { pattern: RegExp } & { validator: RegExp };
    type Result = Prettify<Input>;

    expectTypeOf<Result>().toEqualTypeOf<{
      pattern: RegExp;
      validator: RegExp;
    }>();
  });

  it("should preserve Promise objects", () => {
    type Input = { loadData: Promise<string> } & { saveData: Promise<void> };
    type Result = Prettify<Input>;

    expectTypeOf<Result>().toEqualTypeOf<{
      loadData: Promise<string>;
      saveData: Promise<void>;
    }>();
  });

  it("should preserve Error objects", () => {
    type Input = { lastError: Error } & { validationError: TypeError };
    type Result = Prettify<Input>;

    expectTypeOf<Result>().toEqualTypeOf<{
      lastError: Error;
      validationError: TypeError;
    }>();
  });

  it("should preserve functions", () => {
    type Input = { onChange: (value: string) => void } & {
      onClick: () => void;
    };
    type Result = Prettify<Input>;

    expectTypeOf<Result>().toEqualTypeOf<{
      onChange: (value: string) => void;
      onClick: () => void;
    }>();
  });

  it("should handle mixed collections and objects", () => {
    type Input = {
      cache: Map<string, number>;
      config: { api: string };
      items: string[];
    } & {
      config: { timeout: number };
      metadata: { version: string };
      users: Set<string>;
    };
    type Result = Prettify<Input>;

    expectTypeOf<Result>().toEqualTypeOf<{
      cache: Map<string, number>;
      config: { api: string; timeout: number };
      items: string[];
      metadata: { version: string };
      users: Set<string>;
    }>();
  });
});
