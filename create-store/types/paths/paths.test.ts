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
    expectTypeOf<Result>().toMatchTypeOf<
      | "document"
      | "location"
      | "location.href"
      | "location.pathname"
      | "navigator"
      | "navigator.userAgent"
    >();
  });
});
