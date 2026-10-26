import { beforeEach, describe, expect, it, vi } from "vitest";

import { createStore } from "@/create-store";
import { createLocalStorageAdapter } from "@/create-store/functions/adapters/create-local-storage-adapter";

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

describe("syncStorage where the browser refuses localStorage", () => {
  const key = "refused-key";

  it("ignores a storage event it cannot attribute, without throwing", () => {
    const [getCount] = createLocalStorageAdapter<number>(key);
    const store = createStore(5);
    syncStorage(store, key, getCount);

    const descriptor = Object.getOwnPropertyDescriptor(window, "localStorage");
    const area = window.localStorage;
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new DOMException("The operation is insecure.", "SecurityError");
      },
    });

    try {
      expect(() =>
        window.dispatchEvent(
          new StorageEvent("storage", { key, storageArea: area })
        )
      ).not.toThrow();
      expect(store.$get()).toBe(5);
    } finally {
      if (descriptor) Object.defineProperty(window, "localStorage", descriptor);
      vi.restoreAllMocks();
    }
  });
});
