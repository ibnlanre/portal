import { describe, expect, it, vi } from "vitest";

import { createStore } from "../index";

describe("notification delivery", () => {
  it("delivers reentrant composite writes in commit order", () => {
    const store = createStore({ a: 0, b: 0 });
    const observed: unknown[] = [];
    store.a.$subscribe(() => store.b.$set(1), false);
    store.$subscribe((value) => observed.push(value), false);
    store.a.$set(1);
    expect(observed).toEqual([
      { a: 1, b: 0 },
      { a: 1, b: 1 },
    ]);
    expect(store.$get()).toEqual({ a: 1, b: 1 });
  });

  it("delivers reentrant whole-value writes in commit order", () => {
    const store = createStore(0);
    const observed: number[] = [];
    store.$subscribe((value) => {
      if (value === 1) store.$set(2);
    }, false);
    store.$subscribe((value) => observed.push(value), false);
    store.$set(1);
    expect(observed).toEqual([1, 2]);
  });

  it.each(["primitive", "branch"] as const)(
    "%s drains delivery before reporting listener failures",
    (kind) => {
      const store =
        kind === "primitive" ? createStore(0) : createStore({ value: 0 }).value;
      const failure = new Error("listener failed");
      const observed: number[] = [];
      store.$subscribe((value) => {
        if (value === 1) {
          store.$set(2);
          throw failure;
        }
      }, false);
      store.$subscribe((value) => observed.push(value), false);
      expect(() => store.$set(1)).toThrow(failure);
      expect(observed).toEqual([1, 2]);
      expect(store.$get()).toBe(2);
      store.$set(3);
      expect(observed).toEqual([1, 2, 3]);
    }
  );

  it("reports all listener errors together after notifying healthy listeners", () => {
    const store = createStore(0);
    const errors = [new Error("first"), new Error("second")];
    for (const error of errors)
      store.$subscribe(() => {
        throw error;
      }, false);
    const healthy = vi.fn();
    store.$subscribe(healthy, false);
    let caught: unknown;
    try {
      store.$set(1);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(AggregateError);
    expect((caught as AggregateError).errors).toEqual(errors);
    expect(healthy).toHaveBeenCalledExactlyOnceWith(1);
  });

  it.each(["primitive", "branch"] as const)(
    "%s removes a subscription whose immediate callback throws",
    (kind) => {
      const store =
        kind === "primitive" ? createStore(0) : createStore({ value: 0 }).value;
      const callback = vi.fn(() => {
        throw new Error("initial");
      });
      expect(() => store.$subscribe(callback)).toThrow("initial");
      expect(() => store.$set(1)).not.toThrow();
      expect(callback).toHaveBeenCalledTimes(1);
    }
  );
});
