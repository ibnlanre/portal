import { renderHook } from "@testing-library/react";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_COMPOSITE_HANDLES } from "@/create-store/constants/composite-handles";
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
        // @ts-expect-error
        const nonExistent = () => store.$key("user.nonExistent.property");
        expect(nonExistent).not.toThrow();
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

        // Clear initial subscription calls
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

        // Clear initial call
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
            // Bears start dying when there's no fish
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

        // Bears eat fish
        store.eatFish();
        store.eatFish();
        expect(store.fish.$get()).toBe(8);

        // Can remove all bears
        store.removeAllBears();
        expect(store.bears.$get()).toBe(0);

        // Reset restores initial state
        store.bears.$set(3);
        store.fish.$set(2);
        store.reset();

        expect(store.bears.$get()).toBe(0);
        expect(store.fish.$get()).toBe(10);
      });

      it("should handle complex scenarios with interactions", () => {
        store.increasePopulation(5);

        // Eat all fish
        for (let i = 0; i < 10; i++) {
          store.eatFish();
        }

        // One bear died when fish ran out
        expect(store.fish.$get()).toBe(0);
        expect(store.bears.$get()).toBe(4);

        // No more fish to eat
        store.eatFish();
        expect(store.bears.$get()).toBe(3);

        // Test partial state updates
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

  describe("handles customization", () => {
    const state = { count: 0 };

    it("should only include specified handles", () => {
      const store = createCompositeStore(state, ["$get", "$set"]);
      expect(store).toHaveProperty("$get");
      expect(store).toHaveProperty("$set");
      expect(store).not.toHaveProperty("$act");
      expect(store).not.toHaveProperty("$use");
      expect(store).not.toHaveProperty("$key");
      expect(store.count).toHaveProperty("$get");
      expect(store.count).toHaveProperty("$set");
      expect(store.count).not.toHaveProperty("$act");
      expect(store.count).not.toHaveProperty("$use");
      expect(store.count).not.toHaveProperty("$key");
    });

    it("should include all default handles when not specified", () => {
      const store = createCompositeStore(state);
      DEFAULT_COMPOSITE_HANDLES.forEach((handle) => {
        expect(store).toHaveProperty(handle);
        expect(store.count).toHaveProperty(handle);
      });
    });

    it("should support single handle configuration", () => {
      const store = createCompositeStore(state, ["$get"]);
      expect(store).toHaveProperty("$get");
      expect(store).not.toHaveProperty("$set");
      expect(store).not.toHaveProperty("$act");
      expect(store).not.toHaveProperty("$use");
      expect(store).not.toHaveProperty("$key");
      expect(store.count).toHaveProperty("$get");
      expect(store.count).not.toHaveProperty("$set");
      expect(store.count).not.toHaveProperty("$act");
      expect(store.count).not.toHaveProperty("$use");
      expect(store.count).not.toHaveProperty("$key");
    });

    it("should correctly handle nested state with restricted handles", () => {
      const nestedState = {
        user: {
          profile: {
            name: "John",
            age: 30,
          },
        },
      };

      const store = createCompositeStore(nestedState, ["$get", "$key"]);
      expect(store).toHaveProperty("$get");
      expect(store).toHaveProperty("$key");
      expect(store).not.toHaveProperty("$set");
      expect(store.user.profile).toHaveProperty("$get");
      expect(store.user.profile).toHaveProperty("$key");
      expect(store.user.profile).not.toHaveProperty("$set");
      expect(store.user.profile.name).toHaveProperty("$get");
      expect(store.user.profile.name).not.toHaveProperty("$set");
    });

    it("should prevent operations with missing handles", () => {
      const store = createCompositeStore(state, ["$get"]);
      expect(() => store.$get()).not.toThrow();

      // @ts-expect-error - $set should not be available
      expect(() => store.$set(5)).toThrow();

      expect(() => {
        // @ts-expect-error - $act should not be available
        store.$act((state) => console.log(state));
      }).toThrow();
    });
  });
});
