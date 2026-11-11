import { act, render, renderHook } from "@testing-library/react";
import { StrictMode } from "react";
import { describe, expect, it, vi } from "vitest";

import { primitive } from "@/create-store/functions/library/primitive";

import { composite } from "./index";

describe("falsy and empty writes through a composite", () => {
  it("keeps the key for null, undefined, 0, empty string and false", () => {
    const store = composite({
      flag: true as boolean,
      none: "x" as null | string,
      text: "x",
      total: 5,
      undef: 1 as number | undefined,
    });
    store.$set({
      flag: false,
      none: null,
      text: "",
      total: 0,
      undef: undefined,
    });
    expect(store.$get()).toEqual({
      flag: false,
      none: null,
      text: "",
      total: 0,
      undef: undefined,
    });
    expect(Object.keys(store.$get())).toEqual([
      "flag",
      "none",
      "text",
      "total",
      "undef",
    ]);
  });

  it("notifies the written store and its descendants for an empty set", () => {
    const store = composite({ inner: composite({ n: 1 }), n: 1 });
    const root = vi.fn();
    const inner = vi.fn();
    const leaf = vi.fn();
    store.$subscribe(root, { immediate: false });
    store.inner.$subscribe(inner, { immediate: false });
    store.inner.n.$subscribe(leaf, { immediate: false });

    store.$set({});

    expect(root).toHaveBeenCalledTimes(1);
    expect(inner).toHaveBeenCalledTimes(1);
    expect(leaf).toHaveBeenCalledTimes(1);
  });

  it("tells root, parent and leaf, and not a sibling, about a leaf write", () => {
    const store = composite({
      left: composite({ value: 1 }),
      right: composite({ value: 1 }),
    });
    const heard = {
      leaf: vi.fn(),
      left: vi.fn(),
      right: vi.fn(),
      rightLeaf: vi.fn(),
      root: vi.fn(),
    };
    store.$subscribe(heard.root, { immediate: false });
    store.left.$subscribe(heard.left, { immediate: false });
    store.left.value.$subscribe(heard.leaf, { immediate: false });
    store.right.$subscribe(heard.right, { immediate: false });
    store.right.value.$subscribe(heard.rightLeaf, { immediate: false });

    store.left.value.$set(2);

    expect(heard.root).toHaveBeenCalledTimes(1);
    expect(heard.left).toHaveBeenCalledTimes(1);
    expect(heard.leaf).toHaveBeenCalledTimes(1);
    expect(heard.right).not.toHaveBeenCalled();
    expect(heard.rightLeaf).not.toHaveBeenCalled();
  });

  it("tells the root and the branch, and a descendant, about a parent-branch write", () => {
    const store = composite({
      left: composite({ value: 1 }),
      right: composite({ value: 1 }),
    });
    const root = vi.fn();
    const leaf = vi.fn();
    const right = vi.fn();
    store.$subscribe(root, { immediate: false });
    store.left.value.$subscribe(leaf, { immediate: false });
    store.right.$subscribe(right, { immediate: false });

    store.left.$set({ value: 5 });

    expect(root).toHaveBeenCalledTimes(1);
    expect(leaf).toHaveBeenCalledWith(5);
    expect(right).not.toHaveBeenCalled();
  });
});

describe("methods", () => {
  it("survives $set and $reset", () => {
    const store = composite({
      double() {
        return store.n.$get() * 2;
      },
      n: 1,
    });
    const method = store.double;
    store.$set({ n: 4 });
    expect(store.double).toBe(method);
    expect(store.double()).toBe(8);
    store.$reset();
    expect(store.double).toBe(method);
    expect(store.double()).toBe(2);
  });

  it("writes through a branch of its own composite, as in the spec example", () => {
    type Line = { sku: string };
    const app = composite({
      addToCart(line: Line) {
        app.cart.items.$set((items) => [...items, line]);
      },
      cart: composite({ items: primitive<Line[]>([]) }),
    });
    app.addToCart({ sku: "a" });
    app.addToCart({ sku: "b" });
    expect(app.cart.items.$get()).toEqual([{ sku: "a" }, { sku: "b" }]);
    expect(app.$get()).toEqual({
      cart: { items: [{ sku: "a" }, { sku: "b" }] },
    });
  });

  it("can be called from a component", () => {
    const app = composite({
      bump() {
        app.count.$set((n) => n + 1);
      },
      count: 0,
    });
    function Counter() {
      const [count] = app.count.$use();
      return <button onClick={app.bump}>{count}</button>;
    }
    const view = render(<Counter />);
    act(() => view.getByRole("button").click());
    expect(view.getByRole("button").textContent).toBe("1");
  });
});

describe("react with composites", () => {
  it("keeps two components on one store in sync", () => {
    const store = primitive(0);
    function Show({ id }: { id: string }) {
      const [value] = store.$use();
      return <span data-testid={id}>{value}</span>;
    }
    const view = render(
      <>
        <Show id="a" />
        <Show id="b" />
      </>
    );
    act(() => store.$set(3));
    expect(view.getByTestId("a").textContent).toBe("3");
    expect(view.getByTestId("b").textContent).toBe("3");
  });

  it("accepts a partial from a composite's $use setter", () => {
    const store = composite({ a: 1, b: 1 });
    const { result } = renderHook(() => store.$use());
    act(() => result.current[1]({ a: 5 }));
    expect(result.current[0]).toEqual({ a: 5, b: 1 });
  });

  it("renders $use in StrictMode without warning", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const store = composite({ count: 0 });
    function Count() {
      const [count] = store.count.$use();
      return <span>{count}</span>;
    }
    const view = render(
      <StrictMode>
        <Count />
      </StrictMode>
    );
    act(() => store.count.$set(1));
    expect(view.container.textContent).toBe("1");
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
