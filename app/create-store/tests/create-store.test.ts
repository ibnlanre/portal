import { renderHook } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { createStore } from "../index";

type Placeholder = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

async function placeholder() {
  const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
  const data: Placeholder = await response.json();
  return data;
}

const placeholderValue = {
  userId: 1,
  id: 1,
  title: "delectus aut autem",
  completed: false,
};

const placeholderUpdatedValue = {
  userId: 3,
  id: 2,
  title: "fugiat veniam minus",
  completed: false,
};

describe("createStore", () => {
  describe("smoke tests", () => {
    it("should create a primitive store when initial state is undefined", () => {
      const store = createStore();

      expect(store).toBeDefined();
      expect(store.$get()).toBeUndefined();
    });

    it("should create a primitive store when initial state is a factory", async () => {
      const store = await createStore(placeholder);

      expect(store).toBeDefined();
      expect(store.$get()).toEqual(placeholderValue);
    });
  });

  describe(".$get", () => {
    it("should get a primitive state value", () => {
      const initialState = "value";
      const store = createStore(initialState);

      const stateValue = store.$get();
      expect(stateValue).toBe(initialState);
    });

    it("should get the state value with .$get", () => {
      const initialState = { key: "value" };
      const store = createStore(initialState);

      const stateValue = store.$get();
      expect(stateValue).toEqual(initialState);
    });

    it("should get a nested state value with .$get", () => {
      const initialState = { location: { address: { street: "123 Main St" } } };
      const store = createStore(initialState);

      const streetValue = store.location.address.street.$get();
      expect(streetValue).toBe("123 Main St");
    });

    it("should get the state value with .$get", async () => {
      const store = await createStore(placeholder);
      const stateValue = store.$get();

      expect(stateValue).toEqual(placeholderValue);
    });
  });

  describe(".$set", () => {
    it("should set a primitive state value", () => {
      const initialState = "value";
      const store = createStore(initialState);

      store.$set("new value");

      const updatedStateValue = store.$get();
      expect(updatedStateValue).toBe("new value");
    });

    it("should set the state value with .$set", () => {
      const initialState = { key: "value" };
      const store = createStore(initialState);

      store.$set({ key: "new value" });

      const updatedStateValue = store.$get();
      expect(updatedStateValue).toEqual({ key: "new value" });
    });

    it("should set a nested state value with .$set", () => {
      const initialState = { location: { address: { street: "123 Main St" } } };
      const store = createStore(initialState);

      store.location.address.street.$set("456 Elm St");

      const updatedStreetValue = store.location.address.street.$get();
      expect(updatedStreetValue).toBe("456 Elm St");

      const updatedStateValue = store.$get();
      expect(updatedStateValue).toEqual({
        location: { address: { street: "456 Elm St" } },
      });
    });

    it("should set a nested state value with .$set using a function", () => {
      const initialState = { location: { address: { street: "123 Main St" } } };
      const store = createStore(initialState);

      store.location.address.street.$set((street) => `${street} Suite 100`);

      const updatedStreetValue = store.location.address.street.$get();
      expect(updatedStreetValue).toBe("123 Main St Suite 100");
    });

    it("should set the state value with .$set", async () => {
      const store = await createStore(placeholder);
      store.$set(placeholderUpdatedValue);

      const stateValue = store.$get();
      expect(stateValue).toEqual(placeholderUpdatedValue);
    });
  });

  describe(".$sub", () => {
    it("should subscribe to state changes", () => {
      const initialState = { key: "value" };
      const store = createStore(initialState);
      const subscriber = vi.fn();

      store.$sub(subscriber);
      expect(subscriber).toHaveBeenCalledWith(initialState);

      store.$set({ key: "new value" });
      expect(subscriber).toHaveBeenCalledWith({ key: "new value" });
    });

    it("should initialize state from Storage", () => {
      const initialState = { key: "value" };
      const getStorageState = vi.fn(() => initialState);
      const setStorageState = vi.fn();

      const store = createStore(getStorageState);
      expect(getStorageState).toHaveBeenCalled();

      store.$sub(setStorageState);
      expect(setStorageState).toHaveBeenCalledWith(initialState);

      const stateValue = store.$get();
      expect(stateValue).toEqual(initialState);
    });

    it("should update Storage when state changes", () => {
      const initialState = { key: "value" };
      const getStorageState = vi.fn(() => initialState);
      const setStorageState = vi.fn();

      const store = createStore(getStorageState);
      store.$sub(setStorageState);

      store.$set({ key: "new value" });
      expect(setStorageState).toHaveBeenCalledWith({ key: "new value" });
    });
  });

  describe(".$use", () => {
    it("should use the state value in a React component", () => {
      const initialState = { key: "value" };

      const store = createStore(initialState);
      expect(store).toBeDefined();

      const { result } = renderHook(store.$use);
      const [stateValue] = result.current;

      expect(stateValue).toEqual(initialState);
    });

    it("should update the state value in a React component", () => {
      const initialState = { key: "value" };
      const store = createStore(initialState);

      const { result } = renderHook(store.$use);
      const [, setStateValue] = result.current;

      act(() => {
        setStateValue({ key: "new value" });
      });

      const [updatedStateValue] = result.current;
      expect(updatedStateValue).toEqual({ key: "new value" });
    });

    it("should use a nested state value in a React component", () => {
      const initialState = { location: { address: { street: "123 Main St" } } };
      const store = createStore(initialState);

      const { result } = renderHook(store.location.address.street.$use);
      const [streetValue] = result.current;

      expect(streetValue).toBe("123 Main St");
    });

    it("should update a nested state value in a React component", () => {
      const initialState = { location: { address: { street: "123 Main St" } } };
      const store = createStore(initialState);

      const { result, rerender } = renderHook(
        store.location.address.street.$use
      );
      const [, setStreetValue] = result.current;

      act(() => {
        setStreetValue("456 Elm St");
        rerender();
      });

      const [updatedStreetValue] = result.current;
      expect(updatedStreetValue).toBe("456 Elm St");
    });
  });
});
