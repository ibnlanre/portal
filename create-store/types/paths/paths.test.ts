import { describe, expectTypeOf, it } from "vitest";
import type { Paths } from "./index";

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
          e: () => void;
          c?: {
            d?: string;
            f: [number, string];
          };
        };
      };
    }>;

    type Expected = "a" | "a.b" | "a.b.c" | "a.b.c.d" | "a.b.e" | "a.b.c.f";
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
      user: {
        name: string;
        email: string;
      };
      settings: {
        theme: string;
      };
    }>;

    type Result = Paths<PartialStore>;

    type Expected =
      | "user"
      | "user.name"
      | "user.email"
      | "settings"
      | "settings.theme";
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });

  it("should handle optional properties correctly", () => {
    type Store = {
      user?: {
        profile?: {
          name: string;
        };
      };
      data: {
        value: number;
      };
    };

    type Result = Paths<Store>;

    type Expected =
      | "user"
      | "user.profile"
      | "user.profile.name"
      | "data"
      | "data.value";
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });

  it("should handle complex partial objects with potential circular references", () => {
    type ComplexStore = Partial<{
      user?: {
        profile?: {
          name: string;
          settings?: {
            theme: string;
            notifications?: boolean;
          };
        };
        friends?: ComplexStore;
      };
      data: {
        items: number[];
        metadata?: {
          version: string;
        };
      };
    }>;

    type Result = Paths<ComplexStore>;

    type Expected =
      | "user"
      | "user.profile"
      | "user.profile.name"
      | "user.profile.settings"
      | "user.profile.settings.theme"
      | "user.profile.settings.notifications"
      | "user.friends"
      | "data"
      | "data.items"
      | "data.metadata"
      | "data.metadata.version";

    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });

  it("should handle self-referencing types without infinite recursion", () => {
    type SelfRef = {
      value: string;
      self: SelfRef;
    };

    type Result = Paths<SelfRef>;

    expectTypeOf<Result>().toBeString();

    expectTypeOf<Result>().toMatchTypeOf<
      "value" | "self" | "self.value" | "self.self"
    >();
  });

  it("should handle mutually recursive types", () => {
    type TypeA = {
      name: string;
      ref: TypeB;
    };

    type TypeB = {
      data: number;
      back: TypeA;
    };

    type ResultA = Paths<TypeA>;
    type ResultB = Paths<TypeB>;

    expectTypeOf<ResultA>().toBeString();
    expectTypeOf<ResultB>().toBeString();

    expectTypeOf<ResultA>().toMatchTypeOf<
      "name" | "ref" | "ref.data" | "ref.back"
    >();
    expectTypeOf<ResultB>().toMatchTypeOf<
      "data" | "back" | "back.name" | "back.ref"
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
      | "navigator"
      | "location.href"
      | "location.pathname"
      | "navigator.userAgent"
    >();
    expectTypeOf<Result>().toMatchTypeOf<
      | "document"
      | "location"
      | "navigator"
      | "location.href"
      | "location.pathname"
      | "navigator.userAgent"
    >();
  });
});
