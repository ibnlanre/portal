import { renderHook } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it, vi } from "vitest";

import { createAtom } from "@/create-store/functions/library/create-atom";

import { createPrimitiveStore } from "./index";

describe("createPrimitiveStore", () => {
  describe("Proxy Shape", () => {
    it("should expose only store methods", () => {
      const store = createPrimitiveStore("initial value");
      const storeKeys = Object.keys(store).filter((key) => key.startsWith("$"));

      expect(storeKeys).toEqual([]);

      expect(store.$get).toBeTypeOf("function");
      expect(store.$set).toBeTypeOf("function");
      expect(store.$use).toBeTypeOf("function");
      expect(store.$sub).toBeTypeOf("function");

      expect(store.$get()).toBe("initial value");
      expect(() => store.$set("new value")).not.toThrow();
      expect(store.$get()).toBe("new value");

      expect((store as any).value).toBeUndefined();
    });

    it("should make store methods non-enumerable", () => {
      const store = createPrimitiveStore("test");

      const keys = Object.keys(store);
      expect(keys).toEqual([]);

      const forInKeys: string[] = [];
      for (const key in store) {
        forInKeys.push(key);
      }
      expect(forInKeys).toEqual([]);

      expect(store.$get()).toBe("test");
    });

    it("should handle 'in' operator for primitive store", () => {
      const store = createPrimitiveStore("test");

      expect("$get" in store).toBe(true);
      expect("$set" in store).toBe(true);
      expect("$use" in store).toBe(true);
      expect("$sub" in store).toBe(true);

      expect("value" in store).toBe(false);

      expect("nonExistent" in store).toBe(false);
    });

    it("should handle property descriptors for primitive store", () => {
      const store = createPrimitiveStore("test value");

      const getDescriptor = Object.getOwnPropertyDescriptor(store, "$get");
      expect(getDescriptor).toBeDefined();
      expect(getDescriptor?.enumerable).toBe(false);
      expect(getDescriptor?.configurable).toBe(true);
      expect(getDescriptor?.writable).toBe(false);

      const valueDescriptor = Object.getOwnPropertyDescriptor(store, "value");
      expect(valueDescriptor).toBeUndefined();
    });

    it("should handle different primitive types", () => {
      const stringStore = createPrimitiveStore("hello");
      const numberStore = createPrimitiveStore(42);
      const booleanStore = createPrimitiveStore(true);
      const nullStore = createPrimitiveStore(null);
      const undefinedStore = createPrimitiveStore(undefined);

      expect(stringStore.$get).toBeTypeOf("function");
      expect(numberStore.$get).toBeTypeOf("function");
      expect(booleanStore.$get).toBeTypeOf("function");
      expect(nullStore.$get).toBeTypeOf("function");
      expect(undefinedStore.$get).toBeTypeOf("function");

      expect(stringStore.$get()).toBe("hello");
      expect(numberStore.$get()).toBe(42);
      expect(booleanStore.$get()).toBe(true);
      expect(nullStore.$get()).toBe(null);
      expect(undefinedStore.$get()).toBe(undefined);

      expect((stringStore as any).value).toBeUndefined();
      expect((numberStore as any).value).toBeUndefined();
      expect((booleanStore as any).value).toBeUndefined();
      expect((nullStore as any).value).toBeUndefined();
      expect((undefinedStore as any).value).toBeUndefined();
    });

    it("should prevent overriding store methods", () => {
      const store = createPrimitiveStore("test");
      const original$get = store.$get;
      const original$set = store.$set;

      expect(() => {
        (store as any).$get = "should not work";
      }).not.toThrow();

      expect(store.$get).toBe(original$get);

      expect(() => {
        (store as any).$set = "should not work";
      }).not.toThrow();

      expect(store.$set).toBe(original$set);
    });

    it("should prevent property definition and deletion", () => {
      const store = createPrimitiveStore(100);

      expect(() => {
        (store as any).newProperty = "value";
      }).not.toThrow();
      expect((store as any).newProperty).toBeUndefined();

      expect(() => {
        Object.defineProperty(store, "customProp", {
          enumerable: true,
          value: "test",
        });
      }).not.toThrow();
      expect((store as any).customProp).toBeUndefined();

      expect(() => {
        delete (store as any).$get;
      }).not.toThrow();
      expect(typeof store.$get).toBe("function");
    });
  });

  describe("Basic Functionality", () => {
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
      store.$sub(subscriber);
      expect(subscriber).toHaveBeenCalledWith(initialState);

      store.$set("new value");
      expect(subscriber).toHaveBeenCalledWith("new value");
    });

    it("should unsubscribe from state changes", () => {
      const initialState = "value";
      const store = createPrimitiveStore(initialState);

      const subscriber = vi.fn();
      const unsubscribe = store.$sub(subscriber);

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
      expect(keys).not.toContain("$sub");
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

      store.$sub(subscriber1);
      store.$sub(subscriber2);
      store.$sub(subscriber3);

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

      store.$sub(subscriber, false);
      expect(subscriber).not.toHaveBeenCalled();

      store.$set("updated");
      expect(subscriber).toHaveBeenCalledWith("updated");
      expect(subscriber).toHaveBeenCalledTimes(1);
    });

    it("should handle partial unsubscription", () => {
      const store = createPrimitiveStore("initial");

      const subscriber1 = vi.fn();
      const subscriber2 = vi.fn();

      const unsubscribe1 = store.$sub(subscriber1);
      store.$sub(subscriber2);

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

  describe("Atomic Objects in Primitive Stores", () => {
    it("should handle atomic objects with complete replacement", () => {
      const store = createPrimitiveStore(
        createAtom({
          language: "en",
          theme: "dark",
        })
      );

      expect(store.$get()).toEqual({ language: "en", theme: "dark" });

      store.$set({ theme: "light" });

      expect(store.$get()).toEqual({ theme: "light" });
      expect(store.$get().language).toBeUndefined();
    });

    it("should handle partial updates on atomic objects", () => {
      const store = createPrimitiveStore(
        createAtom<{
          notifications: boolean;
          theme: string;
          fontSize: number;
        }>({
          notifications: true,
          theme: "dark",
        })
      );

      store.$set({ theme: "light", fontSize: 14 });

      expect(store.$get()).toEqual({ theme: "light", fontSize: 14 });
      expect(store.$get().notifications).toBeUndefined();
    });

    it("should handle function-based updates on atomic objects", () => {
      const store = createPrimitiveStore(
        createAtom({
          count: 0,
          multiplier: 2,
        })
      );

      store.$set((current) => {
        expect(current).toEqual({ count: 0, multiplier: 2 });
        return { count: (current.count ?? 0) + 5 };
      });

      expect(store.$get()).toEqual({ count: 5 });
      expect(store.$get().multiplier).toBeUndefined();
    });

    it("should notify subscribers when atomic objects change", () => {
      const store = createPrimitiveStore(
        createAtom({
          language: "en",
          theme: "dark",
        })
      );

      const subscriber = vi.fn();
      store.$sub(subscriber);

      subscriber.mockClear();

      store.$set({ theme: "light" });

      expect(subscriber).toHaveBeenCalledWith({ theme: "light" });
      expect(subscriber).toHaveBeenCalledTimes(1);
    });

    it("should work with React hooks for atomic objects", () => {
      interface Store {
        language: string;
        theme: string;
        fontSize: number;
      }

      const store = createPrimitiveStore(
        createAtom<Store>({
          language: "en",
          theme: "dark",
        })
      );

      const { result } = renderHook(() => store.$use());
      const [state, setState] = result.current;

      expect(state).toEqual({ language: "en", theme: "dark" });

      act(() => {
        setState({ theme: "light", fontSize: 16 });
      });

      expect(result.current[0]).toEqual({ theme: "light", fontSize: 16 });
      expect(store.$get()).toEqual({ theme: "light", fontSize: 16 });
    });

    it("should handle atomic objects with selectors", () => {
      interface Store {
        user: { name: string; age: number };
        settings: { theme: string; notifications: boolean };
        profile: { id: number; email: string };
      }

      const store = createPrimitiveStore(
        createAtom<Store>({
          user: {
            name: "John",
            age: 30,
          },
          settings: {
            theme: "dark",
            notifications: true,
          },
        })
      );

      expect(store.$get((state) => state.user?.name)).toBe("John");
      expect(store.$get((state) => state.settings?.theme)).toBe("dark");

      store.$set({
        profile: {
          id: 123,
          email: "john@example.com",
        },
      });

      expect(store.$get((state) => state.profile?.id)).toBe(123);
      expect(store.$get((state) => state.user)).toBeUndefined();
      expect(store.$get((state) => state.settings)).toBeUndefined();
    });

    it("should handle empty atomic objects", () => {
      const store = createPrimitiveStore(
        createAtom<{ newProperty: string }>({})
      );

      expect(store.$get()).toEqual({});

      store.$set({ newProperty: "value" });

      expect(store.$get()).toEqual({ newProperty: "value" });
    });

    it("should handle complex nested atomic objects", () => {
      interface Store {
        config: {
          api: { timeout: number; retries: number };
          ui: { theme: string; sidebar: string };
        };
        metadata: { version: string; features: string[] };
        settings: { theme: string };
        info: { build: string };
      }

      const store = createPrimitiveStore(
        createAtom<Store>({
          config: {
            api: {
              timeout: 5000,
              retries: 3,
            },
            ui: {
              theme: "dark",
              sidebar: "collapsed",
            },
          },
          metadata: {
            version: "1.0",
            features: ["feature1", "feature2"],
          },
        })
      );

      expect(store.$get().config?.api?.timeout).toBe(5000);
      expect(store.$get().metadata?.features).toEqual(["feature1", "feature2"]);

      store.$set({
        settings: {
          theme: "light",
        },
        info: {
          build: "123",
        },
      });

      expect(store.$get()).toEqual({
        settings: { theme: "light" },
        info: { build: "123" },
      });
      expect(store.$get().config).toBeUndefined();
      expect(store.$get().metadata).toBeUndefined();
    });

    it("should maintain atom behavior across multiple updates", () => {
      interface Store {
        step: number;
        value: number;
        extra: string;
        final: number;
      }

      const store = createPrimitiveStore(
        createAtom<Store>({
          step: 1,
          value: 0,
        })
      );

      store.$set({ value: 10 });
      expect(store.$get()).toEqual({ value: 10 });

      store.$set({ step: 5, value: 20, extra: "data" });
      expect(store.$get()).toEqual({ step: 5, value: 20, extra: "data" });

      store.$set((current) => ({
        final: (current.value ?? 0) + (current.step ?? 0),
      }));
      expect(store.$get()).toEqual({ final: 25 });
    });

    it("should handle subscription with multiple atomic object changes", () => {
      const store = createPrimitiveStore(
        createAtom<{
          count: number;
          name: string;
          extra: boolean;
        }>({
          count: 0,
          name: "test",
        })
      );

      const subscriber = vi.fn();
      store.$sub(subscriber);
      subscriber.mockClear();

      store.$set({ count: 1 });
      store.$set({ name: "updated" });
      store.$set({ count: 5, name: "final", extra: true });

      expect(subscriber).toHaveBeenCalledTimes(3);
      expect(subscriber).toHaveBeenNthCalledWith(1, { count: 1 });
      expect(subscriber).toHaveBeenNthCalledWith(2, { name: "updated" });
      expect(subscriber).toHaveBeenNthCalledWith(3, {
        count: 5,
        name: "final",
        extra: true,
      });
    });

    it("should support creating atoms with partial objects", () => {
      interface Store {
        optional?: number;
        required: string;
        nested: {
          prop1: string;
          prop2: number;
          deep: {
            value: boolean;
          };
        };
      }

      const store1 = createPrimitiveStore(
        createAtom<Store>({
          required: "test",
        })
      );

      expect(store1.$get()).toEqual({ required: "test" });

      const store2 = createPrimitiveStore(
        createAtom<Store>({
          required: "test",
          nested: {
            prop1: "partial",
          },
        })
      );

      expect(store2.$get()).toEqual({
        required: "test",
        nested: { prop1: "partial" },
      });

      store2.$set({
        optional: 42,
        nested: {
          prop2: 10,
          deep: { value: true },
        },
      });

      expect(store2.$get()).toEqual({
        optional: 42,
        nested: {
          prop2: 10,
          deep: { value: true },
        },
      });
      expect(store2.$get().required).toBeUndefined();
    });

    it("should handle createAtom idempotency", () => {
      const initialObject = { theme: "dark", language: "en" };

      const atom1 = createAtom(initialObject);
      const atom2 = createAtom(atom1);

      expect(atom1).toBe(atom2);

      const store = createPrimitiveStore(atom1);
      expect(store.$get()).toEqual({ theme: "dark", language: "en" });

      store.$set({ theme: "light" });
      expect(store.$get()).toEqual({ theme: "light" });
    });

    it("should handle atomic objects with different property types", () => {
      interface Store {
        booleanProp: boolean;
        numberProp: number;
        stringProp: string;
        arrayProp: number[];
        objectProp: { nested: string };
        nullProp: null;
        undefinedProp: undefined;
        newString: string;
        newNumber: number;
        newArray: string[];
        newObject: { different: string };
      }

      const store = createPrimitiveStore(
        createAtom<Store>({
          booleanProp: true,
          numberProp: 42,
          stringProp: "hello",
          arrayProp: [1, 2, 3],
          objectProp: { nested: "value" },
          nullProp: null,
          undefinedProp: undefined,
        })
      );

      store.$set({
        newString: "world",
        newNumber: 100,
        newArray: ["a", "b"],
        newObject: { different: "structure" },
      });

      expect(store.$get()).toEqual({
        newString: "world",
        newNumber: 100,
        newArray: ["a", "b"],
        newObject: { different: "structure" },
      });

      expect(store.$get().booleanProp).toBeUndefined();
      expect(store.$get().stringProp).toBeUndefined();
      expect(store.$get().arrayProp).toBeUndefined();
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
      expect("$sub" in store).toBe(true);

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
