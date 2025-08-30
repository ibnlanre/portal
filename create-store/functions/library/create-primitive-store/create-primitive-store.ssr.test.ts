import { describe, expect, it } from "vitest";

import { createPrimitiveStore } from "./index";

describe("createPrimitiveStore - Server-Side Rendering (Node Environment)", () => {
  it("should create a store with proper initial state in SSR", () => {
    const initialState = "initial value";
    const store = createPrimitiveStore(initialState);

    expect(store.$get()).toBe(initialState);
  });

  it("should handle different primitive types in SSR", () => {
    const stringStore = createPrimitiveStore("hello");
    const numberStore = createPrimitiveStore(42);
    const booleanStore = createPrimitiveStore(true);
    const nullStore = createPrimitiveStore(null);
    const undefinedStore = createPrimitiveStore(undefined);

    expect(stringStore.$get()).toBe("hello");
    expect(numberStore.$get()).toBe(42);
    expect(booleanStore.$get()).toBe(true);
    expect(nullStore.$get()).toBe(null);
    expect(undefinedStore.$get()).toBe(undefined);
  });

  it("should allow state updates via $set in SSR", () => {
    const store = createPrimitiveStore(0);

    expect(store.$get()).toBe(0);

    store.$set(42);
    expect(store.$get()).toBe(42);

    store.$set((prev) => prev + 10);
    expect(store.$get()).toBe(52);
  });

  it("should handle subscription in SSR without errors", () => {
    const store = createPrimitiveStore("initial");
    const updates: string[] = [];

    const unsubscribe = store.$sub((value) => {
      updates.push(value);
    });

    expect(updates).toEqual(["initial"]);

    store.$set("updated");
    expect(updates).toEqual(["initial", "updated"]);

    unsubscribe();
    store.$set("after unsubscribe");
    expect(updates).toEqual(["initial", "updated"]);
  });

  it("should handle complex state updates in SSR", () => {
    const store = createPrimitiveStore({ count: 0, name: "test" });

    expect(store.$get()).toEqual({ count: 0, name: "test" });

    store.$set({ count: 1, name: "updated" });
    expect(store.$get()).toEqual({ count: 1, name: "updated" });

    store.$set((prev) => ({ ...prev, count: prev.count + 5 }));
    expect(store.$get()).toEqual({ count: 6, name: "updated" });
  });

  it("should maintain proper proxy behavior in SSR", () => {
    const store = createPrimitiveStore("test");

    expect(typeof store.$get).toBe("function");
    expect(typeof store.$set).toBe("function");
    expect(typeof store.$sub).toBe("function");

    expect((store as any).value).toBeUndefined();
    expect(Object.keys(store)).toEqual([]);
  });

  it("should handle selector function in $get during SSR", () => {
    const store = createPrimitiveStore({ a: 1, b: 2, c: 3 });

    const sum = store.$get((state) => state.a + state.b + state.c);
    expect(sum).toBe(6);

    store.$set({ a: 2, b: 3, c: 4 });
    const newSum = store.$get((state) => state.a + state.b + state.c);
    expect(newSum).toBe(9);
  });

  it("should handle multiple subscribers in SSR", () => {
    const store = createPrimitiveStore(0);
    const updates1: number[] = [];
    const updates2: number[] = [];

    const unsubscribe1 = store.$sub((value) => updates1.push(value));
    const unsubscribe2 = store.$sub((value) => updates2.push(value));

    expect(updates1).toEqual([0]);
    expect(updates2).toEqual([0]);

    store.$set(5);
    expect(updates1).toEqual([0, 5]);
    expect(updates2).toEqual([0, 5]);

    unsubscribe1();
    store.$set(10);
    expect(updates1).toEqual([0, 5]);
    expect(updates2).toEqual([0, 5, 10]);

    unsubscribe2();
  });

  it("should handle edge cases in SSR", () => {
    const emptyStore = createPrimitiveStore("");
    expect(emptyStore.$get()).toBe("");

    const zeroStore = createPrimitiveStore(0);
    expect(zeroStore.$get()).toBe(0);

    const arrayStore = createPrimitiveStore([]);
    expect(arrayStore.$get()).toEqual([]);

    const objectStore = createPrimitiveStore({});
    expect(objectStore.$get()).toEqual({});
  });

  it("should confirm we're running in Node environment (SSR)", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof global).toBe("object");
    expect(typeof process).toBe("object");
  });
});
