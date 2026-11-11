import { describe, expect, it, vi } from "vitest";

import { batch } from "@/create-store/functions/helpers/batch";
import { primitive } from "@/create-store/functions/library/primitive";

import { composite } from "./index";

class Money {
  constructor(public cents: number) {}
}

describe("composite members", () => {
  it("makes a leaf of a scalar, array, null, undefined, Date, Map, Set, class and plain object", () => {
    const date = new Date(0);
    const map = new Map([["k", 1]]);
    const set = new Set([1]);
    const money = new Money(5);
    const object = { deep: { x: 1 } };
    const store = composite({
      array: [1, 2],
      date,
      map,
      money,
      none: null,
      object,
      scalar: 1,
      set,
      unset: undefined,
    });
    expect(store.scalar.$get()).toBe(1);
    expect(store.array.$get()).toEqual([1, 2]);
    expect(store.none.$get()).toBeNull();
    expect(store.unset.$get()).toBeUndefined();
    expect(store.date.$get()).toBe(date);
    expect(store.map.$get()).toBe(map);
    expect(store.set.$get()).toBe(set);
    expect(store.money.$get()).toBe(money);
    expect(store.object.$get()).toBe(object);
    expect(Object.keys(store.object)).toEqual([]);
  });

  it("keeps a store as the same object, as a branch", () => {
    const theme = primitive("light");
    const cart = composite({ items: primitive<string[]>([]) });
    const store = composite({ cart, theme });
    expect(store.theme).toBe(theme);
    expect(store.cart).toBe(cart);
    theme.$set("dark");
    expect(store.$get().theme).toBe("dark");
  });

  it("exposes a function as a method, as written, and not as state", () => {
    const hello = vi.fn(() => "hi");
    const store = composite({ hello, n: 1 });
    expect(store.hello).toBe(hello);
    expect(store.$get()).toEqual({ n: 1 });
  });

  it("ignores symbol keys", () => {
    const hidden = Symbol("hidden");
    const store = composite({ [hidden]: 1, shown: 2 });
    expect(store.$get()).toEqual({ shown: 2 });
    expect(Reflect.ownKeys(store)).not.toContain(hidden);
  });

  it("throws for a reserved key", () => {
    for (const key of [
      "$get",
      "$use",
      "$set",
      "$subscribe",
      "$reset",
      "$dispose",
      "$onDispose",
    ]) {
      expect(() => composite({ [key]: 1 })).toThrow(/reserved/);
    }
  });

  it("is frozen: assignment to a member does not replace it", () => {
    const store = composite({ n: 1 });
    expect(() => {
      (store as { n: unknown }).n = 2;
    }).toThrow();
    expect(store.n.$get()).toBe(1);
  });
});

