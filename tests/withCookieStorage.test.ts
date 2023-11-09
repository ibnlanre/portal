import { renderHook, act } from "@testing-library/react";
import { describe, afterEach, it, expect } from "vitest";

import { usePortalWithCookieStorage } from "@/addons";
import { cookieStorage, createBuilder } from "@/component";

describe("usePortalWithCookieStorage", () => {
  const builder = createBuilder({
    foo: "qux",
  });

  afterEach(() => {
    cookieStorage.clear();
  });

  it("should set initial state from cookie", () => {
    cookieStorage.setItem("foo", "baz");
    const { result } = renderHook(() =>
      usePortalWithCookieStorage(builder, "foo")
    );
    const [state] = result.current;
    expect(state).toEqual("baz");
  });

  it("should set cookie on state change", () => {
    const { result } = renderHook(() =>
      usePortalWithCookieStorage(builder, "foo")
    );
    const [state, setState] = result.current;
    act(() => {
      setState("qux");
    });
    
    expect(state).toEqual("qux");
    expect(cookieStorage.getItem("foo")).toEqual("qux");
  });
});
