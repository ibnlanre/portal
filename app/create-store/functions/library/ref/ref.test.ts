import { describe, expect, it, vi } from "vitest";

import { composite } from "@/create-store/functions/library/composite";
import { primitive } from "@/create-store/functions/library/primitive";

import { ref } from "./index";

class Queue {
  items: string[] = [];
  push(item: string) {
    this.items.push(item);
  }
}

describe("ref", () => {
  it("reads and writes a value, by reference", () => {
    const queue = new Queue();
    const held = ref(queue);
    expect(held.$get()).toBe(queue);
    const next = new Queue();
    held.$set(next);
    expect(held.$get()).toBe(next);
  });

  it("stores a function as a value; it is never called as an updater", () => {
    const first = () => 1;
    const second = () => 2;
    const held = ref(first);
    held.$set(second);
    expect(held.$get()).toBe(second);
  });

  it("holds a promise without wrapping it", () => {
    const promise = Promise.resolve(1);
    expect(ref(promise).$get()).toBe(promise);
  });

  it("ends with $dispose: writes become no-ops, the value stays readable, cleanups run once", () => {
    const held = ref(1);
    const cleanup = vi.fn();
    held.$onDispose(cleanup);
    held.$dispose();
    held.$dispose();
    held.$set(2);
    expect(held.$get()).toBe(1);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});

describe("a ref in a composite", () => {
  function make() {
    const queue = ref(new Queue());
    const app = composite({ count: 0, queue });
    return { app, queue };
  }

  it("is the member itself, readable and writable through the composite", () => {
    const { app, queue } = make();
    expect(app.queue).toBe(queue);
    const next = new Queue();
    app.queue.$set(next);
    expect(queue.$get()).toBe(next);
  });

  it("never notifies the composite's subscribers", () => {
    const { app } = make();
    const heard = vi.fn();
    app.$subscribe(heard, { immediate: false });
    app.queue.$set(new Queue());
    expect(heard).not.toHaveBeenCalled();
  });

  it("is not in the snapshot, nor in what subscribers are given", () => {
    const { app } = make();
    const seen: unknown[] = [];
    app.$subscribe((state) => seen.push(state), { immediate: false });

    expect(app.$get()).toEqual({ count: 0 });
    expect("queue" in app.$get()).toBe(false);

    app.count.$set(1);
    expect(seen).toEqual([{ count: 1 }]);
  });

  it("writing it leaves the snapshot's identity alone", () => {
    const { app } = make();
    const before = app.$get();
    app.queue.$set(new Queue());
    expect(app.$get()).toBe(before);
  });

  it("is not touched by a partial $set of the composite", () => {
    const { app, queue } = make();
    const held = queue.$get();
    app.$set({ count: 5 });
    expect(queue.$get()).toBe(held);
    expect(app.$get()).toEqual({ count: 5 });
  });

  it("is not touched by $reset, which resets every reactive leaf", () => {
    const { app, queue } = make();
    const replaced = new Queue();
    queue.$set(replaced);
    app.count.$set(7);

    app.$reset();

    expect(app.count.$get()).toBe(0);
    expect(app.$get()).toEqual({ count: 0 });
    expect(queue.$get()).toBe(replaced);
  });

  it("a single branch can still be reset on its own", () => {
    const { app, queue } = make();
    const replaced = new Queue();
    queue.$set(replaced);
    app.count.$set(3);
    app.count.$reset();
    expect(app.count.$get()).toBe(0);
    expect(queue.$get()).toBe(replaced);
  });

  it("is left out of a nested composite's snapshot and reset as well", () => {
    const handle = ref({ open: true });
    const inner = composite({ handle, name: "a" });
    const outer = composite({ inner, title: "t" });
    outer.inner.name.$set("b");
    expect(outer.$get()).toEqual({ inner: { name: "b" }, title: "t" });

    const kept = handle.$get();
    outer.$reset();
    expect(outer.$get()).toEqual({ inner: { name: "a" }, title: "t" });
    expect(handle.$get()).toBe(kept);
  });

  it("survives the composite's $dispose: it was handed in, so the creator keeps it", () => {
    const { app, queue } = make();
    const cleanup = vi.fn();
    queue.$onDispose(cleanup);
    app.$dispose();
    expect(cleanup).not.toHaveBeenCalled();
    const next = new Queue();
    queue.$set(next);
    expect(queue.$get()).toBe(next);
  });

  it("is shared when two composites hold it, and neither's snapshot shows it", () => {
    const shared = ref(new Queue());
    const one = composite({ n: 1, shared });
    const two = composite({ other: primitive("x"), shared });
    const next = new Queue();
    one.shared.$set(next);
    expect(two.shared.$get()).toBe(next);
    expect(one.$get()).toEqual({ n: 1 });
    expect(two.$get()).toEqual({ other: "x" });
  });
});
