import { renderHook, act } from "@testing-library/react";
import { describe, afterEach, it, expect } from "vitest";

import { makeUsePortal } from "@/component";

describe("usePortal.local", () => {
  const store = {
    foo: "baz",
  };
  const usePortal = makeUsePortal(store);

  afterEach(() => {
    localStorage.clear();
  });

  it("should set initial state from cookie", () => {
    const { result } = renderHook(() => usePortal.local("foo"));

    const [state] = result.current;
    expect(state).toEqual("baz");
  });

  it("should set cookie on state change", () => {
    const { result } = renderHook(() => usePortal.local("foo"));
    const [, setState] = result.current;

    act(() => {
      setState("qux");
    });

    const [newState] = result.current;

    expect(newState).toEqual("qux");
    expect(localStorage.getItem("foo")).toBe(JSON.stringify("qux"));
  });
});
