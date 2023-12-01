import { renderHook, act } from "@testing-library/react";
import { describe, test, expect } from "vitest";

import { atom } from "@/atom";

describe("atom", () => {
  test("should update the state", () => {
    const initialState = 0;
    const numberAtom = atom({ state: initialState });

    const { result } = renderHook(() => numberAtom.use());

    const [state, setState] = result.current;
    expect(state).toBe(0);

    act(() => {
      setState(10);
    });

    const [newState] = result.current;
    expect(newState).toBe(10);
  });
});
