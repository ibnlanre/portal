import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { nodeOf } from "@/create-store/functions/helpers/nodes";
import { composite } from "@/create-store/functions/library/composite";
import { primitive } from "@/create-store/functions/library/primitive";

type Organisation = { name: string };

function organisations() {
  const stores: Record<string, ReturnType<typeof make>> = {
    a: make("Acme"),
    b: make("Beta"),
  };
  function make(name: string) {
    return composite({ name, size: primitive(1) });
  }
  return stores;
}

const listeners = (store: object) => nodeOf(store)!.listeners.size;

describe("$use across a store whose identity changes between renders", () => {
  it("reads the new store after a rerender", () => {
    const stores = organisations();
    const { rerender, result } = renderHook(
      ({ id }) => stores[id].$use((state: Organisation) => state.name),
      { initialProps: { id: "a" } }
    );
    expect(result.current[0]).toBe("Acme");

    rerender({ id: "b" });
    expect(result.current[0]).toBe("Beta");
  });

  it("subscribes to the new store and unsubscribes from the old one", () => {
    const stores = organisations();
    const { rerender, unmount } = renderHook(
      ({ id }) => stores[id].$use((state: Organisation) => state.name),
      { initialProps: { id: "a" } }
    );
    expect(listeners(stores.a)).toBe(1);
    expect(listeners(stores.b)).toBe(0);

    rerender({ id: "b" });
    expect(listeners(stores.a)).toBe(0);
    expect(listeners(stores.b)).toBe(1);

    unmount();
    expect(listeners(stores.b)).toBe(0);
  });

  it("a write to the old store no longer renders; a write to the new one does", () => {
    const stores = organisations();
    let renders = 0;
    const { rerender, result } = renderHook(
      ({ id }) => {
        renders++;
        return stores[id].$use((state: Organisation) => state.name);
      },
      { initialProps: { id: "a" } }
    );
    rerender({ id: "b" });
    const settled = renders;

    act(() => stores.a.name.$set("Acme 2"));
    expect(renders).toBe(settled);
    expect(result.current[0]).toBe("Beta");

    act(() => stores.b.name.$set("Beta 2"));
    expect(result.current[0]).toBe("Beta 2");
    expect(renders).toBeGreaterThan(settled);
  });

  it("re-evaluates the selector when its dependencies change", () => {
    const stores = organisations();
    const { rerender, result } = renderHook(
      ({ suffix }) =>
        stores.a.$use((state: Organisation) => state.name + suffix, [suffix]),
      { initialProps: { suffix: "!" } }
    );
    expect(result.current[0]).toBe("Acme!");
    rerender({ suffix: "?" });
    expect(result.current[0]).toBe("Acme?");
  });

  it("the setter returned writes to the store of the current render", () => {
    const stores = organisations();
    const { rerender, result } = renderHook(({ id }) => stores[id].$use(), {
      initialProps: { id: "a" },
    });
    rerender({ id: "b" });
    act(() => result.current[1]({ name: "Beta set" }));
    expect(stores.b.$get().name).toBe("Beta set");
    expect(stores.a.$get().name).toBe("Acme");
  });
});
