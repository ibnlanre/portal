import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createStore } from "../index";

describe("selector subscription contract", () => {
  it("shares the imperative snapshot with hooks and selectors across root merges", () => {
    const store = createStore({ user: { name: "A" }, count: 0 });
    let renders = 0;
    const hook = renderHook(() => {
      renders++;
      return store.$use((s) => {
        expect(s).toBe(store.$get());
        return s.user;
      })[0];
    });
    const before = store.user.$get();
    const initial = renders;
    expect(hook.result.current).toBe(before);
    act(() => store.$set({ count: 1 }));
    expect(renders).toBe(initial);
    expect(hook.result.current).toBe(before);
    act(() => store.$set({ user: { name: "A" } }));
    expect(renders).toBe(initial);
    act(() => store.$set({ user: { name: "B" } }));
    expect(renders).toBe(initial + 1);
    expect(hook.result.current).toBe(store.user.$get());
  });

  it("uses the same snapshot for unselected hooks and imperative reads", () => {
    const store = createStore([1, 2]);
    const hook = renderHook(() => store.$use()[0]);
    expect(hook.result.current).toBe(store.$get());
    act(() => store.$set([3]));
    expect(hook.result.current).toBe(store.$get());
  });

  it("renders only when the selected snapshot changes", () => {
    const store = createStore({ count: 0, name: "A" });
    let renders = 0;
    const hook = renderHook(() => {
      renders++;
      return store.$use((s) => s.count);
    });
    const initial = renders;
    act(() => store.name.$set("B"));
    expect(renders).toBe(initial);
    act(() => store.count.$set(1));
    expect(renders).toBe(initial + 1);
    expect(hook.result.current[0]).toBe(1);
  });

  it("preserves an unchanged selected object across an unrelated leaf write", () => {
    const store = createStore({ user: { name: "A" }, count: 0 });
    let renders = 0;
    const hook = renderHook(() => {
      renders++;
      return store.$use((s) => s.user)[0];
    });
    const original = hook.result.current;
    const initial = renders;
    act(() => store.count.$set(1));
    expect(renders).toBe(initial);
    expect(hook.result.current).toBe(original);
    act(() => store.user.name.$set("B"));
    expect(hook.result.current).toEqual({ name: "B" });
    expect(renders).toBe(initial + 1);
  });

  it("gates focused branches and still observes ancestor writes", () => {
    const store = createStore({ user: { name: "A", age: 20 } });
    let renders = 0;
    const hook = renderHook(() => {
      renders++;
      return store.user.$use((s) => s.name)[0];
    });
    const initial = renders;
    act(() => store.user.age.$set(21));
    expect(renders).toBe(initial);
    act(() => store.$set({ user: { name: "B" } }));
    expect(hook.result.current).toBe("B");
    expect(renders).toBe(initial + 1);
  });

  it("gates primitive/array stores by the selection", () => {
    const store = createStore([1, 2]);
    let renders = 0;
    const hook = renderHook(() => {
      renders++;
      return store.$use((s) => s.length)[0];
    });
    const initial = renders;
    act(() => store.$set([3, 4]));
    expect(renders).toBe(initial);
    act(() => store.$set([1]));
    expect(hook.result.current).toBe(1);
  });

  it("refreshes selectors when captured props change", () => {
    const store = createStore({ value: 2 });
    const hook = renderHook(
      ({ multiplier }) =>
        store.$use((s) => s.value * multiplier, [multiplier])[0],
      { initialProps: { multiplier: 2 } }
    );
    hook.rerender({ multiplier: 3 });
    expect(hook.result.current).toBe(6);
    act(() => store.value.$set(3));
    expect(hook.result.current).toBe(9);
  });

  it("caches allocating selections between writes without looping", () => {
    const store = createStore({ value: 1 });
    const hook = renderHook(
      () => store.$use((s) => ({ doubled: s.value * 2 }))[0]
    );
    expect(hook.result.current).toEqual({ doubled: 2 });
    act(() => store.value.$set(2));
    expect(hook.result.current).toEqual({ doubled: 4 });
  });
});
