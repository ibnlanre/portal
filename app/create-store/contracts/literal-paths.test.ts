import { describe, expect, it, vi } from "vitest";

import { createStore } from "../index";

describe("literal path identity", () => {
  it("distinguishes dotted keys from structural paths and preserves handle identity", () => {
    const store = createStore({ a: { b: 2 }, "a.b": 1 });
    expect(store["a.b"].$get()).toBe(1);
    expect(store.$at("a\\.b")).toBe(store["a.b"]);
    expect(store.$at("a.b")).toBe(store.a.b);
    const nested = vi.fn();
    store.a.b.$subscribe(nested, false);
    store["a.b"].$set(3);
    expect(store.$get()).toEqual({ a: { b: 2 }, "a.b": 3 });
    expect(nested).not.toHaveBeenCalled();
  });

  it("distinguishes empty, escaped, numeric-looking and method-name keys", () => {
    const store = createStore({ "": 1, "01": 2, "1": 3, $get: 5, "a\\b": 4 });
    expect(store[""].$get()).toBe(1);
    expect(store.$at("")).toBe(store[""]);
    expect(store.$at("a\\\\b")).toBe(store["a\\b"]);
    expect(store.$at("01")).toBe(store["01"]);
    expect(store.$at("1")).toBe(store["1"]);
    store.$at("$get").$set(6);
    store[""].$set(7);
    expect(store.$get()).toEqual({
      "": 7,
      "01": 2,
      "1": 3,
      $get: 6,
      "a\\b": 4,
    });
  });

  it("supports literal keys introduced into dynamic dictionaries", () => {
    const store = createStore<Record<string, number>>({});
    const branch = store.$at("new\\.key");
    branch.$set(8);
    expect(store["new.key"]).toBe(branch);
    expect(store.$get()).toEqual({ "new.key": 8 });
  });
});
