import type { Dictionary } from "@/create-store/types/dictionary";
import type { GenericObject } from "@/create-store/types/generic-object";
import type { Normalize } from "./index";

import { describe, expectTypeOf, it } from "vitest";

describe("Normalize", () => {
  it("should preserve all properties from the original object", () => {
    interface Input {
      name: string;
      age: number;
      active: boolean;
    }
    type Result = Normalize<Input>;
    type Expected = { name: string; age: number; active: boolean };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });

  it("should handle objects with string keys", () => {
    interface Input {
      foo: string;
      bar: number;
    }
    type Result = Normalize<Input>;
    type Expected = { foo: string; bar: number };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });

  it("should handle objects with number keys", () => {
    interface Input {
      [key: number]: string;
      regularKey: boolean;
    }
    type Result = Normalize<Input>;
    type Expected = { [key: number]: string; regularKey: boolean };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });

  it("should handle objects with mixed key types", () => {
    interface Input {
      stringKey: string;
      42: number;
      [key: string]: any;
    }
    type Result = Normalize<Input>;
    type Expected = {
      stringKey: string;
      42: number;
      [key: string]: any;
    };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });

  it("should handle nested objects", () => {
    interface Input {
      user: {
        profile: { name: string; age: number };
        settings: { theme: string };
      };
      metadata: { created: Date };
    }
    type Result = Normalize<Input>;
    type Expected = {
      user: {
        profile: { name: string; age: number };
        settings: { theme: string };
      };
      metadata: { created: Date };
    };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });

  it("should handle optional properties", () => {
    interface Input {
      required: string;
      optional?: number;
      nested?: { value: boolean };
    }
    type Result = Normalize<Input>;
    type Expected = {
      required: string;
      optional?: number;
      nested?: { value: boolean };
    };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });

  it("should handle arrays as property values", () => {
    interface Input {
      items: string[];
      users: { id: number; name: string }[];
      numbers: number[];
    }
    type Result = Normalize<Input>;
    type Expected = {
      items: string[];
      users: { id: number; name: string }[];
      numbers: number[];
    };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });

  it("should handle complex union types", () => {
    interface Input {
      value: string | number | boolean;
      data: { type: "user" } | { type: "admin"; permissions: string[] };
    }
    type Result = Normalize<Input>;
    type Expected = {
      value: string | number | boolean;
      data: { type: "user" } | { type: "admin"; permissions: string[] };
    };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });

  it("should handle empty objects", () => {
    interface Input {}
    type Result = Normalize<Input>;
    type Expected = {};
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });

  it("should be assignable to Dictionary", () => {
    interface Input {
      name: string;
      age: number;
    }
    type Result = Normalize<Input>;
    expectTypeOf<Result>().toMatchTypeOf<Dictionary>();
  });

  it("should preserve the original GenericObject structure", () => {
    interface Input {
      [key: string]: any;
    }
    type Result = Normalize<Input>;
    expectTypeOf<Result>().toMatchTypeOf<GenericObject>();
  });

  it("should handle objects with function properties", () => {
    interface Input {
      name: string;
      getValue: () => number;
      process: (input: string) => boolean;
    }
    type Result = Normalize<Input>;
    type Expected = {
      name: string;
      getValue: () => number;
      process: (input: string) => boolean;
    };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });

  it("should handle objects with symbol keys", () => {
    interface Input {
      regularKey: string;
      [key: symbol]: any;
    }
    type Result = Normalize<Input>;
    type Expected = {
      regularKey: string;
      [key: symbol]: any;
    };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });

  it("should handle readonly properties", () => {
    interface Input {
      readonly id: string;
      readonly config: { readonly value: number };
      mutable: string;
    }
    type Result = Normalize<Input>;
    type Expected = {
      readonly id: string;
      readonly config: { readonly value: number };
      mutable: string;
    };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });

  it("should handle interface-like objects", () => {
    interface UserProfile {
      id: number;
      name: string;
      preferences: {
        theme: "light" | "dark";
        notifications: boolean;
      };
    }

    type Result = Normalize<UserProfile>;
    type Expected = {
      id: number;
      name: string;
      preferences: {
        theme: "light" | "dark";
        notifications: boolean;
      };
    };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });

  it("should handle objects extending other types", () => {
    type BaseType = { id: string; created: Date };
    type Input = BaseType & { name: string; active: boolean };
    type Result = Normalize<Input>;
    type Expected = {
      id: string;
      created: Date;
      name: string;
      active: boolean;
    };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });

  it("should handle Record types", () => {
    type Input = Record<string, number> & { specificKey: string };
    type Result = Normalize<Input>;
    type Expected = Record<string, number> & { specificKey: string };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });

  it("should handle objects with index signatures", () => {
    interface Input {
      [key: string]: string | number;
      [key: number]: number;
      specificProp: string;
    }
    type Result = Normalize<Input>;
    type Expected = {
      [key: string]: string | number;
      [key: number]: number;
      specificProp: string;
    };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });

  it("should handle objects with computed keys", () => {
    type Input = {
      [K in "computedKey"]: string;
    } & { normalKey: number };
    type Result = Normalize<Input>;
    type Expected = {
      computedKey: string;
      normalKey: number;
    };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });

  it("should preserve never types", () => {
    interface Input {
      validKey: string;
      neverKey: never;
    }
    type Result = Normalize<Input>;
    type Expected = {
      validKey: string;
      neverKey: never;
    };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });

  it("should handle circular references in type definitions", () => {
    type Node = {
      value: string;
      children: Node[];
      parent?: Node;
    };
    interface Input {
      root: Node;
    }
    type Result = Normalize<Input>;
    type Expected = { root: Node };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });
});
