import { renderHook } from "@testing-library/react";
import { act, useMemo } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createCompositeStore } from "./index";

describe("createCompositeStore", () => {
  it("should create a composite store with initial state", () => {
    const initialState = { key: "value" };
    const store = createCompositeStore(initialState);
    expect(store).toBeDefined();
    expect(store.$get()).toEqual(initialState);
  });

  describe("Basic API", () => {
    const state = {
      count: 0,
      user: {
        name: "John",
        preferences: { theme: "light", notifications: true },
      },
    };

    const store = createCompositeStore(state);

    describe(".$get method", () => {
      beforeEach(() => {
        store.$set(state);
      });

      it("should get root state", () => {
        expect(store.$get()).toEqual({
          count: 0,
          user: {
            name: "John",
            preferences: { theme: "light", notifications: true },
          },
        });
      });

      it("should get nested state", () => {
        expect(store.user.$get()).toEqual({
          name: "John",
          preferences: { theme: "light", notifications: true },
        });
        expect(store.user.preferences.$get()).toEqual({
          theme: "light",
          notifications: true,
        });
        expect(store.user.preferences.theme.$get()).toBe("light");
      });

      it("should get state with selector function", () => {
        expect(store.count.$get((count) => count + 5)).toBe(5);
        expect(store.user.name.$get((name) => name.toUpperCase())).toBe("JOHN");
      });

      it("should get state via $key path notation", () => {
        expect(store.$key("user.preferences.theme").$get()).toBe("light");
        expect(store.$key("user.preferences").$get()).toEqual({
          theme: "light",
          notifications: true,
        });
      });
    });

    describe(".$set method", () => {
      beforeEach(() => {
        store.$set(state);
      });

      it("should set root state values", () => {
        store.$set({
          count: 10,
          user: {
            name: "Jane",
            preferences: { theme: "dark", notifications: false },
          },
        });

        expect(state).toEqual({
          count: 0,
          user: {
            name: "John",
            preferences: { theme: "light", notifications: true },
          },
        });

        expect(store.$get()).toEqual({
          count: 10,
          user: {
            name: "Jane",
            preferences: { theme: "dark", notifications: false },
          },
        });

        store.$set((state) => ({ count: state.count + 10 }));

        expect(state).toEqual({
          count: 0,
          user: {
            name: "John",
            preferences: { theme: "light", notifications: true },
          },
        });

        expect(store.$get()).toEqual({
          count: 20,
          user: {
            name: "Jane",
            preferences: { theme: "dark", notifications: false },
          },
        });
      });

      it("should merge partial root state", () => {
        store.$set({ count: 10 });

        expect(state).toEqual({
          count: 0,
          user: {
            name: "John",
            preferences: { theme: "light", notifications: true },
          },
        });

        expect(store.$get()).toEqual({
          count: 10,
          user: {
            name: "John",
            preferences: { theme: "light", notifications: true },
          },
        });
      });

      it("should set nested state values directly", () => {
        store.user.name.$set("Jane");
        store.user.preferences.theme.$set("dark");

        expect(state).toEqual({
          count: 0,
          user: {
            name: "John",
            preferences: { theme: "light", notifications: true },
          },
        });

        expect(store.$get()).toEqual({
          count: 0,
          user: {
            name: "Jane",
            preferences: { theme: "dark", notifications: true },
          },
        });
      });

      it("should set nested values via $key path notation", () => {
        store
          .$key("user.preferences")
          .$set({ theme: "dark", notifications: false });

        expect(state).toEqual({
          count: 0,
          user: {
            name: "John",
            preferences: { theme: "light", notifications: true },
          },
        });

        expect(store.user.preferences.$get()).toEqual({
          theme: "dark",
          notifications: false,
        });

        store.$key("user.name").$set("Alice");

        expect(state).toEqual({
          count: 0,
          user: {
            name: "John",
            preferences: { theme: "light", notifications: true },
          },
        });

        expect(store.user.name.$get()).toBe("Alice");
      });

      it("should set values using update functions", () => {
        store.count.$set((c) => c + 5);

        expect(state).toEqual({
          count: 0,
          user: {
            name: "John",
            preferences: { theme: "light", notifications: true },
          },
        });
        expect(store.count.$get()).toBe(5);

        store.user.name.$set((name) => name.toUpperCase());
        expect(state).toEqual({
          count: 0,
          user: {
            name: "John",
            preferences: { theme: "light", notifications: true },
          },
        });
        expect(store.user.name.$get()).toBe("JOHN");

        store
          .$key("user.preferences.theme")
          .$set((theme) => (theme === "light" ? "dark" : "light"));

        expect(state).toEqual({
          count: 0,
          user: {
            name: "John",
            preferences: { theme: "light", notifications: true },
          },
        });
        expect(store.user.preferences.$key("theme").$get()).toBe("dark");
        expect(store.user.preferences.theme.$get()).toBe("dark");
      });

      it("should preserve other branches when updating a nested value with a partial input from the root", () => {
        store.$set({
          count: 0,
          user: {
            name: "John",
            preferences: { theme: "light", notifications: true },
          },
        });

        store.$set({ user: { name: "Jane" } });

        expect(store.$get()).toEqual({
          count: 0,
          user: {
            name: "Jane",
            preferences: { theme: "light", notifications: true },
          },
        });
      });

      it("should preserve nested branches when updating from root with partial input", () => {
        store.$set(state);

        store.$set({
          user: {
            name: "Jane",
          } as any,
        });

        expect(store.$get()).toEqual({
          count: 0,
          user: {
            name: "Jane",
            preferences: { theme: "light", notifications: true },
          },
        });

        store.$set({
          user: {
            preferences: {
              theme: "dark",
            },
          } as any,
        });

        expect(store.$get()).toEqual({
          count: 0,
          user: {
            name: "Jane",
            preferences: {
              theme: "dark",
              notifications: true,
            },
          },
        });
      });
    });

    describe(".$key method", () => {
      beforeEach(() => {
        store.$set(state);
      });

      it("should be defined", () => {
        expect(store.$key("user.preferences.notifications")).toBeDefined();
        expect(store.user.$key("preferences.notifications")).toBeDefined();
        expect(store.user.preferences.$key("notifications")).toBeDefined();
      });

      it("should allow chaining $key calls", () => {
        const theme = store.$key("user").$key("preferences").$key("theme");
        expect(theme.$get()).toBe("light");

        theme.$set("dark");
        expect(store.user.preferences.theme.$get()).toBe("dark");
      });

      it("should handle non-existent paths gracefully", () => {
        const nonExistentKey: any = "user.nonExistent.property";
        const nonExistent = () => store.$key(nonExistentKey);
        expect(nonExistent).not.toThrow();
        expect(nonExistent().$get()).toBeUndefined();
      });
    });

    describe(".$act method", () => {
      beforeEach(() => {
        store.$set(state);
      });

      it("should call subscribers with initial state", () => {
        const subscriber = vi.fn();
        store.$act(subscriber);
        expect(subscriber).toHaveBeenCalledWith(store.$get());
      });

      it("should notify subscribers on state changes", () => {
        const rootSubscriber = vi.fn();
        const countSubscriber = vi.fn();
        const userSubscriber = vi.fn();

        store.$act(rootSubscriber);
        store.count.$act(countSubscriber);
        store.user.$act(userSubscriber);

        rootSubscriber.mockClear();
        countSubscriber.mockClear();
        userSubscriber.mockClear();

        store.count.$set(5);

        expect(rootSubscriber).toHaveBeenCalledWith(
          expect.objectContaining({ count: 5 })
        );
        expect(countSubscriber).toHaveBeenCalledWith(5);
        expect(userSubscriber).not.toHaveBeenCalled();

        rootSubscriber.mockClear();
        countSubscriber.mockClear();

        store.user.name.$set("Jane");

        expect(rootSubscriber).toHaveBeenCalledWith(
          expect.objectContaining({
            user: expect.objectContaining({ name: "Jane" }),
          })
        );
        expect(countSubscriber).not.toHaveBeenCalled();
        expect(userSubscriber).toHaveBeenCalledWith(
          expect.objectContaining({ name: "Jane" })
        );
      });

      it("should allow unsubscribing from state changes", () => {
        const subscriber = vi.fn();
        const unsubscribe = store.$act(subscriber, false);

        subscriber.mockClear();

        unsubscribe();
        store.$set({ count: 10 });

        expect(subscriber).not.toHaveBeenCalled();
      });
    });
  });

  describe("React Integration", () => {
    const store = createCompositeStore({
      count: 0,
      text: "hello",
    });

    beforeEach(() => {
      store.$set({ count: 0, text: "hello" });
    });

    it("should provide state and setter via $use hook", () => {
      const { result } = renderHook(() => store.$use());
      const [state, setState] = result.current;

      expect(state).toEqual({ count: 0, text: "hello" });

      act(() => {
        setState({ count: 5, text: "updated" });
      });

      expect(result.current[0]).toEqual({ count: 5, text: "updated" });
      expect(store.$get()).toEqual({ count: 5, text: "updated" });
    });

    it("should allow using nested state in components", () => {
      const { result } = renderHook(() => store.count.$use());
      const [count, setCount] = result.current;

      expect(count).toBe(0);

      act(() => {
        setCount(10);
      });

      expect(result.current[0]).toBe(10);
      expect(store.count.$get()).toBe(10);
    });

    it("should support selectors and dependency arrays", () => {
      const { result, rerender } = renderHook(
        (prefix) => store.text.$use((text) => `${prefix}: ${text}`, [prefix]),
        { initialProps: "prefix" }
      );

      expect(result.current[0]).toBe("prefix: hello");

      act(() => {
        rerender("new prefix");
      });

      expect(result.current[0]).toBe("new prefix: hello");
      expect(store.text.$get()).toBe("hello");
    });

    it("should keep store state in sync across multiple hooks", () => {
      const { result: rootResult } = renderHook(() => store.$use());
      const { result: countResult } = renderHook(() => store.count.$use());
      const { result: textResult } = renderHook(() => store.text.$use());

      act(() => {
        countResult.current[1](50);
      });

      expect(rootResult.current[0]).toEqual({ count: 50, text: "hello" });
      expect(countResult.current[0]).toBe(50);
      expect(textResult.current[0]).toBe("hello");

      act(() => {
        rootResult.current[1]({ count: 100, text: "world" });
      });

      expect(countResult.current[0]).toBe(100);
      expect(textResult.current[0]).toBe("world");
    });

    it("should support deep partial updates with $use hook", () => {
      const complexStore = createCompositeStore({
        user: {
          name: "John",
          age: 30,
          preferences: {
            theme: "light",
            notifications: true,
            language: "en",
          },
        },
        settings: {
          volume: 80,
          autoplay: false,
        },
      });

      const { result: rootResult } = renderHook(() => complexStore.$use());
      const { result: userResult } = renderHook(() => complexStore.user.$use());
      const { result: preferencesResult } = renderHook(() =>
        complexStore.user.preferences.$use()
      );

      act(() => {
        rootResult.current[1]({ user: { name: "Jane" } });
      });

      expect(rootResult.current[0]).toEqual({
        user: {
          name: "Jane",
          age: 30,
          preferences: {
            theme: "light",
            notifications: true,
            language: "en",
          },
        },
        settings: {
          volume: 80,
          autoplay: false,
        },
      });

      act(() => {
        userResult.current[1]({ age: 31, preferences: { theme: "dark" } });
      });

      expect(userResult.current[0]).toEqual({
        name: "Jane",
        age: 31,
        preferences: {
          theme: "dark",
          notifications: true,
          language: "en",
        },
      });

      act(() => {
        preferencesResult.current[1]({ notifications: false });
      });

      expect(preferencesResult.current[0]).toEqual({
        theme: "dark",
        notifications: false,
        language: "en",
      });

      expect(rootResult.current[0].user.preferences.notifications).toBe(false);
      expect(userResult.current[0].preferences.notifications).toBe(false);
    });
  });

  describe("Derived State within React", () => {
    interface User {
      id: number;
      name: string;
      age: number;
    }

    interface Item {
      id: number;
      value: string;
      ownedBy: number;
    }

    it("should demonstrate reactivity issues with useMemo and provide correct solutions", () => {
      const users: User[] = [
        { id: 0, name: "Alice", age: 25 },
        { id: 1, name: "Bob", age: 30 },
      ];

      const items: Item[] = [
        { id: 1, value: "Item 1", ownedBy: 1 },
        { id: 2, value: "Item 2", ownedBy: 0 },
        { id: 3, value: "Item 3", ownedBy: 1 },
      ];

      const commonStore = createCompositeStore({
        users,
        items,
        getUserItems: (userId: number) => {
          return commonStore.items
            .$get()
            .filter((item) => item.ownedBy === userId);
        },
      });

      const userId = 1;

      const { result: problemResult } = renderHook(
        ({ userId }) => {
          const [items] = commonStore.items.$use();

          const userItems = useMemo(() => {
            return commonStore.getUserItems(userId);
          }, [userId]);

          return { items, userItems };
        },
        { initialProps: { userId } }
      );

      expect(problemResult.current.userItems).toHaveLength(2);
      expect(problemResult.current.userItems.map((item) => item.id)).toEqual([
        1, 3,
      ]);

      act(() => {
        commonStore.items.$set((prevItems) => [
          ...prevItems,
          { id: 4, value: "Item 4", ownedBy: userId },
        ]);
      });

      expect(problemResult.current.items).toHaveLength(4);

      expect(problemResult.current.userItems).toHaveLength(2);
      expect(problemResult.current.userItems.map((item) => item.id)).toEqual([
        1, 3,
      ]);

      const { result: correctResult } = renderHook(() => {
        const [userItems] = commonStore.items.$use((items) =>
          items.filter((item) => item.ownedBy === userId)
        );
        return { userItems };
      });

      expect(correctResult.current.userItems).toHaveLength(3);
      expect(correctResult.current.userItems.map((item) => item.id)).toEqual([
        1, 3, 4,
      ]);

      const { result: correctResult2 } = renderHook(
        ({ userId }) => {
          const [items] = commonStore.items.$use();
          const userItems = useMemo(() => {
            return items.filter((item) => item.ownedBy === userId);
          }, [items, userId]);

          return { userItems };
        },
        { initialProps: { userId } }
      );

      expect(correctResult2.current.userItems).toHaveLength(3);
      expect(correctResult2.current.userItems.map((item) => item.id)).toEqual([
        1, 3, 4,
      ]);

      act(() => {
        commonStore.items.$set((prevItems) => [
          ...prevItems,
          { id: 5, value: "Item 5", ownedBy: userId },
        ]);
      });

      expect(problemResult.current.userItems).toHaveLength(2);

      expect(correctResult.current.userItems).toHaveLength(4);
      expect(correctResult.current.userItems.map((item) => item.id)).toEqual([
        1, 3, 4, 5,
      ]);

      expect(correctResult2.current.userItems).toHaveLength(4);
      expect(correctResult2.current.userItems.map((item) => item.id)).toEqual([
        1, 3, 4, 5,
      ]);
    });

    it("should handle dynamic user selection with derived state", () => {
      const commonStore = createCompositeStore({
        users: [
          { id: 0, name: "Alice", age: 25 },
          { id: 1, name: "Bob", age: 30 },
        ],
        items: [
          { id: 1, value: "Item 1", ownedBy: 1 },
          { id: 2, value: "Item 2", ownedBy: 0 },
          { id: 3, value: "Item 3", ownedBy: 1 },
        ],
        selectedUserId: 1,
      });

      const { result } = renderHook(() => {
        const [selectedUserId] = commonStore.selectedUserId.$use();

        const [userItems] = commonStore.$use((state) =>
          state.items.filter((item) => item.ownedBy === state.selectedUserId)
        );
        const [selectedUser] = commonStore.$use((state) =>
          state.users.find((user) => user.id === state.selectedUserId)
        );

        return { selectedUserId, userItems, selectedUser };
      });

      expect(result.current.selectedUserId).toBe(1);
      expect(result.current.selectedUser?.name).toBe("Bob");
      expect(result.current.userItems).toHaveLength(2);
      expect(result.current.userItems.map((item) => item.id)).toEqual([1, 3]);

      act(() => {
        commonStore.selectedUserId.$set(0);
      });

      expect(result.current.selectedUserId).toBe(0);
      expect(result.current.selectedUser?.name).toBe("Alice");
      expect(result.current.userItems).toHaveLength(1);
      expect(result.current.userItems.map((item) => item.id)).toEqual([2]);

      act(() => {
        commonStore.items.$set((prevItems) => [
          ...prevItems,
          { id: 4, value: "Item 4", ownedBy: 0 },
        ]);
      });

      expect(result.current.userItems).toHaveLength(2);
      expect(result.current.userItems.map((item) => item.id)).toEqual([2, 4]);
    });
  });

  describe("Advanced Store Patterns", () => {
    describe("Method-based store (reducer pattern)", () => {
      const count = createCompositeStore({
        value: 0,
        set(value: number) {
          count.value.$set(value);
        },
        increase(value: number = 1) {
          count.value.$set((state) => state + value);
        },
        decrease(value: number = 1) {
          count.value.$set((state) => state - value);
        },
        reset() {
          count.value.$set(0);
        },
      });

      beforeEach(() => {
        count.reset();
      });

      it("should execute store methods correctly", () => {
        expect(count.value.$get()).toBe(0);

        count.increase();
        expect(count.value.$get()).toBe(1);

        count.increase(5);
        expect(count.value.$get()).toBe(6);

        count.decrease(2);
        expect(count.value.$get()).toBe(4);

        count.set(10);
        expect(count.value.$get()).toBe(10);

        count.reset();
        expect(count.value.$get()).toBe(0);
      });

      it("should access methods via $key", () => {
        count.$key("increase")(3);
        expect(count.value.$get()).toBe(3);

        count.$key("decrease")(1);
        expect(count.value.$get()).toBe(2);

        count.$key("set")(5);
        expect(count.value.$get()).toBe(5);

        count.$key("reset")();
        expect(count.value.$get()).toBe(0);
      });

      it("should handle method calls in React components", () => {
        const { result } = renderHook(() => count.$use());
        const [state] = result.current;

        act(() => {
          count.increase(3);
        });

        expect(count.value.$get()).toBe(3);

        const [updatedState] = result.current;
        expect(updatedState.value).toBe(3);

        const { result: valueResult } = renderHook(() => count.value.$use());
        expect(valueResult.current[0]).toBe(3);
      });
    });

    describe("Complex nested store with methods", () => {
      const store = createCompositeStore({
        bears: 0,
        fish: 10,
        increasePopulation: (by: number = 1) => {
          store.bears.$set((state) => state + by);
        },
        eatFish: () => {
          store.fish.$set((state) => Math.max(0, state - 1));
          if (store.fish.$get() === 0) {
            store.bears.$set((state) => Math.max(0, state - 1));
          }
        },
        removeAllBears: () => {
          store.bears.$set(0);
        },
        reset: () => {
          store.bears.$set(0);
          store.fish.$set(10);
        },
      });

      beforeEach(() => {
        store.$set({ bears: 0, fish: 10 });
      });

      it("should correctly implement business logic through methods", () => {
        store.increasePopulation(5);
        expect(store.bears.$get()).toBe(5);
        expect(store.fish.$get()).toBe(10);

        store.eatFish();
        store.eatFish();
        expect(store.fish.$get()).toBe(8);

        store.removeAllBears();
        expect(store.bears.$get()).toBe(0);

        store.bears.$set(3);
        store.fish.$set(2);
        store.reset();

        expect(store.bears.$get()).toBe(0);
        expect(store.fish.$get()).toBe(10);
      });

      it("should handle complex scenarios with interactions", () => {
        store.increasePopulation(5);

        for (let i = 0; i < 10; i++) {
          store.eatFish();
        }

        expect(store.fish.$get()).toBe(0);
        expect(store.bears.$get()).toBe(4);

        store.eatFish();
        expect(store.bears.$get()).toBe(3);

        store.$set({ fish: 5 });
        expect(store.$get()).toEqual(
          expect.objectContaining({ bears: 3, fish: 5 })
        );

        store.increasePopulation(2);
        expect(store.bears.$get()).toBe(5);
      });

      it("should integrate with React components", () => {
        const { result } = renderHook(() => {
          const [state] = store.$use();
          const [bearCount] = store.bears.$use();
          return { state, bearCount };
        });

        expect(result.current.state).toEqual(
          expect.objectContaining({ bears: 0, fish: 10 })
        );
        expect(result.current.bearCount).toBe(0);

        act(() => {
          store.increasePopulation(3);
        });

        const { result: updatedResult } = renderHook(() => {
          const [state] = store.$use();
          const [bearCount] = store.bears.$use();
          return { state, bearCount };
        });

        expect(updatedResult.current.state.bears).toBe(3);
        expect(updatedResult.current.bearCount).toBe(3);
      });
    });
  });

  describe("Circular References", () => {
    it("should handle circular references in selectors", () => {
      const circularObj: { ref: typeof circularObj | null } = { ref: null };
      circularObj.ref = circularObj;

      const store = createCompositeStore({
        data: { value: circularObj },
      });

      expect(() => store.data.value.$get()).not.toThrow();

      const value = store.data.value.ref.$get();
      expect(value?.ref?.ref?.ref?.ref?.ref?.ref).toBe(circularObj);
      expect(value?.ref?.ref).toBe(value);
    });

    it("should handle creating store with circular reference", () => {
      const circularObj: { ref: typeof circularObj | null } = { ref: null };
      circularObj.ref = circularObj;

      expect(() => {
        const store = createCompositeStore({
          data: { value: circularObj },
        });
      }).not.toThrow();
    });

    it("should handle accessing value with circular reference", () => {
      const circularObj: { ref: typeof circularObj | null } = { ref: null };
      circularObj.ref = circularObj;

      const store = createCompositeStore({
        data: { value: circularObj },
      });

      expect(() => store.data.value.$get()).not.toThrow();
    });

    it("should reuse augmented objects for circular references", () => {
      const circularObj: { value: number; ref?: typeof circularObj } = {
        value: 42,
      };
      circularObj.ref = circularObj;

      const store = createCompositeStore({
        data: circularObj,
        other: circularObj,
      });

      expect(store.data).toBe(store.other);

      expect(store.data.$get).toBeDefined();
      expect(store.data.value.$get).toBeDefined();
      expect(store.data.value.$get()).toBe(42);

      expect(() => store.data.ref?.$get()).not.toThrow();
      expect(store.data.ref?.$get()).toEqual(circularObj);
      expect(store.data.ref).toEqual(store.data);
      expect(store.other.ref?.ref).toEqual(store.other);
    });

    it("should handle deeply nested circular references", () => {
      const objA: { name: string; ref?: typeof objB } = { name: "A" };
      const objB: { name: string; ref: typeof objA } = { name: "B", ref: objA };
      objA.ref = objB;

      const store = createCompositeStore({
        container: {
          a: objA,
          b: objB,
        },
      });

      expect(() => store.container.a.$get()).not.toThrow();
      expect(() => store.container.b.$get()).not.toThrow();

      expect(store.container.a.ref).toEqual(store.container.b);
      expect(store.container.b.ref).toEqual(store.container.a);

      expect(store.container.a.name.$get()).toBe("A");
      expect(store.container.b.name.$get()).toBe("B");
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle undefined and null values", () => {
      const store = createCompositeStore({
        data: { value: 42 as number | null | undefined },
      });

      store.data.$set({ value: undefined });
      expect(store.data.value.$get()).toBeUndefined();

      store.data.$set({ value: null });
      expect(store.data.value.$get()).toBeNull();
    });

    it("should handle deep path navigation", () => {
      const store = createCompositeStore({
        nested: { deep: { value: "test" } },
      });

      const deepPath = store.$key("nested.deep.value");
      expect(deepPath.$get()).toBe("test");

      deepPath.$set("updated");
      expect(store.nested.deep.value.$get()).toBe("updated");
    });

    it("should handle array-like objects", () => {
      const store = createCompositeStore({
        data: { items: [1, 2, 3] },
      });

      expect(store.data.items.$get()).toEqual([1, 2, 3]);

      store.data.items.$set([4, 5, 6]);
      expect(store.data.items.$get()).toEqual([4, 5, 6]);
    });

    it("should handle numeric keys", () => {
      const store = createCompositeStore({
        data: { "0": "first", "1": "second" } as Record<string, string>,
      });

      expect(store.data["0"]?.$get()).toBe("first");
      expect(store.data["1"]?.$get()).toBe("second");
    });

    it("should handle symbol keys", () => {
      const sym = Symbol("test");
      const objWithSymbol = { [sym]: "symbol value", regular: "regular" };

      const store = createCompositeStore({
        data: objWithSymbol,
      });

      expect(store.data.regular.$get()).toBe("regular");

      expect(store.data.$get()[sym]).toBe("symbol value");
    });
  });

  describe("Performance and Memory Management", () => {
    it("should handle large state objects efficiently", () => {
      const largeState: Record<string, any> = {};
      for (let i = 0; i < 1000; i++) {
        largeState[`key${i}`] = { value: i, nested: { data: i * 2 } };
      }

      const store = createCompositeStore(largeState);

      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        store[`key${i}`].value.$set(i + 1000);
      }
      const end = performance.now();

      expect(end - start).toBeLessThan(1000);
      expect(store.key99.value.$get()).toBe(1099);
    });

    it("should properly clean up subscribers on unsubscribe", () => {
      const store = createCompositeStore({ count: 0 });
      const subscribers = [];

      for (let i = 0; i < 10; i++) {
        const unsubscribe = store.count.$act(() => {});
        subscribers.push(unsubscribe);
      }

      subscribers.forEach((unsub) => unsub());

      store.count.$set(42);
      expect(store.count.$get()).toBe(42);
    });
  });

  describe("Type Safety", () => {
    it("should maintain type safety with nested objects", () => {
      const userState = {
        profile: {
          name: "John",
          age: 30,
          settings: {
            theme: "light" as "light" | "dark",
            notifications: true,
          },
        },
      };

      const store = createCompositeStore(userState);

      expect(store.profile.name.$get()).toBe("John");
      expect(store.profile.age.$get()).toBe(30);
      expect(store.profile.settings.theme.$get()).toBe("light");

      store.profile.settings.theme.$set("dark" as any);
      expect(store.profile.settings.theme.$get()).toBe("dark");
    });

    it("should handle optional properties correctly", () => {
      const store = createCompositeStore({
        user: {
          name: "John",
          email: undefined as string | undefined,
        },
      });

      expect(store.user.name.$get()).toBe("John");
      expect(store.user.email.$get()).toBeUndefined();

      store.user.email.$set("john@example.com" as any);
      expect(store.user.email.$get()).toBe("john@example.com");
    });
  });

  describe("Selector Functions Advanced Cases", () => {
    const store = createCompositeStore({
      users: [
        { id: 1, name: "John", active: true },
        { id: 2, name: "Jane", active: false },
        { id: 3, name: "Bob", active: true },
      ],
      filters: { showActive: true },
    });

    beforeEach(() => {
      store.$set({
        users: [
          { id: 1, name: "John", active: true },
          { id: 2, name: "Jane", active: false },
          { id: 3, name: "Bob", active: true },
        ],
        filters: { showActive: true },
      });
    });

    it("should handle complex selector transformations", () => {
      const activeUsers = store.users.$get((users) =>
        users.filter((user) => user.active)
      );

      expect(activeUsers).toHaveLength(2);
      expect(activeUsers.map((user) => user.name)).toEqual(["John", "Bob"]);
    });

    it("should handle selectors with multiple dependencies", () => {
      const filteredUsers = store.$get((state) => {
        const { users, filters } = state;
        return filters.showActive ? users.filter((user) => user.active) : users;
      });

      expect(filteredUsers).toHaveLength(2);

      store.filters.showActive.$set(false);
      const allUsers = store.$get((state) => {
        const { users, filters } = state;
        return filters.showActive ? users.filter((user) => user.active) : users;
      });

      expect(allUsers).toHaveLength(3);
    });

    it("should handle async selector scenarios", async () => {
      const asyncSelector = async (
        users: {
          id: number;
          name: string;
          active: boolean;
        }[]
      ) => {
        await new Promise((resolve) => setTimeout(resolve, 1));
        return users.filter((user) => user.active).length;
      };

      const activeCount = await asyncSelector(store.users.$get());
      expect(activeCount).toBe(2);
    });
  });

  describe("Integration with External Libraries", () => {
    it("should work with immutability libraries", () => {
      const store = createCompositeStore({
        todos: [
          { id: 1, text: "Learn React", completed: false },
          { id: 2, text: "Build App", completed: false },
        ],
      });

      store.todos.$set((todos) => [
        ...todos,
        { id: 3, text: "Deploy", completed: false },
      ]);

      expect(store.todos.$get()).toHaveLength(3);
      expect(store.todos.$get()[2]?.text).toBe("Deploy");
    });

    it("should handle state serialization and deserialization", () => {
      const initialState = {
        user: { name: "John", age: 30 },
        settings: { theme: "dark" },
      };

      const store = createCompositeStore(initialState);

      const serialized = JSON.stringify(store.$get());
      const deserialized = JSON.parse(serialized);

      const newStore = createCompositeStore(deserialized);
      expect(newStore.$get()).toEqual(initialState);
    });
  });
});
