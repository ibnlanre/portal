import type { Paths } from "./index";

import { describe, expectTypeOf, it } from "vitest";

describe("Paths type", () => {
  it("should generate correct paths for nested objects", () => {
    type Result = Paths<{
      a: {
        b: {
          c: {
            d: string;
          };
        };
      };
    }>;

    type Expected = "a" | "a.b" | "a.b.c" | "a.b.c.d";
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });

  it("should generate correct paths for optional nested objects", () => {
    type Result = Paths<{
      a?: {
        b?: {
          c?: {
            d?: string;
            f: [number, string];
          };
          e: () => void;
        };
      };
    }>;

    type Expected = "a" | "a.b" | "a.b.c" | "a.b.c.d" | "a.b.c.f" | "a.b.e";
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });

  it("should generate correct paths for objects with number keys", () => {
    type Result = Paths<{
      1: {
        2: {
          3: string;
        };
      };
    }>;

    type Expected = "1" | "1.2" | "1.2.3";
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });

  it("should generate correct paths for mixed key types", () => {
    type Result = Paths<{
      a: {
        b?: {
          c: {
            4: number;
          };
        };
      };
    }>;

    type Expected = "a" | "a.b" | "a.b.c" | "a.b.c.4";
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });

  it("should generate correct paths for symbols", () => {
    const A = Symbol("a");
    const B = Symbol("b");
    const C = Symbol("c");

    type Result = Paths<{
      [A]: {
        [B]: {
          [C]: number;
        };
      };
    }>;

    type Expected = never;
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });

  it("should not generate paths with undefined for partial objects", () => {
    type PartialStore = Partial<{
      settings: {
        theme: string;
      };
      user: {
        email: string;
        name: string;
      };
    }>;

    type Result = Paths<PartialStore>;

    type Expected =
      | "settings"
      | "settings.theme"
      | "user"
      | "user.email"
      | "user.name";
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });

  it("should handle optional properties correctly", () => {
    type Store = {
      data: {
        value: number;
      };
      user?: {
        profile?: {
          name: string;
        };
      };
    };

    type Result = Paths<Store>;

    type Expected =
      | "data"
      | "data.value"
      | "user"
      | "user.profile"
      | "user.profile.name";
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });

  it("should handle complex partial objects with potential circular references", () => {
    type ComplexStore = Partial<{
      data: {
        items: number[];
        metadata?: {
          version: string;
        };
      };
      user?: {
        friends?: ComplexStore;
        profile?: {
          name: string;
          settings?: {
            notifications?: boolean;
            theme: string;
          };
        };
      };
    }>;

    type Result = Paths<ComplexStore>;

    type Expected =
      | "data"
      | "data.items"
      | "data.metadata"
      | "data.metadata.version"
      | "user"
      | "user.friends"
      | "user.profile"
      | "user.profile.name"
      | "user.profile.settings"
      | "user.profile.settings.notifications"
      | "user.profile.settings.theme";

    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });

  it("should handle self-referencing types without infinite recursion", () => {
    type SelfRef = {
      self: SelfRef;
      value: string;
    };

    type Result = Paths<SelfRef>;

    expectTypeOf<Result>().toBeString();

    expectTypeOf<Result>().toMatchTypeOf<
      "self" | "self.self" | "self.value" | "value"
    >();
  });

  it("should handle mutually recursive types", () => {
    type TypeA = {
      name: string;
      ref: TypeB;
    };

    type TypeB = {
      back: TypeA;
      data: number;
    };

    type ResultA = Paths<TypeA>;
    type ResultB = Paths<TypeB>;

    expectTypeOf<ResultA>().toBeString();
    expectTypeOf<ResultB>().toBeString();

    expectTypeOf<ResultA>().toMatchTypeOf<
      "name" | "ref" | "ref.back" | "ref.data"
    >();
    expectTypeOf<ResultB>().toMatchTypeOf<
      "back" | "back.name" | "back.ref" | "data"
    >();
  });

  it("should work with normalized store types", () => {
    type NormalizedWindow = {
      document: object;
      location: {
        href: string;
        pathname: string;
      };
      navigator: {
        userAgent: string;
      };
    };

    type Result = Paths<NormalizedWindow>;

    expectTypeOf<Result>().toBeString();
    expectTypeOf<Result>().toMatchTypeOf<
      | "document"
      | "location"
      | "location.href"
      | "location.pathname"
      | "navigator"
      | "navigator.userAgent"
    >();
  });

  describe("Edge cases", () => {
    it("should handle empty objects", () => {
      type Result = Paths<{}>;
      expectTypeOf<Result>().toEqualTypeOf<never>();
    });

    it("should handle objects with only primitive values", () => {
      type Result = Paths<{
        active: boolean;
        age: number;
        name: string;
      }>;

      type Expected = "active" | "age" | "name";
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });

    it("should handle objects with function properties", () => {
      type Result = Paths<{
        getData: () => string;
        nested: {
          compute: (x: number) => number;
          value: string;
        };
      }>;

      type Expected = "getData" | "nested" | "nested.compute" | "nested.value";
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });

    it("should handle objects with null and undefined values", () => {
      type Result = Paths<{
        nested: {
          value: string;
        };
        nullable: null;
        optional: undefined;
      }>;

      type Expected = "nested" | "nested.value" | "nullable" | "optional";
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });

    it("should handle deeply nested objects", () => {
      type Result = Paths<{
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  deepValue: string;
                };
              };
            };
          };
        };
      }>;

      type Expected =
        | "level1"
        | "level1.level2"
        | "level1.level2.level3"
        | "level1.level2.level3.level4"
        | "level1.level2.level3.level4.level5"
        | "level1.level2.level3.level4.level5.deepValue";
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });

    it("should handle mixed data types as leaf nodes", () => {
      type Result = Paths<{
        array: string[];
        nested: {
          value: string;
        };
        primitive: number;
        tuple: [number, string];
      }>;

      type Expected =
        | "array"
        | "nested"
        | "nested.value"
        | "primitive"
        | "tuple";
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });

    it("should handle union types in object properties", () => {
      type Result = Paths<{
        always: {
          value: string;
        };
        data: string | { nested: number };
      }>;

      type Expected = "always" | "always.value" | "data";
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });

    it("should handle intersection types", () => {
      type BaseType = {
        base: string;
      };

      type ExtendedType = {
        extended: {
          value: number;
        };
      };

      type Result = Paths<BaseType & ExtendedType>;

      type Expected = "base" | "extended" | "extended.value";
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });

    it("should handle readonly properties", () => {
      type Result = Paths<{
        readonly config: {
          readonly apiUrl: string;
          timeout: number;
        };
        readonly id: string;
        mutable: string;
      }>;

      type Expected =
        | "config"
        | "config.apiUrl"
        | "config.timeout"
        | "id"
        | "mutable";
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });

    it("should handle objects with computed property names", () => {
      const KEY = "dynamicKey" as const;

      type Result = Paths<{
        [KEY]: {
          nested: string;
        };
        static: number;
      }>;

      type Expected = "dynamicKey" | "dynamicKey.nested" | "static";
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });
  });

  describe("Custom delimiters", () => {
    it("should work with custom delimiter", () => {
      type Result = Paths<
        {
          a: {
            b: {
              c: string;
            };
          };
        },
        "/"
      >;

      type Expected = "a" | "a/b" | "a/b/c";
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });

    it("should work with underscore delimiter", () => {
      type Result = Paths<
        {
          user: {
            profile: {
              name: string;
            };
          };
        },
        "_"
      >;

      type Expected = "user" | "user_profile" | "user_profile_name";
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });

    it("should work with arrow delimiter", () => {
      type Result = Paths<
        {
          state: {
            nested: {
              value: number;
            };
          };
        },
        "->"
      >;

      type Expected = "state" | "state->nested" | "state->nested->value";
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });
  });

  describe("Performance and complexity", () => {
    it("should handle wide objects (many properties)", () => {
      type WideObject = {
        nested: {
          value: string;
        };
        prop1: string;
        prop2: string;
        prop3: string;
        prop4: string;
        prop5: string;
        prop6: string;
        prop7: string;
        prop8: string;
        prop9: string;
        prop10: string;
      };

      type Result = Paths<WideObject>;

      expectTypeOf<Result>().toBeString();
      expectTypeOf<Result>().toMatchTypeOf<
        | "nested"
        | "nested.value"
        | "prop1"
        | "prop2"
        | "prop3"
        | "prop4"
        | "prop5"
        | "prop6"
        | "prop7"
        | "prop8"
        | "prop9"
        | "prop10"
      >();
    });

    it("should handle objects with both string and number keys", () => {
      type Result = Paths<{
        0: string;
        1: number;
        name: string;
        nested: {
          0: boolean;
          value: string;
        };
      }>;

      type Expected =
        | "0"
        | "1"
        | "name"
        | "nested"
        | "nested.0"
        | "nested.value";
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });
  });

  describe("Type relationships with toExtend", () => {
    it("should test extends relationships", () => {
      type SimplePaths = Paths<{ a: { b: string } }>;
      type ComplexPaths = Paths<{ a: { b: string; c: number }; d: boolean }>;

      expectTypeOf<SimplePaths>().toExtend<string>();
      expectTypeOf<ComplexPaths>().toExtend<string>();

      expectTypeOf<"a">().toExtend<SimplePaths>();
      expectTypeOf<"a.b">().toExtend<SimplePaths>();

      expectTypeOf<"a">().toExtend<ComplexPaths>();
      expectTypeOf<"a.b">().toExtend<ComplexPaths>();
      expectTypeOf<"a.c">().toExtend<ComplexPaths>();
      expectTypeOf<"d">().toExtend<ComplexPaths>();
    });

    it("should handle never type appropriately", () => {
      type EmptyPaths = Paths<{}>;

      expectTypeOf<EmptyPaths>().toEqualTypeOf<never>();
      expectTypeOf<never>().toExtend<EmptyPaths>();
    });
  });
});
