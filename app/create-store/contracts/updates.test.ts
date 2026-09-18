import { describe, expect, it } from "vitest";

import { createStore } from "../index";

describe("update semantics", () => {
  it("deep-merges objects, preserves omitted keys, and replaces arrays", () => {
    const store = createStore({
      items: [1, 2],
      user: { name: "A", settings: { dark: false, size: 12 } },
    });
    store.$set({ items: [3], user: { settings: { dark: true } } });
    expect(store.$get()).toEqual({
      items: [3],
      user: { name: "A", settings: { dark: true, size: 12 } },
    });
    store.user.$set({});
    expect(store.user.settings.size.$get()).toBe(12);
  });
  it.each([null, undefined, 0, "", false])(
    "replaces a leaf with %s",
    (value) => {
      const store = createStore<{ value: unknown }>({ value: "before" });
      store.value.$set(value);
      expect(store.value.$get()).toBe(value);
      expect(Object.hasOwn(store.$get(), "value")).toBe(true);
    }
  );
  it("does not delete omitted properties or accept direct proxy mutation", () => {
    const store = createStore({ age: 20, name: "A" });
    store.$set({ name: "B" });
    Reflect.deleteProperty(store, "age");
    Reflect.set(store, "age", 99);
    expect(store.$get()).toEqual({ age: 20, name: "B" });
  });
  it("protects initial values from updater mutations", () => {
    const initial = { user: { name: "A" } };
    const store = createStore(initial);
    store.user.$set((s) => {
      s.name = "B";
      return s;
    });
    expect(initial.user.name).toBe("A");
    expect(store.user.name.$get()).toBe("B");
  });
});
