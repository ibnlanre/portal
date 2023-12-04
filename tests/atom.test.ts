import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi, expectTypeOf, afterEach } from "vitest";

import { atom } from "@/atom";

describe("atom", () => {
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
  const states = [0, 0, 0, 1, 0];
  let currentStateIndex = 0;
  let currentState = states.at(currentStateIndex)!;

  afterEach(() => {
    currentState = states.at(++currentStateIndex)!;
  });

  const use = vi.fn((value, dep: number) => {});
  const numberAtom = atom({
    state: 4,
    events: {
      use,
    },
  });

  test("should not run the use method if enabled is false", () => {
    renderHook(() => {
      numberAtom.use({
        enabled: false,
        useArgs: [currentState],
      });
    });

    expect(currentState).toBe(0);
    expect(use).not.toHaveBeenCalled();
  });

  test("should run the use method if enabled is true", () => {
    renderHook(() => {
      numberAtom.use({
        useArgs: [currentState],
      });
    });

    expect(currentState).toBe(0);
    expect(use).toHaveBeenCalledOnce();
  });

  test("should not rerun the use method if the argument is the same", () => {
    renderHook(() => {
      numberAtom.use({
        useArgs: [currentState],
      });
    });

    expect(currentState).toBe(0);
    expect(use).toHaveBeenCalledTimes(1);
  });

  test("should rerun the use method if the state changes to a new value", () => {
    renderHook(() => {
      numberAtom.use({
        useArgs: [currentState],
      });
    });

    expect(currentState).toBe(1);
    expect(use).toHaveBeenCalledTimes(2);
  });

  test("should run the use method if the state changes to a previous value", () => {
    renderHook(() => {
      numberAtom.use({
        useArgs: [currentState],
      });
    });

    expect(currentState).toBe(0);
    expect(use).toHaveBeenCalledTimes(3);
  });
});
