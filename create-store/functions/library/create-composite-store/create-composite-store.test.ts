import { renderHook } from "@testing-library/react";
import { act, useState } from "react";
import { describe, expect, it, vi } from "vitest";
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

      const updatedStateValue = store.$get();
      expect(updatedStateValue).toEqual({ key: "new value" });
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

    it("should tap into a nested state value with a function", () => {
      const initialState = { location: { address: { street: "123 Main St" } } };
      const store = createCompositeStore(initialState);

      const street = store.$tap("location.address.street");
      street.$set("456 Elm St");

      expect(street.$get()).toBe("456 Elm St");
      expect(store.$get()).not.equal(initialState);
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

      const { result, rerender } = renderHook(() =>
        store.location.address.street.$use()
      );
      const [, setStreetValue] = result.current;

      act(() => {
        setStreetValue("456 Elm St");
        rerender();
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
});
