import type { InferType } from "./index";
import type { CompositeStore } from "@/create-store/types/composite-store";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";

import { describe, expectTypeOf, it } from "vitest";

describe("InferType", () => {
  describe("InferType with interfaces", () => {
    interface User {
      email: string;
      id: number;
      name: string;
    }

    interface UserProfile {
      preferences: {
        notifications: boolean;
        theme: "dark" | "light";
      };
      user: User;
    }

    interface NestedConfig {
      api: {
        endpoints: {
          auth: string;
          users: string;
        };
        timeout: number;
      };
      features: {
        enableLogging: boolean;
        maxRetries: number;
      };
    }

    it("should infer interface type for CompositeStore", () => {
      type Store = CompositeStore<User>;
      type Result = InferType<Store>;

      expectTypeOf<Result>().toEqualTypeOf<User>();
    });

    it("should infer nested interface properties", () => {
      type Store = CompositeStore<UserProfile>;
      type Result = InferType<Store, "user">;

      expectTypeOf<Result>().toEqualTypeOf<User>();
    });

    it("should infer deep nested interface properties", () => {
      type Store = CompositeStore<UserProfile>;
      type Result = InferType<Store, "user.name">;

      expectTypeOf<Result>().toEqualTypeOf<string>();
    });

    it("should infer complex nested interface", () => {
      type Store = CompositeStore<NestedConfig>;
      type Result = InferType<Store, "api.endpoints">;

      expectTypeOf<Result>().toEqualTypeOf<{
        auth: string;
        users: string;
      }>();
    });

    it("should infer primitive from interface", () => {
      type Store = PrimitiveStore<User>;
      type Result = InferType<Store>;

      expectTypeOf<Result>().toEqualTypeOf<User>();
    });
  });

  describe("InferType with arrays", () => {
    it("should infer array type for CompositeStore", () => {
      type Store = CompositeStore<{ items: string[] }>;
      type Result = InferType<Store, "items">;

      expectTypeOf<Result>().toEqualTypeOf<string[]>();
    });

    it("should infer nested array properties", () => {
      type Store = CompositeStore<{
        data: {
          users: Array<{ id: number; name: string }>;
        };
      }>;
      type Result = InferType<Store, "data.users">;

      expectTypeOf<Result>().toEqualTypeOf<
        Array<{ id: number; name: string }>
      >();
    });

    it("should infer array type for PrimitiveStore", () => {
      type Store = PrimitiveStore<number[]>;
      type Result = InferType<Store>;

      expectTypeOf<Result>().toEqualTypeOf<number[]>();
    });
  });

  describe("InferType with optional properties", () => {
    it("should handle optional properties in CompositeStore", () => {
      type Store = CompositeStore<{
        user: {
          age?: number;
          email?: string;
          name: string;
        };
      }>;
      type Result = InferType<Store, "user">;

      expectTypeOf<Result>().toEqualTypeOf<{
        age?: number;
        email?: string;
        name: string;
      }>();
    });

    it("should infer optional primitive property", () => {
      type Store = CompositeStore<{
        config: {
          timeout?: number;
        };
      }>;
      type Result = InferType<Store, "config.timeout">;

      expectTypeOf<Result>().toEqualTypeOf<number | undefined>();
    });
  });

  describe("InferType with generic types", () => {
    interface GenericStore<T> {
      data: T;
      meta: {
        timestamp: number;
        version: string;
      };
    }

    it("should infer generic interface with string", () => {
      type Store = CompositeStore<GenericStore<string>>;
      type Result = InferType<Store, "data">;

      expectTypeOf<Result>().toEqualTypeOf<string>();
    });

    it("should infer generic interface with object", () => {
      type Store = CompositeStore<GenericStore<{ id: number; name: string }>>;
      type Result = InferType<Store, "data">;

      expectTypeOf<Result>().toEqualTypeOf<{ id: number; name: string }>();
    });

    it("should infer meta properties from generic interface", () => {
      type Store = CompositeStore<GenericStore<string>>;
      type Result = InferType<Store, "meta.timestamp">;

      expectTypeOf<Result>().toEqualTypeOf<number>();
    });
  });

  describe("InferType with readonly properties", () => {
    it("should handle readonly properties", () => {
      type Store = CompositeStore<{
        readonly config: {
          readonly apiKey: string;
          readonly version: number;
        };
      }>;
      type Result = InferType<Store, "config">;

      expectTypeOf<Result>().toEqualTypeOf<{
        readonly apiKey: string;
        readonly version: number;
      }>();
    });

    it("should infer readonly primitive", () => {
      type Store = CompositeStore<{
        readonly settings: {
          readonly theme: "dark" | "light";
        };
      }>;
      type Result = InferType<Store, "settings.theme">;

      expectTypeOf<Result>().toEqualTypeOf<"dark" | "light">();
    });
  });

  describe("InferType error cases", () => {
    it("should return never for non-existent path", () => {
      type Store = CompositeStore<{ user: { name: string } }>;

      // @ts-expect-error: Testing invalid path
      type Result = InferType<Store, "user.nonexistent">;

      expectTypeOf<Result>().toEqualTypeOf<never>();
    });

    it("should return never for invalid nested path", () => {
      type Store = CompositeStore<{ count: number }>;

      // @ts-expect-error: Testing invalid path
      type Result = InferType<Store, "count.invalid">;

      expectTypeOf<Result>().toEqualTypeOf<never>();
    });

    it("should handle empty path string", () => {
      type Store = CompositeStore<{ user: { name: string } }>;

      // @ts-expect-error: Testing empty path
      type Result = InferType<Store, "">;

      expectTypeOf<Result>().toEqualTypeOf<never>();
    });
  });

  describe("CompositeStore without path", () => {
    it("should infer the full state type", () => {
      type Store = CompositeStore<{ user: { age: number; name: string } }>;
      type Result = InferType<Store>;

      expectTypeOf<Result>().toEqualTypeOf<{
        user: { age: number; name: string };
      }>();
    });

    it("should handle nested objects", () => {
      type Store = CompositeStore<{
        user: {
          profile: {
            name: string;
            settings: { theme: "dark" | "light" };
          };
        };
      }>;
      type Result = InferType<Store>;

      expectTypeOf<Result>().toEqualTypeOf<{
        user: {
          profile: {
            name: string;
            settings: { theme: "dark" | "light" };
          };
        };
      }>();
    });
  });

  describe("CompositeStore with path", () => {
    it("should resolve nested property by path", () => {
      type Store = CompositeStore<{ user: { age: number; name: string } }>;
      type Result = InferType<Store, "user.age">;

      expectTypeOf<Result>().toEqualTypeOf<number>();
    });

    it("should resolve object property by path", () => {
      type Store = CompositeStore<{ user: { age: number; name: string } }>;
      type Result = InferType<Store, "user">;

      expectTypeOf<Result>().toEqualTypeOf<{ age: number; name: string }>();
    });

    it("should resolve deep nested properties", () => {
      type Store = CompositeStore<{
        user: {
          profile: {
            settings: { theme: "dark" | "light" };
          };
        };
      }>;
      type Result = InferType<Store, "user.profile.settings.theme">;

      expectTypeOf<Result>().toEqualTypeOf<"dark" | "light">();
    });
  });

  describe("PrimitiveStore", () => {
    it("should infer string type", () => {
      type Store = PrimitiveStore<string>;
      type Result = InferType<Store>;

      expectTypeOf<Result>().toEqualTypeOf<string>();
    });

    it("should infer number type", () => {
      type Store = PrimitiveStore<number>;
      type Result = InferType<Store>;

      expectTypeOf<Result>().toEqualTypeOf<number>();
    });

    it("should infer boolean type", () => {
      type Store = PrimitiveStore<boolean>;
      type Result = InferType<Store>;

      expectTypeOf<Result>().toEqualTypeOf<boolean>();
    });

    it("should infer undefined type", () => {
      type Store = PrimitiveStore<undefined>;
      type Result = InferType<Store>;

      expectTypeOf<Result>().toEqualTypeOf<undefined>();
    });

    it("should infer null type", () => {
      type Store = PrimitiveStore<null>;
      type Result = InferType<Store>;

      expectTypeOf<Result>().toEqualTypeOf<null>();
    });

    it("should infer union types", () => {
      type Store = PrimitiveStore<number | string>;
      type Result = InferType<Store>;

      expectTypeOf<Result>().toEqualTypeOf<number | string>();
    });
  });

  describe("edge cases", () => {
    it("should handle empty object", () => {
      type Store = CompositeStore<{}>;
      type Result = InferType<Store>;

      expectTypeOf<Result>().toEqualTypeOf<{}>();
    });

    it("should return never for invalid path on PrimitiveStore", () => {
      type Store = PrimitiveStore<string>;

      // @ts-expect-error: Invalid path for PrimitiveStore
      type Result = InferType<Store, "invalid.path">;

      expectTypeOf<Result>().toEqualTypeOf<never>();
    });
  });
});
