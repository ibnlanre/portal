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
});
