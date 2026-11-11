import { afterEach, describe, expect, it, vi } from "vitest";

import { localAdapter } from "../functions/adapters/local-adapter";
import { composite } from "../functions/library/composite";
import { primitive } from "../functions/library/primitive";
import { persist } from "../functions/utilities/persist";

class Money {
  constructor(public cents: number) {}
}

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("exotic values are held untouched", () => {
  it("a cyclic object, Map, Set and class instance in a primitive come back as the same reference", () => {
    const cyclic: { self?: unknown } = {};
    cyclic.self = cyclic;
    const map = new Map([["a", 1]]);
    const set = new Set([1]);
    const money = new Money(5);
    for (const value of [cyclic, map, set, money]) {
      const store = primitive<unknown>(value);
      expect(store.$get()).toBe(value);
      const next = { ...Object(value) };
      store.$set(next);
      expect(store.$get()).toBe(next);
    }
  });

  it("the same in a composite leaf, by reference and not walked", () => {
    const cyclic: { self?: unknown } = {};
    cyclic.self = cyclic;
    const map = new Map([["a", 1]]);
    const money = new Money(5);
    const store = composite({ cyclic, map, money });
    expect(store.$get().cyclic).toBe(cyclic);
    expect(store.$get().map).toBe(map);
    expect(store.$get().money).toBe(money);
    expect(store.cyclic.$get()).toBe(cyclic);
  });

  it("through persist a Map and class instance serialize as JSON would, and a cyclic one is reported not thrown", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const store = primitive<unknown>({ money: new Money(5) });
    persist(store, localAdapter<unknown>("exotic"));
    store.$set({ money: new Money(7) });
    expect(JSON.parse(localStorage.getItem("exotic")!)).toEqual({
      money: { cents: 7 },
    });

    const cyclic: { self?: unknown } = {};
    cyclic.self = cyclic;
    expect(() => store.$set(cyclic)).not.toThrow();
    expect(store.$get()).toBe(cyclic);
    expect(error).toHaveBeenCalled();
  });

  it("stores a function through an initializer and sets it with an updater", () => {
    const first = () => "first";
    const second = () => "second";
    const store = primitive<() => string>(() => first);
    expect(store.$get()).toBe(first);
    store.$set(() => second);
    expect(store.$get()).toBe(second);
  });

  it("calls an initializer once", () => {
    const initial = vi.fn(() => ({ n: 1 }));
    const store = primitive(initial);
    store.$get();
    store.$set({ n: 2 });
    store.$reset();
    expect(initial).toHaveBeenCalledTimes(1);
    expect(store.$get()).toEqual({ n: 1 });
  });
});
