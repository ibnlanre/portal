import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi, expectTypeOf } from "vitest";
import { useState } from "react";

import { atom } from "@/atom";

describe.todo("atom", () => {
  const initialState = 0;
  const numberAtom = atom({ state: initialState });

  test("should return the state and setState", () => {
    const { result } = renderHook(() => numberAtom.use());

    const [state, setState] = result.current;

    expect(setState).toBeInstanceOf(Function);
    expectTypeOf(state).toBeNumber();
    expect(state).toBe(0);
  });

  test("should update the state", () => {
    const { result } = renderHook(() => numberAtom.use());

    const [, setState] = result.current;
    act(() => {
      setState(10);
    });

    const [newState] = result.current;
    expect(newState).toBe(10);
  });
});

describe("atom.use", () => {
  const initialState = 0;
  const use = vi.fn((value, dep: number) => {
    dep++;
  });

  const numberAtom = atom({
    state: initialState,
    events: {
      use,
    },
  });

  test("should not run the use method if enabled is false", () => {
    const { result } = renderHook(() => useState(initialState));

    renderHook(() => {
      numberAtom.use({
        enabled: Boolean(result.current[0]),
        useArgs: [result.current[0]],
      });
    });

    expect(use).not.toHaveBeenCalled();
  });

  test("should run the use method if enabled is true", () => {
    const { result } = renderHook(() => useState(initialState));
    renderHook(() => {
      numberAtom.use({
        useArgs: [result.current[0]],
      });
    });

    expect(use).toHaveBeenCalledOnce();
  });

  test("should not rerun the use method if the argument is the same", () => {
    const { result } = renderHook(() => useState(initialState));
    renderHook(() => {
      numberAtom.use({
        useArgs: [result.current[0]],
      });
    });

    expect(use).toHaveBeenCalledTimes(1);
  });

  test("should rerun the use method if the state changes", () => {
    const { result } = renderHook(() => useState(initialState));
    const { rerender } = renderHook(() => {
      numberAtom.use({
        useArgs: [result.current[0]],
      });
    });

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    rerender();
    expect(use).toHaveBeenCalledTimes(2);
  });

  test("should run the use method if the state changes to a previous value", () => {
    const initialStateIncrement = 1 + initialState;

    const { result } = renderHook(() => useState(initialStateIncrement));
    const { rerender } = renderHook(() => {
      numberAtom.use({
        useArgs: [result.current[0]],
      });
    });

    act(() => {
      result.current[1]((prev) => prev - 1);
    });

    rerender();
    expect(use).toHaveBeenCalledTimes(3);
  });
});
