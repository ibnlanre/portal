import { beforeEach, describe, expect, it } from "vitest";

import { createLocalStorageAdapter } from "@/create-store/functions/adapters/create-local-storage-adapter";
import { createStore } from "@/create-store";

import { syncStorage } from "./index";

describe("syncStorage", () => {
  const key = "test-key";

  beforeEach(() => {
    localStorage.clear();
  });

  it("updates the store when storage changes in another tab", () => {
    const [getCount] = createLocalStorageAdapter<number>(key);
    const store = createStore(getCount(0));

    syncStorage(store, key, getCount);

    localStorage.setItem(key, JSON.stringify(42));

    window.dispatchEvent(
      new StorageEvent("storage", { key, newValue: JSON.stringify(42) })
    );

    expect(store.$get()).toBe(42);
  });

  it("ignores storage events for other keys", () => {
    const [getCount] = createLocalStorageAdapter<number>(key);
    const store = createStore(getCount(0));

    syncStorage(store, key, getCount);

    localStorage.setItem("other-key", JSON.stringify(99));

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "other-key",
        newValue: JSON.stringify(99),
      })
    );

    expect(store.$get()).toBe(0);
  });

  it("does nothing when get returns undefined", () => {
    const [getCount] = createLocalStorageAdapter<number>(key);
    const store = createStore(getCount(0));

    syncStorage(store, key, getCount);

    // No value in storage — get returns undefined
    window.dispatchEvent(
      new StorageEvent("storage", {
        key,
        newValue: null,
      })
    );

    expect(store.$get()).toBe(0);
  });
});
