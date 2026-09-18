import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createStore } from "../index";

describe("store lifetime contract", () => {
  it("isolates separately created stores", () => {
    const initial = { count: 0 };
    const a = createStore(initial);
    const b = createStore(initial);
    a.count.$set(1);
    expect(b.count.$get()).toBe(0);
  });
  it("stops invoking selectors after unmount and reconnects to the latest state", () => {
    const store = createStore({ count: 0 });
    const select = vi.fn((s: { count: number }) => s.count);
    const first = renderHook(() => store.$use(select)[0]);
    first.unmount();
    select.mockClear();
    act(() => store.count.$set(1));
    expect(select).not.toHaveBeenCalled();
    const second = renderHook(() => store.$use(select)[0]);
    expect(second.result.current).toBe(1);
  });
  it("switches subscriptions and setters when a component receives another store", () => {
    const a = createStore({ count: 1 });
    const b = createStore({ count: 2 });
    const hook = renderHook(({ store }) => store.count.$use(), {
      initialProps: { store: a },
    });
    hook.rerender({ store: b });
    expect(hook.result.current[0]).toBe(2);
    act(() => hook.result.current[1](3));
    expect(b.count.$get()).toBe(3);
    expect(a.count.$get()).toBe(1);
    act(() => a.count.$set(9));
    expect(hook.result.current[0]).toBe(3);
  });
  it("one subscriber cleanup does not detach other subscribers", () => {
    const store = createStore(0);
    const a = vi.fn();
    const b = vi.fn();
    const off = store.$subscribe(a, false);
    store.$subscribe(b, false);
    off();
    off();
    store.$set(1);
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledExactlyOnceWith(1);
  });
});
