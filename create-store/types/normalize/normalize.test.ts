import type { Normalize } from "./index";
import type { Dictionary } from "@/create-store/types/dictionary";
import type { GenericObject } from "@/create-store/types/generic-object";

import { describe, expectTypeOf, it } from "vitest";

describe("Normalize", () => {
  it("should preserve all properties from the original object", () => {
    interface Input {
      active: boolean;
      age: number;
      name: string;
    }
    type Result = Normalize<Input>;
    type Expected = { active: boolean; age: number; name: string };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });

  it("should handle objects with string keys", () => {
    interface Input {
      bar: number;
      foo: string;
    }
    type Result = Normalize<Input>;
    type Expected = { bar: number; foo: string };
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
      42: number;
      [key: string]: any;
      stringKey: string;
    }
    type Result = Normalize<Input>;
    type Expected = {
      42: number;
      [key: string]: any;
      stringKey: string;
    };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });

  it("should handle nested objects", () => {
    interface Input {
      metadata: { created: Date };
      user: {
        profile: { age: number; name: string };
        settings: { theme: string };
      };
    }
    type Result = Normalize<Input>;
    type Expected = {
      metadata: { created: Date };
      user: {
        profile: { age: number; name: string };
        settings: { theme: string };
      };
    };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });

  it("should handle optional properties", () => {
    interface Input {
      nested?: { value: boolean };
      optional?: number;
      required: string;
    }
    type Result = Normalize<Input>;
    type Expected = {
      nested?: { value: boolean };
      optional?: number;
      required: string;
    };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });

  it("should handle arrays as property values", () => {
    interface Input {
      items: string[];
      numbers: number[];
      users: { id: number; name: string }[];
    }
    type Result = Normalize<Input>;
    type Expected = {
      items: string[];
      numbers: number[];
      users: { id: number; name: string }[];
    };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });

  it("should handle complex union types", () => {
    interface Input {
      data: { permissions: string[]; type: "admin" } | { type: "user" };
      value: boolean | number | string;
    }
    type Result = Normalize<Input>;
    type Expected = {
      data: { permissions: string[]; type: "admin" } | { type: "user" };
      value: boolean | number | string;
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
      age: number;
      name: string;
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
      getValue: () => number;
      name: string;
      process: (input: string) => boolean;
    }
    type Result = Normalize<Input>;
    type Expected = {
      getValue: () => number;
      name: string;
      process: (input: string) => boolean;
    };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });

  it("should handle objects with symbol keys", () => {
    interface Input {
      [key: symbol]: any;
      regularKey: string;
    }
    type Result = Normalize<Input>;
    type Expected = {
      [key: symbol]: any;
      regularKey: string;
    };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });

  it("should handle readonly properties", () => {
    interface Input {
      readonly config: { readonly value: number };
      readonly id: string;
      mutable: string;
    }
    type Result = Normalize<Input>;
    type Expected = {
      readonly config: { readonly value: number };
      readonly id: string;
      mutable: string;
    };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });

  it("should handle interface-like objects", () => {
    interface UserProfile {
      id: number;
      name: string;
      preferences: {
        notifications: boolean;
        theme: "dark" | "light";
      };
    }

    type Result = Normalize<UserProfile>;
    type Expected = {
      id: number;
      name: string;
      preferences: {
        notifications: boolean;
        theme: "dark" | "light";
      };
    };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });

  it("should handle objects extending other types", () => {
    type BaseType = { created: Date; id: string };
    type Input = BaseType & { active: boolean; name: string };
    type Result = Normalize<Input>;
    type Expected = {
      active: boolean;
      created: Date;
      id: string;
      name: string;
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
      [key: number]: number;
      [key: string]: number | string;
      specificProp: string;
    }
    type Result = Normalize<Input>;
    type Expected = {
      [key: number]: number;
      [key: string]: number | string;
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
      neverKey: never;
      validKey: string;
    }
    type Result = Normalize<Input>;
    type Expected = {
      neverKey: never;
      validKey: string;
    };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });

  it("should handle circular references in type definitions", () => {
    type Node = {
      children: Node[];
      parent?: Node;
      value: string;
    };
    interface Input {
      root: Node;
    }
    type Result = Normalize<Input>;
    type Expected = { root: Node };
    expectTypeOf<Result>().toMatchTypeOf<Expected>();
  });
});
