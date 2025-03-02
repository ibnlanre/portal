import { renderHook } from "@testing-library/react";
import { act, useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createCompositeStore } from "./index";

describe("createCompositeStore", () => {
  it("should create a composite store with initial state", () => {
    const initialState = { key: "value" };
    const store = createCompositeStore(initialState);
    expect(store).toBeDefined();
  });

  describe(".$get", () => {
    it("should get the state value with .$get", () => {
      const initialState = { key: "value" };
      const store = createCompositeStore(initialState);

      const stateValue = store.$get();
      expect(stateValue).toEqual(initialState);

      const uppercasedValue = store.key.$get((key) => key.toUpperCase());
      expect(uppercasedValue).toBe("VALUE");
    });

    it("should get a nested state value with .$get", () => {
      const initialState = { location: { address: { street: "123 Main St" } } };
      const store = createCompositeStore(initialState);

      const streetValue = store.location.address.street.$get();
      expect(streetValue).toBe("123 Main St");

      const addressValue = store.$tap("location.address").$get();
      expect(addressValue).toEqual({ street: "123 Main St" });
    });
  });

  describe(".$set", () => {
    it("should set the state value with .$set", () => {
      const initialState = { key: "value" };
      const store = createCompositeStore(initialState);

      store.$set({ key: "new value" });
      expect(store.$get()).toEqual({ key: "new value" });

      store.$set((state) => ({ key: state.key.toUpperCase() }));
      expect(store.$get()).toEqual({ key: "NEW VALUE" });
    });

    it("should set a nested state value with .$set", () => {
      const initialState = { location: { address: { street: "123 Main St" } } };
      const store = createCompositeStore(initialState);

      // Dot notation

      store.location.address.street.$set("456 Elm St");
      expect(store.$get()).toEqual({
        location: { address: { street: "456 Elm St" } },
      });
      expect(store.location.$get()).toEqual({
        address: { street: "456 Elm St" },
      });
      expect(store.location.address.$get()).toEqual({ street: "456 Elm St" });
      expect(store.location.address.street.$get()).toBe("456 Elm St");

      // Dot path notation

      store.$tap("location.address").$set({ street: "789 Oak St" });
      expect(store.$get()).toEqual({
        location: { address: { street: "789 Oak St" } },
      });
      expect(store.$tap("location").$get()).toEqual({
        address: { street: "789 Oak St" },
      });
      expect(store.$tap("location.address").$get()).toEqual({
        street: "789 Oak St",
      });
      expect(store.$tap("location.address.street").$get()).toBe("789 Oak St");
    });

    it("should set a nested state value with .$set using a function", () => {
      const initialState = { location: { address: { street: "123 Main St" } } };
      const store = createCompositeStore(initialState);

      store.location.address.street.$set((street) => `${street} Suite 100`);

      const updatedStreetValue = store.location.address.street.$get();
      expect(updatedStreetValue).toBe("123 Main St Suite 100");

      const updatedAddressValue = store.$tap("location.address").$get();
      expect(updatedAddressValue).toEqual({ street: "123 Main St Suite 100" });
    });
  });

  describe(".$sub", () => {
    it("should subscribe to state changes", () => {
      const initialState = { key: "value" };
      const store = createCompositeStore(initialState);
      const subscriber = vi.fn();

      store.$sub(subscriber);
      expect(subscriber).toHaveBeenCalledWith(initialState);

      store.$set({ key: "new value" });
      expect(subscriber).toHaveBeenCalledWith({ key: "new value" });
    });

    it("should unsubscribe from state changes", () => {
      const initialState = { key: "value" };
      const store = createCompositeStore(initialState);

      const subscriber = vi.fn();
      const unsubscribe = store.$sub(subscriber, false);
      unsubscribe();

      store.$set({ key: "new value" });
      expect(subscriber).not.toHaveBeenCalled();
    });
  });

  describe(".$tap", () => {
    it("should tap into a nested state value", () => {
      const initialState = { location: { address: { street: "123 Main St" } } };
      const store = createCompositeStore(initialState);

      expect(store.$tap("location.address.street")).toBeDefined();
      expect(store.location.$tap("address")).toBeDefined();
      expect(store.location.address.$tap("street")).toBeDefined();
    });

    it("should tap into a nested state value and update it", () => {
      const initialState = { location: { address: { street: "123 Main St" } } };
      const store = createCompositeStore(initialState);

      const address = store.$tap("location.address");

      expect(address.street.$get()).toBe("123 Main St");
      expect(store.$get()).toMatchObject({
        location: { address: { street: "123 Main St" } },
      });

      const street = store.$tap("location.address.street");
      street.$set((previous) => `${previous} Suite 100`);

      expect(street.$get()).toBe("123 Main St Suite 100");
      expect(store.$get()).toMatchObject({
        location: { address: { street: "123 Main St Suite 100" } },
      });

      const location = store.$tap("location");
      location.address.street.$set("456 Elm St");

      expect(location.address.street.$get()).toBe("456 Elm St");
      expect(store.$get()).toMatchObject({
        location: { address: { street: "456 Elm St" } },
      });
    });
  });

  describe(".$use", () => {
    it("should use the state value in a React component", () => {
      const initialState = { key: "value" };
      const store = createCompositeStore(initialState);

      const { result } = renderHook(() => store.$use());
      const [stateValue] = result.current;

      expect(stateValue).toEqual(initialState);
    });

    it("should update the state value in a React component", () => {
      const initialState = { key: "value" };
      const store = createCompositeStore(initialState);

      const { result } = renderHook(() => store.$use());
      const [, setStateValue] = result.current;

      act(() => {
        setStateValue({ key: "new value" });
      });

      const [updatedStateValue] = result.current;
      expect(updatedStateValue).toEqual({ key: "new value" });
    });

    it("should use a nested state value in a React component", () => {
      const initialState = { location: { address: { street: "123 Main St" } } };
      const store = createCompositeStore(initialState);

      const { result } = renderHook(() => store.location.address.street.$use());
      const [streetValue] = result.current;

      expect(streetValue).toBe("123 Main St");
    });

    it("should update a nested state value in a React component", () => {
      const initialState = { location: { address: { street: "123 Main St" } } };
      const store = createCompositeStore(initialState);

      const { result } = renderHook(() => store.location.address.street.$use());
      const [, setStreetValue] = result.current;

      act(() => {
        setStreetValue("456 Elm St");
      });

      const [updatedStreetValue] = result.current;
      expect(updatedStreetValue).toBe("456 Elm St");
    });

    it("should use a state value with a selector and dependency array", () => {
      const initialState = { key: "value" };
      const store = createCompositeStore(initialState);

      const dependencyHook = renderHook(() => useState("previous"));
      const [, setDependencyValue] = dependencyHook.result.current;

      const storeHook = renderHook(() => {
        const [dependencyValue] = dependencyHook.result.current;
        return store.$use(
          (state) => `${dependencyValue} ${state.key}`,
          [dependencyValue]
        );
      });

      const [stateValue] = storeHook.result.current;
      expect(stateValue).toBe("previous value");

      act(() => {
        setDependencyValue("updated");
        storeHook.rerender();
      });

      const [newDependencyValue] = dependencyHook.result.current;
      expect(newDependencyValue).toBe("updated");

      const [newStateValue] = storeHook.result.current;
      expect(newStateValue).toBe("updated value");
    });
  });

  describe("reducer pattern", () => {
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

    it("should initialize the store with the correct state", () => {
      expect(count.value.$get()).toBe(0);
    });

    it("should set the count to the specified value when set is called", () => {
      count.set(5);
      expect(count.value.$get()).toBe(5);
    });

    it("should increase the count by 1 when increase is called without a value", () => {
      count.increase();
      expect(count.value.$get()).toBe(1);

      count.$tap("increase")();
      expect(count.value.$get()).toBe(2);
    });

    it("should increase the count to the specified value when increase is called with a value", () => {
      count.set(2);

      count.increase(5);
      expect(count.value.$get()).toBe(7);

      count.$tap("increase")(3);
      expect(count.value.$get()).toBe(10);
    });

    it("should decrease the count by 1 when decrease is called without a value", () => {
      count.decrease();
      expect(count.value.$get()).toBe(-1);

      count.$tap("decrease")();
      expect(count.value.$get()).toBe(-2);
    });

    it("should decrease the count to the specified value when decrease is called with a value", () => {
      count.decrease(3);
      expect(count.value.$get()).toBe(-3);

      count.$tap("decrease")(5);
      expect(count.value.$get()).toBe(-8);
    });

    it("should reset the count to 0 when reset is called", () => {
      count.set(5);

      count.reset();
      expect(count.value.$get()).toBe(0);
    });
  });

  describe("Reducer pattern with nested state", () => {
    const store = createCompositeStore({
      bears: 0,
      fish: 0,
      increasePopulation: (by: number = 1) => {
        store.bears.$set((state) => state + by);
      },
      eatFish: () => {
        store.fish.$set((state) => state - 1);
      },
      removeAllBears: () => {
        store.bears.$set(0);
      },
      reset: () => {
        store.bears.$set(0);
        store.fish.$set(0);
      },
    });

    beforeEach(() => {
      store.reset();
    });

    it("should initialize with correct default values", () => {
      expect(store.bears.$get()).toBe(0);
      expect(store.fish.$get()).toBe(0);
    });

    it("should increase bear population", () => {
      store.increasePopulation(5);
      expect(store.bears.$get()).toBe(5);
    });

    it("should decrease fish population", () => {
      store.eatFish();
      expect(store.fish.$get()).toBe(-1);
    });

    it("should remove all bears", () => {
      store.increasePopulation(5);
      store.removeAllBears();
      expect(store.bears.$get()).toBe(0);
    });

    it("should handle increasePopulation with default value", () => {
      store.increasePopulation();
      expect(store.bears.$get()).toBe(1);
    });

    it("should not affect fish population when increasing bear population", () => {
      store.increasePopulation(3);
      expect(store.fish.$get()).toBe(0);
    });

    it("should not affect bear population when eating fish", () => {
      store.eatFish();
      expect(store.bears.$get()).toBe(0);
    });
  });
});
