import { describe, expect, it } from "vitest";

import { createCompositeStore } from "./index";

describe("createCompositeStore - Server-Side Rendering (Node Environment)", () => {
  it("should create a store with proper initial state in SSR", () => {
    const initialState = { counter: 0, name: "test" };
    const store = createCompositeStore(initialState);

    expect(store.$get()).toEqual(initialState);
  });

  it("should handle nested object state in SSR", () => {
    const initialState = {
      preferences: { language: "en", theme: "dark" },
      settings: { notifications: true },
      user: { id: 1, name: "John" },
    };
    const store = createCompositeStore(initialState);

    expect(store.$get()).toEqual(initialState);
    expect(store.$get().user.name).toBe("John");
    expect(store.$get().preferences.theme).toBe("dark");
  });

  it("should allow state updates via $set in SSR", () => {
    const store = createCompositeStore({ count: 0, name: "initial" });

    expect(store.$get()).toEqual({ count: 0, name: "initial" });

    store.$set({ count: 42, name: "updated" });
    expect(store.$get()).toEqual({ count: 42, name: "updated" });

    store.$set((prev) => ({ ...prev, count: prev.count + 10 }));
    expect(store.$get()).toEqual({ count: 52, name: "updated" });
  });

  it("should handle deep state updates in SSR", () => {
    const store = createCompositeStore({
      settings: { theme: "light" },
      user: { id: 1, profile: { age: 30, name: "John" } },
    });

    store.$set((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        profile: { ...prev.user.profile, age: 31 },
      },
    }));

    expect(store.$get().user.profile.age).toBe(31);
    expect(store.$get().user.profile.name).toBe("John");
    expect(store.$get().settings.theme).toBe("light");
  });

  it("should handle subscription in SSR without errors", () => {
    const store = createCompositeStore({ value: "initial" });
    const updates: { value: string }[] = [];

    const unsubscribe = store.$act((state) => {
      updates.push(state);
    });

    expect(updates).toEqual([{ value: "initial" }]);

    store.$set({ value: "updated" });
    expect(updates).toEqual([{ value: "initial" }, { value: "updated" }]);

    unsubscribe();
    store.$set({ value: "after unsubscribe" });
    expect(updates).toEqual([{ value: "initial" }, { value: "updated" }]);
  });

  it("should maintain proper proxy behavior in SSR", () => {
    const store = createCompositeStore({ test: "value" });

    expect(typeof store.$get).toBe("function");
    expect(typeof store.$set).toBe("function");
    expect(typeof store.$act).toBe("function");

    expect((store as any).value).toBeUndefined();
    expect(Object.keys(store).sort()).toEqual(["test"]);
  });

  it("should handle selector function in $get during SSR", () => {
    const store = createCompositeStore({
      items: [1, 2, 3],
      multiplier: 2,
    });

    const total = store.$get((state) =>
      state.items.reduce((sum, item) => sum + item * state.multiplier, 0)
    );
    expect(total).toBe(12);

    store.$set((prev) => ({ ...prev, multiplier: 3 }));
    const newTotal = store.$get((state) =>
      state.items.reduce((sum, item) => sum + item * state.multiplier, 0)
    );
    expect(newTotal).toBe(18);
  });

  it("should handle multiple subscribers in SSR", () => {
    const store = createCompositeStore({ counter: 0 });
    const updates1: { counter: number }[] = [];
    const updates2: { counter: number }[] = [];

    const unsubscribe1 = store.$act((state) => updates1.push(state));
    const unsubscribe2 = store.$act((state) => updates2.push(state));

    expect(updates1).toEqual([{ counter: 0 }]);
    expect(updates2).toEqual([{ counter: 0 }]);

    store.$set({ counter: 5 });
    expect(updates1).toEqual([{ counter: 0 }, { counter: 5 }]);
    expect(updates2).toEqual([{ counter: 0 }, { counter: 5 }]);

    unsubscribe1();
    store.$set({ counter: 10 });
    expect(updates1).toEqual([{ counter: 0 }, { counter: 5 }]);
    expect(updates2).toEqual([{ counter: 0 }, { counter: 5 }, { counter: 10 }]);

    unsubscribe2();
  });

  it("should handle array state updates in SSR", () => {
    const store = createCompositeStore({
      count: 2,
      items: ["a", "b"],
    });

    expect(store.$get()).toEqual({ count: 2, items: ["a", "b"] });

    store.$set((prev) => ({
      ...prev,
      count: prev.count + 1,
      items: [...prev.items, "c"],
    }));

    expect(store.$get()).toEqual({ count: 3, items: ["a", "b", "c"] });

    store.$set((prev) => ({
      ...prev,
      count: prev.count - 1,
      items: prev.items.filter((item) => item !== "b"),
    }));

    expect(store.$get()).toEqual({ count: 2, items: ["a", "c"] });
  });

  it("should handle complex nested state operations in SSR", () => {
    const store = createCompositeStore({
      filter: "all",
      todos: [
        { completed: false, id: 1, text: "Task 1" },
        { completed: true, id: 2, text: "Task 2" },
      ],
    });

    store.$set((prev) => ({
      ...prev,
      todos: prev.todos.map((todo) =>
        todo.id === 1 ? { ...todo, completed: !todo.completed } : todo
      ),
    }));

    expect(store.$get().todos[0].completed).toBe(true);
    expect(store.$get().todos[1].completed).toBe(true);

    store.$set((prev) => ({
      ...prev,
      todos: [...prev.todos, { completed: false, id: 3, text: "Task 3" }],
    }));

    expect(store.$get().todos).toHaveLength(3);
    expect(store.$get().todos[2].text).toBe("Task 3");
  });

  it("should handle edge cases in SSR", () => {
    const emptyStore = createCompositeStore({});
    expect(emptyStore.$get()).toEqual({});

    const nullableStore = createCompositeStore({
      empty: "",
      optional: undefined,
      value: null,
    });
    expect(nullableStore.$get()).toEqual({
      empty: "",
      optional: undefined,
      value: null,
    });

    const arrayStore = createCompositeStore({ items: [], metadata: {} });
    expect(arrayStore.$get()).toEqual({ items: [], metadata: {} });
  });

  it("should handle rapid state changes in SSR", () => {
    const store = createCompositeStore({ counter: 0 });
    const updates: { counter: number }[] = [];

    store.$act((state) => updates.push(state));

    for (let i = 1; i <= 5; i++) {
      store.$set({ counter: i });
    }

    expect(updates).toEqual([
      { counter: 0 },
      { counter: 1 },
      { counter: 2 },
      { counter: 3 },
      { counter: 4 },
      { counter: 5 },
    ]);
    expect(store.$get().counter).toBe(5);
  });

  it("should handle immutability in SSR", () => {
    const initialState = {
      settings: { theme: "dark" },
      user: { age: 30, name: "John" },
    };
    const store = createCompositeStore(initialState);

    const stateBefore = store.$get();

    store.$set((prev) => ({
      ...prev,
      user: { ...prev.user, age: 31 },
    }));

    const stateAfter = store.$get();

    expect(stateBefore.user.age).toBe(30);
    expect(stateAfter.user.age).toBe(31);
    expect(stateBefore).not.toBe(stateAfter);
    expect(stateBefore.user).not.toBe(stateAfter.user);
    expect(stateBefore.settings).toStrictEqual(stateAfter.settings);
  });

  it("should confirm we're running in Node environment (SSR)", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof global).toBe("object");
    expect(typeof process).toBe("object");
  });
});
