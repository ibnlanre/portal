import type { CompositeStore } from "./index";
import type { Normalize } from "@/create-store/types/normalize";
import type { Paths } from "@/create-store/types/paths";

import { describe, it } from "vitest";
import { expectTypeOf } from "vitest";

interface Store {
  count: number;
  name: string;
  preferences: {
    notifications: boolean;
    theme: string;
  };
  settings: {
    brightness: number;
    volume: number;
  };
}

describe("CompositeStore type inference", () => {
  it("should extract the original type parameter from CompositeStore", () => {
    type ExtractedStore = ExtractTest<CompositeStore<Store>>;
    type ExtractTest<T> = T extends CompositeStore<infer R> ? R : never;

    expectTypeOf<ExtractedStore>().toExtend<Store>();
  });

  it("should derive paths from the CompositeStore type", () => {
    type PathsOfStore = Paths<Store>;
    expectTypeOf<PathsOfStore>().toBeString();
    expectTypeOf<PathsOfStore>().not.toExtend<never>();
  });

  it("should verify CompositeStore structure", () => {
    type CompositeStoreOfStore = CompositeStore<Store>;

    expectTypeOf<CompositeStoreOfStore>().toHaveProperty("$key");

    expectTypeOf<CompositeStoreOfStore>().toHaveProperty("count");
    expectTypeOf<CompositeStoreOfStore>().toHaveProperty("name");
    expectTypeOf<CompositeStoreOfStore>().toHaveProperty("preferences");
    expectTypeOf<CompositeStoreOfStore>().toHaveProperty("settings");
  });

  it("should test the extends relationship", () => {
    expectTypeOf<CompositeStore<Store>>().toExtend<CompositeStore<any>>();

    expectTypeOf<CompositeStore<Store>>().toExtend<CompositeStore<Store>>();
  });
});
