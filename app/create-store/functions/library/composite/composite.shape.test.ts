import { describe, expect, it, vi } from "vitest";

import { nodeOf } from "@/create-store/functions/helpers/nodes";
import { collection } from "@/create-store/functions/library/collection";
import { primitive } from "@/create-store/functions/library/primitive";

import { composite } from "./index";

describe("store shape integrity", () => {
  for (const [kind, make] of [
    ["primitive", () => primitive(1)],
    ["composite", () => composite({ a: 1 })],
    ["collection", () => collection((key: string) => primitive(key))],
  ] as const) {
    it(`${kind}: adding, deleting and defining a property throw`, () => {
      const store: any = make();
      expect(() => {
        store.extra = 1;
      }).toThrow(TypeError);
      expect(() => {
        delete store.$get;
      }).toThrow(TypeError);
      expect(() => Object.defineProperty(store, "extra", { value: 1 })).toThrow(
        TypeError
      );
      expect(Object.isFrozen(store)).toBe(true);
      expect("extra" in store).toBe(false);
    });
  }

  it("a composite shows its branches and methods as enumerable keys, and $ members as hidden", () => {
    const store = composite({
      branch: composite({ n: 1 }),
      leaf: 1,
      method() {},
    });
    expect(Object.keys(store)).toEqual(["branch", "leaf", "method"]);
    expect("$get" in store).toBe(true);
    expect("branch" in store).toBe(true);
    expect("missing" in store).toBe(false);

    const branch = Object.getOwnPropertyDescriptor(store, "branch")!;
    expect(branch.enumerable).toBe(true);
    expect(branch.writable).toBe(false);
    expect(branch.configurable).toBe(false);
    expect(branch.value).toBe(store.branch);

    const member = Object.getOwnPropertyDescriptor(store, "$get")!;
    expect(member.enumerable).toBe(false);
    expect(member.writable).toBe(false);
    expect(Object.keys(store)).not.toContain("$get");
  });

  it("a primitive and a collection show only their hidden members as keys", () => {
    expect(Object.keys(primitive(1))).toEqual([]);
    expect(Object.keys(collection((key: string) => primitive(key)))).toEqual(
      []
    );
  });
});

describe("composite lifetime", () => {
  it("after $dispose a write to a shared branch no longer reaches the composite", () => {
    const shared = primitive(1);
    const mine = composite({ shared });
    const other = composite({ shared });
    const heardMine = vi.fn();
    const heardOther = vi.fn();
    mine.$subscribe(heardMine, { immediate: false });
    other.$subscribe(heardOther, { immediate: false });

    expect(nodeOf(shared)!.holders.has(nodeOf(mine)!)).toBe(true);
    mine.$dispose();
    expect(nodeOf(shared)!.holders.has(nodeOf(mine)!)).toBe(false);
    expect(nodeOf(shared)!.holders.has(nodeOf(other)!)).toBe(true);

    shared.$set(2);

    expect(heardMine).not.toHaveBeenCalled();
    expect(heardOther).toHaveBeenCalledTimes(1);
    expect(mine.$get()).toEqual({ shared: 1 });
  });

  it("does not own a held collection or its entries", () => {
    const drafts = collection((key: string) => composite({ note: key }));
    const entry = drafts("a");
    const cleanup = vi.fn();
    entry.$onDispose(cleanup);
    const app = composite({ drafts });

    app.$dispose();

    expect(cleanup).not.toHaveBeenCalled();
    entry.note.$set("changed");
    expect(drafts("a").note.$get()).toBe("changed");
    drafts("b");
    expect(drafts.$keys()).toEqual(["a", "b"]);
  });

  it("does not own an inline composite or primitive; it is disposed through its own name", () => {
    const cleanup = vi.fn();
    const app = composite({
      cart: composite({ items: 0 }),
      count: primitive(0),
    });
    app.cart.$onDispose(cleanup);
    app.count.$onDispose(cleanup);

    app.$dispose();
    expect(cleanup).not.toHaveBeenCalled();

    app.cart.items.$set(1);
    expect(app.cart.items.$get()).toBe(1);
    app.cart.$dispose();
    app.count.$dispose();
    expect(cleanup).toHaveBeenCalledTimes(2);
  });

  it("owns the leaves it made from bare values", () => {
    const app = composite({ leaf: 1 });
    const cleanup = vi.fn();
    app.leaf.$onDispose(cleanup);
    app.$dispose();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
