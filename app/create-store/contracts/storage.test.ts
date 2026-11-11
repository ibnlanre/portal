import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { localAdapter } from "../functions/adapters/local-adapter";
import { composite } from "../functions/library/composite";
import { primitive } from "../functions/library/primitive";
import { persist } from "../functions/utilities/persist";

const cleanup: Array<() => void> = [];

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup.splice(0).forEach((off) => off());
});

function dispatch(init: StorageEventInit) {
  window.dispatchEvent(new StorageEvent("storage", init));
}

describe("storage following contract", () => {
  it("follows a change from another tab, resets on removal, and supports cleanup", () => {
    const store = primitive(0);
    const { dispose } = persist(store, localAdapter<number>("count"));
    cleanup.push(dispose);

    localStorage.setItem("count", "1");
    dispatch({ key: "count", newValue: "1" });
    expect(store.$get()).toBe(1);

    localStorage.removeItem("count");
    dispatch({ key: "count", newValue: null });
    expect(store.$get()).toBe(0);

    dispose();
    dispose();
    localStorage.setItem("count", "2");
    dispatch({ key: "count", newValue: "2" });
    expect(store.$get()).toBe(0);
  });

  it("resets a composite to its initial value on removal and clear(), writing nothing back", () => {
    const store = composite({ a: 1, b: 2 });
    cleanup.push(
      persist(store, localAdapter<{ a: number; b: number }>("object")).dispose
    );
    store.$set({ a: 9, b: 8 });
    const setItem = vi.spyOn(localStorage, "setItem");
    localStorage.clear();
    dispatch({ key: null, newValue: null });
    expect(store.$get()).toEqual({ a: 1, b: 2 });
    expect(setItem).not.toHaveBeenCalled();
    expect(localStorage.getItem("object")).toBeNull();
  });

  it("ignores unrelated keys and session storage", () => {
    const store = primitive(0);
    const read = vi.fn((text: string) => JSON.parse(text));
    cleanup.push(
      persist(store, localAdapter<number>("count", { parse: read })).dispose
    );
    read.mockClear();
    store.$set(3);
    dispatch({ key: "other", newValue: "4" });
    dispatch({ key: "count", storageArea: sessionStorage });
    expect(read).not.toHaveBeenCalled();
    expect(store.$get()).toBe(3);
  });

  it("leaves storage consistent after a removal, and a later edit writes", () => {
    const store = composite<{ count: number }>({ count: 1 });
    cleanup.push(
      persist(store, localAdapter<{ count: number }>("composed")).dispose
    );

    store.count.$set(2);
    expect(localStorage.getItem("composed")).toBe('{"count":2}');

    localStorage.removeItem("composed");
    dispatch({ key: "composed", newValue: null, storageArea: localStorage });
    expect(store.$get()).toEqual({ count: 1 });
    expect(localStorage.getItem("composed")).toBeNull();

    store.count.$set(5);
    expect(localStorage.getItem("composed")).toBe('{"count":5}');
  });
});