describe("composite connection", () => {
  it("shares a store: the same object in two composites, and a write shows in both", () => {
    const shared = composite({ n: 1 });
    const c = composite({ shared });
    const d = composite({ other: primitive("x"), shared });

    expect(c.shared).toBe(shared);
    expect(d.shared).toBe(shared);

    const heardC = vi.fn();
    const heardD = vi.fn();
    c.$subscribe(heardC, { immediate: false });
    d.$subscribe(heardD, { immediate: false });

    c.shared.n.$set(2);

    expect(c.$get()).toEqual({ shared: { n: 2 } });
    expect(d.$get()).toEqual({ other: "x", shared: { n: 2 } });
    expect(heardC).toHaveBeenCalledTimes(1);
    expect(heardD).toHaveBeenCalledTimes(1);

    shared.n.$set(3);
    expect(c.shared.n.$get()).toBe(3);
    expect(d.$get().shared.n).toBe(3);
  });

  it("allows the same store twice in one shape", () => {
    const shared = primitive(1);
    const store = composite({ a: shared, b: shared });
    shared.$set(2);
    expect(store.$get()).toEqual({ a: 2, b: 2 });
  });

  it("can wrap one shape of stores twice, without copying", () => {
    const shape = { x: primitive(1) };
    const a = composite(shape);
    const b = composite(shape);
    expect(a.x).toBe(shape.x);
    expect(b.x).toBe(shape.x);
    shape.x.$set(2);
    expect(a.$get()).toEqual({ x: 2 });
    expect(b.$get()).toEqual({ x: 2 });
  });

  it("calls a subscriber once per outermost write along several paths (a diamond)", () => {
    const a = primitive(1);
    const b = composite({ a });
    const d = composite({ a, b });
    const heard = vi.fn();
    const heardB = vi.fn();
    d.$subscribe(heard, { immediate: false });
    b.$subscribe(heardB, { immediate: false });

    a.$set(2);

    expect(heard).toHaveBeenCalledTimes(1);
    expect(heard).toHaveBeenCalledWith({ a: 2, b: { a: 2 } });
    expect(heardB).toHaveBeenCalledTimes(1);

    d.$set({ a: 3, b: { a: 3 } });
    expect(heard).toHaveBeenCalledTimes(2);
    expect(heardB).toHaveBeenCalledTimes(2);
  });

  it("disposing a composite disposes its own leaves, unsubscribes, and leaves connected stores alive", () => {
    const shared = primitive(1);
    const store = composite({ leaf: 5, shared });
    const other = composite({ shared });
    const cleanup = vi.fn();
    store.leaf.$onDispose(cleanup);
    const heard = vi.fn();
    store.$subscribe(heard, { immediate: false });

    store.$dispose();
    store.$dispose();

    expect(cleanup).toHaveBeenCalledTimes(1);
    shared.$set(2);
    expect(shared.$get()).toBe(2);
    expect(other.$get()).toEqual({ shared: 2 });
    expect(heard).not.toHaveBeenCalled();
    expect(store.$get()).toEqual({ leaf: 5, shared: 1 });
    store.leaf.$set(9);
    expect(store.leaf.$get()).toBe(5);
  });

  it("does not dispose a store it was handed, even one made inline in the shape", () => {
    const cleanup = vi.fn();
    const store = composite({ inline: composite({ n: 1 }) });
    store.inline.$onDispose(cleanup);
    store.$dispose();
    expect(cleanup).not.toHaveBeenCalled();
    store.inline.n.$set(2);
    expect(store.inline.n.$get()).toBe(2);
    store.inline.$dispose();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("disposing a shared store leaves every holder able to read its last value", () => {
    const shared = composite({ n: 1 });
    const c = composite({ shared });
    const d = composite({ shared });
    const heardC = vi.fn();
    c.$subscribe(heardC, { immediate: false });

    shared.$dispose();

    expect(c.$get()).toEqual({ shared: { n: 1 } });
    expect(d.$get()).toEqual({ shared: { n: 1 } });
    shared.n.$set(9);
    c.$set({ shared: { n: 9 } });
    expect(c.$get()).toEqual({ shared: { n: 1 } });
    expect(heardC).not.toHaveBeenCalledWith({ shared: { n: 9 } });
  });

  it("passes set and reset through to a shared branch", () => {
    const shared = composite({ a: 1, b: 2 });
    const c = composite({ keep: 0, shared });
    const d = composite({ shared });

    c.$set({ keep: 1, shared: { a: 5 } });
    expect(d.$get()).toEqual({ shared: { a: 5, b: 2 } });

    c.$reset();
    expect(shared.$get()).toEqual({ a: 1, b: 2 });
    expect(d.$get()).toEqual({ shared: { a: 1, b: 2 } });
  });

  it("merges a partial state into branches, leaving the others", () => {
    const store = composite({
      a: primitive(1),
      user: composite({ age: 1, name: "A" }),
    });
    store.$set({ user: { name: "B" } });
    expect(store.$get()).toEqual({ a: 1, user: { age: 1, name: "B" } });
  });

  it("replaces a leaf holding an object whole", () => {
    const store = composite({
      settings: { a: 1, b: 2 } as { a?: number; b?: number },
    });
    store.$set({ settings: { a: 3 } });
    expect(store.settings.$get()).toEqual({ a: 3 });
  });

  it("recurses only through declared composites, and swaps a primitive branch whole", () => {
    const store = composite({
      loose: { a: 1, b: 2 } as { a?: number; b?: number },
      user: composite({ age: 1, name: "A" }),
    });
    store.$set({ loose: { a: 9 }, user: { name: "Q" } });
    expect(store.$get()).toEqual({
      loose: { a: 9 },
      user: { age: 1, name: "Q" },
    });
  });

  it("replaces everything with reset then set, delivered once", () => {
    const store = composite({
      a: 1,
      b: 2,
      user: composite({ age: 1, name: "A" }),
    });
    store.$set({ a: 5, b: 6, user: { age: 7, name: "Z" } });
    const heard = vi.fn();
    const user = vi.fn();
    store.$subscribe(heard, { immediate: false });
    store.user.$subscribe(user, { immediate: false });

    batch(() => {
      store.$reset();
      store.$set({ a: 9, user: { name: "Q" } });
    });

    expect(store.$get()).toEqual({ a: 9, b: 2, user: { age: 1, name: "Q" } });
    expect(heard).toHaveBeenCalledTimes(1);
    expect(user).toHaveBeenCalledTimes(1);
    expect(heard).toHaveBeenCalledWith({
      a: 9,
      b: 2,
      user: { age: 1, name: "Q" },
    });
  });

  it("never drops declared keys, and ignores undeclared ones", () => {
    const store = composite({ a: 1 });
    store.$set({ a: 2, extra: 3 } as never);
    expect(store.$get()).toEqual({ a: 2 });
  });

  it("applies an updater to the current state", () => {
    const store = composite({ n: 1 });
    store.$set((state) => ({ n: state.n + 1 }));
    expect(store.n.$get()).toBe(2);
  });

  it("resets every branch", () => {
    const store = composite({ inner: composite({ x: 1 }), n: 1 });
    store.$set({ inner: { x: 5 }, n: 5 });
    store.$reset();
    expect(store.$get()).toEqual({ inner: { x: 1 }, n: 1 });
  });

  it("keeps $get stable by identity between changes, and shares untouched subtrees", () => {
    const store = composite({
      left: composite({ value: 1 }),
      right: composite({ value: 1 }),
    });
    const first = store.$get();
    expect(store.$get()).toBe(first);

    store.left.value.$set(2);
    const second = store.$get();
    expect(second).not.toBe(first);
    expect(second.right).toBe(first.right);
    expect(second.left).not.toBe(first.left);

    store.left.value.$set(2);
    expect(store.$get()).toBe(second);
  });
});

describe("composite notification", () => {
  it("delivers one notification per outermost write that touches several branches", () => {
    const store = composite({ a: 1, b: 1, inner: composite({ c: 1 }) });
    const root = vi.fn();
    const inner = vi.fn();
    store.$subscribe(root, { immediate: false });
    store.inner.$subscribe(inner, { immediate: false });

    store.$set({ a: 2, b: 2, inner: { c: 2 } });

    expect(root).toHaveBeenCalledTimes(1);
    expect(inner).toHaveBeenCalledTimes(1);
  });

  it("tells a parent about a descendant change, and a branch only about itself and below", () => {
    const store = composite({
      left: composite({ value: 1 }),
      right: composite({ value: 1 }),
    });
    const root = vi.fn();
    const left = vi.fn();
    const right = vi.fn();
    const leaf = vi.fn();
    store.$subscribe(root, { immediate: false });
    store.left.$subscribe(left, { immediate: false });
    store.right.$subscribe(right, { immediate: false });
    store.left.value.$subscribe(leaf, { immediate: false });

    store.left.value.$set(2);

    expect(root).toHaveBeenCalledTimes(1);
    expect(left).toHaveBeenCalledTimes(1);
    expect(leaf).toHaveBeenCalledWith(2);
    expect(right).not.toHaveBeenCalled();
  });

  it("notifies the written composite's descendants even for an equal write", () => {
    const store = composite({ a: 1 });
    const leaf = vi.fn();
    store.a.$subscribe(leaf, { immediate: false });
    store.$set({ a: 1 });
    expect(leaf).toHaveBeenCalledTimes(1);
  });

  it("never lets a subscriber see a half-applied write", () => {
    const store = composite({ a: 1, b: 1 });
    const seen: Array<[number, number]> = [];
    store.a.$subscribe(() => seen.push([store.a.$get(), store.b.$get()]), {
      immediate: false,
    });
    store.b.$subscribe(() => seen.push([store.a.$get(), store.b.$get()]), {
      immediate: false,
    });
    store.$set({ a: 2, b: 2 });
    expect(seen).toEqual([
      [2, 2],
      [2, 2],
    ]);
  });

  it("delivers a write made by a subscriber after the first is fully delivered", () => {
    const store = composite({ n: 0 });
    const order: string[] = [];
    store.$subscribe(
      (state) => {
        order.push(`first:${state.n}`);
        if (state.n === 1) store.n.$set(2);
      },
      { immediate: false }
    );
    store.$subscribe((state) => order.push(`second:${state.n}`), {
      immediate: false,
    });
    store.n.$set(1);
    expect(order).toEqual(["first:1", "second:1", "first:2", "second:2"]);
  });

  it("notifies when a cleanup writes to another store during a dispose", () => {
    const other = primitive(0);
    const heard = vi.fn();
    other.$subscribe(heard, { immediate: false });
    const store = composite({ n: 1 });
    store.$onDispose(() => other.$set(1));
    store.n.$dispose();
    store.$dispose();
    expect(heard).toHaveBeenCalledWith(1);
  });
});
