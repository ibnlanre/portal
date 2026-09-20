import { afterEach, describe, expect, it, vi } from "vitest";

import { syncStorage } from "../functions/utilities/sync-storage";
import { createStore } from "../index";

const cleanup: Array<() => void> = [];
afterEach(() => {
  cleanup.splice(0).forEach((off) => off());
});

describe("storage synchronization contract", () => {
  it("restores the baseline on removal and supports cleanup", () => {
    const store = createStore(0);
    let external: number | undefined = 1;
    const off = syncStorage(store, "count", () => external);
    expect(off).toBeTypeOf("function");
    cleanup.push(off);
    window.dispatchEvent(
      new StorageEvent("storage", { key: "count", newValue: "1" })
    );
    expect(store.$get()).toBe(1);
    external = undefined;
    window.dispatchEvent(
      new StorageEvent("storage", { key: "count", newValue: null })
    );
    expect(store.$get()).toBe(0);
    off();
    off();
    external = 2;
    window.dispatchEvent(
      new StorageEvent("storage", { key: "count", newValue: "2" })
    );
    expect(store.$get()).toBe(0);
  });
  it("restores an object baseline through deep merge and retains added keys", () => {
    const store = createStore<{ a: number; b?: number }>({ a: 1 });
    cleanup.push(syncStorage(store, "object", () => undefined));
    store.$set({ a: 9, b: 2 });
    window.dispatchEvent(
      new StorageEvent("storage", { key: "object", newValue: null })
    );
    expect(store.$get()).toEqual({ a: 1, b: 2 });
  });

  it("handles storage.clear and ignores unrelated keys and session storage", () => {
    const store = createStore(0);
    const read = vi.fn(() => undefined as number | undefined);
    const off = syncStorage(store, "count", read);
    expect(off).toBeTypeOf("function");
    cleanup.push(off);
    store.$set(3);
    window.dispatchEvent(
      new StorageEvent("storage", { key: "other", newValue: "4" })
    );
    window.dispatchEvent(
      new StorageEvent("storage", { key: "count", storageArea: sessionStorage })
    );
    expect(read).not.toHaveBeenCalled();
    expect(store.$get()).toBe(3);
    window.dispatchEvent(
      new StorageEvent("storage", { key: null, newValue: null })
    );
    expect(store.$get()).toBe(0);
  });

  it("keeps store and storage consistent when a composed save restores the baseline", () => {
    localStorage.clear();
    const store = createStore<{ count: number }>({ count: 1 });
    const save = (value: { count: number }) =>
      localStorage.setItem("composed", JSON.stringify(value));
    cleanup.push(store.$subscribe(save, false));
    cleanup.push(
      syncStorage(store, "composed", () => {
        const raw = localStorage.getItem("composed");
        return raw === null
          ? undefined
          : (JSON.parse(raw) as { count: number });
      })
    );

    store.count.$set(2);
    expect(localStorage.getItem("composed")).toBe('{"count":2}');

    localStorage.removeItem("composed");
    const removal = new StorageEvent("storage", {
      key: "composed",
      newValue: null,
      storageArea: localStorage,
    });
    window.dispatchEvent(removal);
    expect(store.$get()).toEqual({ count: 1 });
    expect(localStorage.getItem("composed")).toBe('{"count":1}');

    window.dispatchEvent(removal);
    expect(store.$get()).toEqual({ count: 1 });
    expect(localStorage.getItem("composed")).toBe('{"count":1}');
  });
});
