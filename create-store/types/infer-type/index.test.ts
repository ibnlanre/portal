import type { InferType } from "./index";
import type { CompositeStore } from "@/create-store/types/composite-store";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";

import { describe, expectTypeOf, it } from "vitest";

describe("InferType", () => {
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
