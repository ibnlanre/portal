import { renderHook } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it, vi } from "vitest";

import { createPrimitiveStore } from "./index";

describe("createPrimitiveStore", () => {
  it("should create a store with no initial state", () => {
    const store = createPrimitiveStore(undefined);
    expect(store).toBeDefined();
    const stateValue = store.$get();
    expect(stateValue).toBeUndefined();
  });

  it("should create a store with initial state", () => {
    const initialState = "value";
    const store = createPrimitiveStore(initialState);
    const stateValue = store.$get();
    expect(stateValue).toBe(initialState);
  });

  it("should set a new state value", () => {
    const initialState = "value";
    const store = createPrimitiveStore(initialState);

    store.$set("new value");
    expect(store.$get((value) => value.toUpperCase())).toBe("NEW VALUE");

    store.$set((value) => value.toUpperCase());
    expect(store.$get((value) => value.toLowerCase())).toBe("new value");
  });

  it("should subscribe to state changes", () => {
    const initialState = "value";
    const store = createPrimitiveStore(initialState);

    const subscriber = vi.fn();
    store.$act(subscriber);
    expect(subscriber).toHaveBeenCalledWith(initialState);

    store.$set("new value");
    expect(subscriber).toHaveBeenCalledWith("new value");
  });

  it("should unsubscribe from state changes", () => {
    const initialState = "value";
    const store = createPrimitiveStore(initialState);

    const subscriber = vi.fn();
    const unsubscribe = store.$act(subscriber);

    unsubscribe();
    store.$set("new value");
    expect(subscriber).toHaveBeenCalledOnce();
  });

  it("should use the state value in a React component", () => {
    const initialState = "value";
    const store = createPrimitiveStore(initialState);

    const { result } = renderHook(() => store.$use());
    const [stateValue] = result.current;
    expect(stateValue).toBe(initialState);
  });

  it("should update the state value in a React component", () => {
    const initialState = "value";
    const store = createPrimitiveStore(initialState);

    const { result } = renderHook(() => store.$use());
    const [, setStateValue] = result.current;

    act(() => {
      setStateValue("new value");
    });

    const [updatedStateValue] = result.current;
    expect(updatedStateValue).toBe("new value");
  });

  it("should handle ownKeys with string and symbol properties", () => {
    const sym1 = Symbol("test1");
    const sym2 = Symbol("test2");

    const initialState = {
      anotherString: "value2",
      stringProp: "value",
      [sym1]: "symbol1",
      [sym2]: "symbol2",
    };

    const store = createPrimitiveStore(initialState);
    const keys = Reflect.ownKeys(store);

    expect(keys).toContain("stringProp");
    expect(keys).toContain("anotherString");
    expect(keys).toContain(sym1);
    expect(keys).toContain(sym2);

    expect(keys).not.toContain("$get");
    expect(keys).not.toContain("$set");
    expect(keys).not.toContain("$use");
    expect(keys).not.toContain("$act");
  });

  it("should return empty array for ownKeys when state is not a dictionary", () => {
    const primitiveStore = createPrimitiveStore("primitive value");
    const keys = Reflect.ownKeys(primitiveStore);
    expect(keys).toEqual([]);

    const numberStore = createPrimitiveStore(42);
    const numberKeys = Reflect.ownKeys(numberStore);
    expect(numberKeys).toEqual([]);

    const nullStore = createPrimitiveStore(null);
    const nullKeys = Reflect.ownKeys(nullStore);
    expect(nullKeys).toEqual([]);
  });

  describe("Selector Functions", () => {
    it("should work with selector functions in $get", () => {
      const store = createPrimitiveStore({ age: 30, name: "John" });

      expect(store.$get((state) => state.name)).toBe("John");
      expect(store.$get((state) => state.age * 2)).toBe(60);
      expect(
        store.$get((state) => `${state.name} is ${state.age} years old`)
      ).toBe("John is 30 years old");
    });

    it("should work with selector functions in $use hook", () => {
      const store = createPrimitiveStore({ count: 5, multiplier: 3 });

      const { result } = renderHook(() =>
        store.$use((state) => state.count * state.multiplier)
      );

      expect(result.current[0]).toBe(15);

      act(() => {
        result.current[1]({ count: 10, multiplier: 3 });
      });

      expect(result.current[0]).toBe(30);
    });

    it("should handle complex selector transformations", () => {
      const store = createPrimitiveStore({
        users: [
          { active: true, id: 1, name: "Alice" },
          { active: false, id: 2, name: "Bob" },
          { active: true, id: 3, name: "Charlie" },
        ],
      });

      const activeUsers = store.$get((state) =>
        state.users.filter((user) => user.active).map((user) => user.name)
      );

      expect(activeUsers).toEqual(["Alice", "Charlie"]);
    });
  });

  describe("State Updates", () => {
    it("should handle partial updates for object states", () => {
      const store = createPrimitiveStore({
        age: 30,
        city: "New York",
        name: "John",
      });

      store.$set({ age: 31 });
      expect(store.$get()).toEqual({ age: 31, city: "New York", name: "John" });

      store.$set({ city: "Boston", name: "Jane" });
      expect(store.$get()).toEqual({ age: 31, city: "Boston", name: "Jane" });
    });

    it("should handle function-based updates", () => {
      const store = createPrimitiveStore({ count: 0, step: 1 });

      store.$set((prev) => ({ ...prev, count: prev.count + prev.step }));
      expect(store.$get().count).toBe(1);

      store.$set((prev) => ({ ...prev, count: prev.count + 5, step: 2 }));
      expect(store.$get()).toEqual({ count: 6, step: 2 });
    });

    it("should handle nested object updates", () => {
      const store = createPrimitiveStore({
        settings: { theme: "light" },
        user: { details: { age: 30, city: "NYC" }, name: "John" },
      });

      store.$set((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          details: { ...prev.user.details, age: 31 },
        },
      }));

      expect(store.$get().user.details.age).toBe(31);
      expect(store.$get().user.name).toBe("John");
      expect(store.$get().settings.theme).toBe("light");
    });

    it("should handle array updates", () => {
      const store = createPrimitiveStore([1, 2, 3]);

      store.$set((prev) => [...prev, 4]);
      expect(store.$get()).toEqual([1, 2, 3, 4]);

      store.$set((prev) => prev.filter((x) => x % 2 === 0));
      expect(store.$get()).toEqual([2, 4]);
    });
  });

  describe("Subscription Management", () => {
    it("should handle multiple subscribers", () => {
      const store = createPrimitiveStore("initial");

      const subscriber1 = vi.fn();
      const subscriber2 = vi.fn();
      const subscriber3 = vi.fn();

      store.$act(subscriber1);
      store.$act(subscriber2);
      store.$act(subscriber3);

      expect(subscriber1).toHaveBeenCalledWith("initial");
      expect(subscriber2).toHaveBeenCalledWith("initial");
      expect(subscriber3).toHaveBeenCalledWith("initial");

      store.$set("updated");

      expect(subscriber1).toHaveBeenCalledWith("updated");
      expect(subscriber2).toHaveBeenCalledWith("updated");
      expect(subscriber3).toHaveBeenCalledWith("updated");
    });

    it("should handle subscription without immediate callback", () => {
      const store = createPrimitiveStore("initial");
      const subscriber = vi.fn();

      store.$act(subscriber, false);
      expect(subscriber).not.toHaveBeenCalled();

      store.$set("updated");
      expect(subscriber).toHaveBeenCalledWith("updated");
      expect(subscriber).toHaveBeenCalledTimes(1);
    });

    it("should handle partial unsubscription", () => {
      const store = createPrimitiveStore("initial");

      const subscriber1 = vi.fn();
      const subscriber2 = vi.fn();

      const unsubscribe1 = store.$act(subscriber1);
      store.$act(subscriber2);

      unsubscribe1();
      store.$set("updated");

      expect(subscriber1).toHaveBeenCalledTimes(1);
      expect(subscriber2).toHaveBeenCalledWith("updated");
    });
  });

  describe("React Hook Integration", () => {
    it("should handle dependencies in $use hook", () => {
      const store = createPrimitiveStore({ value: 10 });
      let externalDep = "prefix";

      const { rerender, result } = renderHook(
        ({ dep }) => store.$use((state) => `${dep}: ${state.value}`, [dep]),
        { initialProps: { dep: externalDep } }
      );

      expect(result.current[0]).toBe("prefix: 10");

      externalDep = "new-prefix";
      rerender({ dep: externalDep });

      expect(result.current[0]).toBe("new-prefix: 10");
    });

    it("should handle multiple hooks on same store", () => {
      const store = createPrimitiveStore({ count: 0, name: "test" });

      const { result: result1 } = renderHook(() => store.$use());
      const { result: result2 } = renderHook(() =>
        store.$use((state) => state.count)
      );
      const { result: result3 } = renderHook(() =>
        store.$use((state) => state.name)
      );

      expect(result1.current[0]).toEqual({ count: 0, name: "test" });
      expect(result2.current[0]).toBe(0);
      expect(result3.current[0]).toBe("test");

      act(() => {
        result1.current[1]({ count: 5, name: "updated" });
      });

      expect(result1.current[0]).toEqual({ count: 5, name: "updated" });
      expect(result2.current[0]).toBe(5);
      expect(result3.current[0]).toBe("updated");
    });
  });

  describe("Proxy Behavior", () => {
    it("should handle proxy defineProperty trap", () => {
      const store = createPrimitiveStore({ test: "value" });

      expect(Object.defineProperty(store, "newProp", { value: "test" })).toBe(
        store
      );
      expect("newProp" in store).toBe(false);
    });

    it("should handle proxy deleteProperty trap", () => {
      const store = createPrimitiveStore({ test: "value" });

      expect(delete (store as any).test).toBe(true);

      expect("test" in store).toBe(false);
    });

    it("should handle proxy set trap", () => {
      const store = createPrimitiveStore({ test: "value" });

      (store as any).newProp = "test";
      expect("newProp" in store).toBe(false);
    });

    it("should handle proxy has trap correctly", () => {
      const store = createPrimitiveStore({ prop1: "value1", prop2: "value2" });

      expect("$get" in store).toBe(true);
      expect("$set" in store).toBe(true);
      expect("$use" in store).toBe(true);
      expect("$act" in store).toBe(true);

      expect("prop1" in store).toBe(false);
      expect("prop2" in store).toBe(false);
      expect("nonExistent" in store).toBe(false);

      expect(store.$get().prop1).toBe("value1");
      expect(store.$get().prop2).toBe("value2");
    });

    it("should handle getOwnPropertyDescriptor correctly", () => {
      const store = createPrimitiveStore({ test: "value" });

      const getDescriptor = Object.getOwnPropertyDescriptor(store, "$get");
      expect(getDescriptor).toEqual({
        configurable: true,
        enumerable: false,
        value: store.$get,
        writable: false,
      });

      const nonExistentDescriptor = Object.getOwnPropertyDescriptor(
        store,
        "nonExistent"
      );
      expect(nonExistentDescriptor).toBeUndefined();

      const stateDescriptor = Object.getOwnPropertyDescriptor(store, "test");
      expect(stateDescriptor).toBeUndefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle null and undefined states", () => {
      const nullStore = createPrimitiveStore<null | string>(null);
      expect(nullStore.$get()).toBe(null);

      nullStore.$set("not null");
      expect(nullStore.$get()).toBe("not null");

      const undefinedStore = createPrimitiveStore<
        undefined | { defined: boolean }
      >(undefined);
      expect(undefinedStore.$get()).toBeUndefined();

      undefinedStore.$set({ defined: true });
      expect(undefinedStore.$get()).toEqual({ defined: true });
    });

    it("should handle circular references", () => {
      const circularObj: any = { name: "test" };
      circularObj.self = circularObj;

      const store = createPrimitiveStore(circularObj);
      expect(store.$get().name).toBe("test");
      expect(store.$get().self).toBe(store.$get());
    });

    it("should handle Date objects", () => {
      const date = new Date("2024-01-01");
      const store = createPrimitiveStore(date);

      expect(store.$get()).toBe(date);
      expect(store.$get().getFullYear()).toBe(2024);

      const newDate = new Date("2025-01-01");
      store.$set(newDate);
      expect(store.$get().getFullYear()).toBe(2025);
    });

    it("should handle Map and Set objects", () => {
      const map = new Map([
        ["key1", "value1"],
        ["key2", "value2"],
      ]);
      const mapStore = createPrimitiveStore(map);

      expect(mapStore.$get().get("key1")).toBe("value1");

      const set = new Set([1, 2, 3]);
      const setStore = createPrimitiveStore(set);

      expect(setStore.$get().has(2)).toBe(true);
      expect(setStore.$get().size).toBe(3);
    });

    it("should handle functions as state", () => {
      const fn = (x: number) => x * 2;
      const store = createPrimitiveStore(fn);

      expect(store.$get()(5)).toBe(10);

      const newFn = (x: number) => x + 1;

      store.$set(() => newFn);
      expect(store.$get()(5)).toBe(6);
    });
  });

  describe("Type Safety and Complex Objects", () => {
    it("should maintain object structure integrity", () => {
      interface ComplexState {
        id: number;
        metadata: {
          config: {
            enabled: boolean;
            options: Record<string, any>;
          };
          created: Date;
          tags: string[];
        };
      }

      const initialState: ComplexState = {
        id: 1,
        metadata: {
          config: {
            enabled: true,
            options: { setting1: "value1", setting2: 42 },
          },
          created: new Date("2024-01-01"),
          tags: ["tag1", "tag2"],
        },
      };

      const store = createPrimitiveStore(initialState);

      expect(store.$get().id).toBe(1);
      expect(store.$get().metadata.tags).toEqual(["tag1", "tag2"]);
      expect(store.$get().metadata.config.enabled).toBe(true);

      store.$set((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          config: {
            ...prev.metadata.config,
            options: { ...prev.metadata.config.options, setting3: "new" },
          },
          tags: [...prev.metadata.tags, "tag3"],
        },
      }));

      expect(store.$get().metadata.tags).toEqual(["tag1", "tag2", "tag3"]);
      expect(store.$get().metadata.config.options.setting3).toBe("new");
    });
  });
});
