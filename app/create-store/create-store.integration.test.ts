import { describe, expect, expectTypeOf, it } from "vitest";

import { createStore } from "./index";

describe("createStore - Integration tests (no mocks)", () => {
  describe("Primitive values", () => {
    it("number initial state produces working primitive store", () => {
      const store = createStore(42);
      expect(store.$get()).toBe(42);
    });

    it("string initial state produces working primitive store", () => {
      const store = createStore("hello");
      expect(store.$get()).toBe("hello");
    });

    it("zero as initial state produces primitive store", () => {
      const store = createStore(0);
      expect(store.$get()).toBe(0);
    });
  });

  describe("Object values", () => {
    it("object initial state produces working composite store", () => {
      const store = createStore({ count: 0, label: "hello" });
      expect(store.count.$get()).toBe(0);
      expect(store.label.$get()).toBe("hello");
      expect(store.$get()).toEqual({ count: 0, label: "hello" });
    });

    it("nested object initial state produces working composite store", () => {
      const store = createStore({
        settings: { notifications: true, theme: "dark" },
        user: { age: 30, name: "Alice" },
      });
      expect(store.settings.theme.$get()).toBe("dark");
      expect(store.user.name.$get()).toBe("Alice");
    });
  });

  describe("Functions in initial state", () => {
    it("creates a composite store with methods from initialState", () => {
      const increment = () => {};

      const store = createStore({ count: 0, increment });

      expect(store.increment).toBe(increment);
      expect(store.count.$get()).toBe(0);
      expect(store.$get()).toEqual({ count: 0, increment });
    });

    it("keeps methods intact across $set", () => {
      const increment = () => {};
      const store = createStore({ count: 0, increment });

      store.count.$set(5);
      expect(store.increment).toBe(increment);
      expect(store.$get()).toEqual({ count: 5, increment });
    });

    it("infers method types from the initial state", () => {
      const store = createStore({
        count: 0,
        increment: () => {},
      });

      expectTypeOf(store.increment).toEqualTypeOf<() => void>();
    });
  });
});
