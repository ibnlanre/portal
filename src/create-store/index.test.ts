import { renderHook } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it, vi } from "vitest";

import { createStore } from "./index";

describe("createStore", () => {
  it("should create a primitive store when initial state is undefined", () => {
    const store = createStore();
    expect(store).toBeDefined();
  });

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

    const streetValue = store.$get("location.address.street");
    expect(streetValue).toBe("123 Main St");
  });

  it("should set a primitive state value", () => {
    const initialState = "value";
    const store = createStore(initialState);

    const setStateValue = store.$set();
    setStateValue("new value");

    const updatedStateValue = store.$get();
    expect(updatedStateValue).toBe("new value");
  });

  it("should set the state value with .$set", () => {
    const initialState = { key: "value" };
    const store = createStore(initialState);

    const setStateValue = store.$set();
    setStateValue({ key: "new value" });

    const updatedStateValue = store.$get();
    expect(updatedStateValue).toEqual({ key: "new value" });
  });

  it("should set a nested state value with .$set", () => {
    const initialState = { location: { address: { street: "123 Main St" } } };
    const store = createStore(initialState);

    const setStreetValue = store.$set("location.address.street");
    setStreetValue("456 Elm St");

    const updatedStreetValue = store.$get("location.address.street");
    expect(updatedStreetValue).toBe("456 Elm St");
  });

  it("should subscribe to state changes", () => {
    const initialState = { key: "value" };
    const store = createStore(initialState);

    const subscriber = vi.fn();
    store.$sub(subscriber);

    const setStateValue = store.$set();
    setStateValue({ key: "new value" });

    expect(subscriber).toHaveBeenCalledWith({ key: "new value" });
  });

  it("should initialize state from Storage", () => {
    const initialState = { key: "value" };
    const getStorageState = vi.fn(() => initialState);
    const setStorageState = vi.fn();

    const store = createStore(getStorageState);
    store.$sub(setStorageState);

    const stateValue = store.$get();
    expect(stateValue).toEqual(initialState);
    expect(getStorageState).toHaveBeenCalled();
  });

  it("should update Storage when state changes", () => {
    const initialState = { key: "value" };
    const getStorageState = vi.fn(() => initialState);
    const setStorageState = vi.fn();

    const store = createStore(getStorageState);
    store.$sub(setStorageState);

    const setStateValue = store.$set();
    setStateValue({ key: "new value" });

    expect(setStorageState).toHaveBeenCalledWith({ key: "new value" });
  });

  it("should use the state value in a React component", () => {
    const initialState = { key: "value" };

    const store = createStore(initialState);
    expect(store).toBeDefined();

    const { result } = renderHook(() => store.$use());
    const [stateValue] = result.current;

    expect(stateValue).toEqual(initialState);
  });

  it("should update the state value in a React component", () => {
    const initialState = { key: "value" };
    const store = createStore(initialState);

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
    const store = createStore(initialState);

    const { result } = renderHook(() => store.$use("location.address.street"));
    const [streetValue] = result.current;

    expect(streetValue).toBe("123 Main St");
  });

  it("should update a nested state value in a React component", () => {
    const initialState = { location: { address: { street: "123 Main St" } } };
    const store = createStore(initialState);

    const { result, rerender } = renderHook(() =>
      store.$use("location.address.street")
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
