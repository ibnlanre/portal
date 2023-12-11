import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi, expectTypeOf } from "vitest";

import { atom } from "@/atom"

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

describe.concurrent("atom.use", () => {
  const use = vi.fn((value, dep: number) => {});
  const numberAtom = atom({
    state: 4,
    events: {
      use,
    },
  });

  test.each([
    ["should not run the use method if enabled is false", 0, 0, false],
    ["should run the use method if enabled is true", 0, 1, true],
    ["should not rerun the use method if the argument is the same", 0, 1, true],
    [
      "should rerun the use method if the state changes to a new value",
      1,
      2,
      true,
    ],
    [
      "should run the use method if the state changes to a previous value",
      0,
      3,
      true,
    ],
  ])(`%s`, (condition, state, expected, enabled) => {
    renderHook(() => {
      numberAtom.use({
        useArgs: [state],
        enabled,
      });
    });
    expect(use).toHaveBeenCalledTimes(expected);
  });
});
