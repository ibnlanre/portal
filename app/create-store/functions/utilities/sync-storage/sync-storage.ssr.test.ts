import { describe, expect, it } from "vitest";

import { createLocalStorageAdapter } from "@/create-store/functions/adapters/create-local-storage-adapter";
import { createStore } from "@/create-store";

import { syncStorage } from "./index";

describe("syncStorage - Server-Side Rendering (Node Environment)", () => {
  const key = "test-key";

  it("is a no-op when window is not available", () => {
    const [getCount] = createLocalStorageAdapter<number>(key);
    const store = createStore(getCount(0));

    // Should not throw — window doesn't exist in SSR
    expect(() => syncStorage(store, key, getCount)).not.toThrow();
  });
});
