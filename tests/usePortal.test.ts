import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { usePortal } from "@/component";

describe("usePortal", () => {
  const path = "is-open";
  const initialState = { isOpen: true };

  it("should return the portal state", () => {
    const { result } = renderHook(() => {
      return usePortal(path, {
        state: initialState,
      });
    });
    const [state] = result.current;
    expect(state).toMatchObject(initialState);
  });

  it("should update the portal state", () => {
    type State = typeof initialState;
    const { result } = renderHook(() => usePortal<State>(path));
    const [, setState] = result.current;

    act(() => {
      setState({ isOpen: false });
    });

    const [{ isOpen }] = result.current;
    expect(isOpen).toBe(false);
  });
});
