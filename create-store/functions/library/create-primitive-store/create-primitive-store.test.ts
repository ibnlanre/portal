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

    const updatedStateValue = store.$get();
    expect(updatedStateValue).toBe("new value");

    const upperCaseValue = store.$get((value) => value.toUpperCase());
    expect(upperCaseValue).toBe("NEW VALUE");
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
});
