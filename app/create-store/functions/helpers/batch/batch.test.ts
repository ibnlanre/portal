import { describe, expect, it, vi } from "vitest";

import { composite } from "@/create-store/functions/library/composite";
import { primitive } from "@/create-store/functions/library/primitive";

import { batch } from "./index";

describe("batch", () => {
  it("notifies every store written, not only the first", () => {
    const a = primitive(0);
    const b = primitive(0);
    const heardA = vi.fn();
    const heardB = vi.fn();
    a.$subscribe(heardA, { immediate: false });
    b.$subscribe(heardB, { immediate: false });

    batch(() => {
      a.$set(1);
      b.$set(2);
    });

    expect(heardA).toHaveBeenCalledExactlyOnceWith(1);
    expect(heardB).toHaveBeenCalledExactlyOnceWith(2);
  });

  it("notifies the second of two unrelated trees: itself and its branches", () => {
    const first = composite({ x: 1 });
    const second = composite({ branch: composite({ y: 1 }) });
    const heardFirst = vi.fn();
    const heardSecond = vi.fn();
    const heardBranch = vi.fn();
    first.$subscribe(heardFirst, { immediate: false });
    second.$subscribe(heardSecond, { immediate: false });
    second.branch.$subscribe(heardBranch, { immediate: false });

    batch(() => {
      first.$reset();
      second.$set({ branch: { y: 2 } });
    });

    expect(heardFirst).toHaveBeenCalledTimes(1);
    expect(heardSecond).toHaveBeenCalledTimes(1);
    expect(heardBranch).toHaveBeenCalledTimes(1);
  });

  it("notifies a composite and an unrelated primitive, in either order", () => {
    for (const compositeFirst of [true, false]) {
      const tree = composite({ n: 1 });
      const lone = primitive(0);
      const heardTree = vi.fn();
      const heardLone = vi.fn();
      tree.$subscribe(heardTree, { immediate: false });
      lone.$subscribe(heardLone, { immediate: false });

      batch(() => {
        if (compositeFirst) {
          tree.n.$set(2);
          lone.$set(1);
        } else {
          lone.$set(1);
          tree.n.$set(2);
        }
      });

      expect(heardTree).toHaveBeenCalledTimes(1);
      expect(heardLone).toHaveBeenCalledTimes(1);
    }
  });

  it("notifies the descendants of a store written second", () => {
    const first = primitive(0);
    const second = composite({ leaf: composite({ deep: 1 }) });
    const heardDeep = vi.fn();
    second.leaf.deep.$subscribe(heardDeep, { immediate: false });

    batch(() => {
      first.$set(1);
      second.$reset();
    });

    expect(heardDeep).toHaveBeenCalledTimes(1);
  });

  it("calls a subscriber once even when several writes reach it", () => {
    const a = primitive(0);
    const b = primitive(0);
    const both = composite({ a, b });
    const heard = vi.fn();
    both.$subscribe(heard, { immediate: false });

    batch(() => {
      a.$set(1);
      b.$set(1);
      both.$set({ a: 2 });
    });

    expect(heard).toHaveBeenCalledExactlyOnceWith({ a: 2, b: 1 });
  });

  it("delivers after the function returns, and never sees a half state", () => {
    const a = primitive(0);
    const b = primitive(0);
    const seen: Array<[number, number]> = [];
    a.$subscribe(() => seen.push([a.$get(), b.$get()]), { immediate: false });

    batch(() => {
      a.$set(1);
      expect(seen).toEqual([]);
      b.$set(1);
    });

    expect(seen).toEqual([[1, 1]]);
  });

  it("joins a nested batch to the outer one", () => {
    const a = primitive(0);
    const heard = vi.fn();
    a.$subscribe(heard, { immediate: false });

    batch(() => {
      a.$set(1);
      batch(() => a.$set(2));
      expect(heard).not.toHaveBeenCalled();
    });

    expect(heard).toHaveBeenCalledExactlyOnceWith(2);
  });

  it("keeps applied writes and delivers once when the function throws", () => {
    const a = primitive(0);
    const heard = vi.fn();
    a.$subscribe(heard, { immediate: false });

    expect(() =>
      batch(() => {
        a.$set(1);
        throw new Error("stop");
      })
    ).toThrow("stop");

    expect(a.$get()).toBe(1);
    expect(heard).toHaveBeenCalledExactlyOnceWith(1);
  });

  it("throws the function's error when delivery is fine", () => {
    const failure = new Error("fn");
    expect(() =>
      batch(() => {
        throw failure;
      })
    ).toThrow(failure);
  });

  it("throws the delivery error alone when the function is fine", () => {
    const a = primitive(0);
    const failure = new Error("listener");
    a.$subscribe(
      () => {
        throw failure;
      },
      { immediate: false }
    );
    expect(() => batch(() => a.$set(1))).toThrow(failure);
  });

  it("does not mask either error when both the function and delivery throw", () => {
    const a = primitive(0);
    const listener = new Error("listener");
    const fn = new Error("fn");
    a.$subscribe(
      () => {
        throw listener;
      },
      { immediate: false }
    );

    let caught: unknown;
    try {
      batch(() => {
        a.$set(1);
        throw fn;
      });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(AggregateError);
    expect((caught as AggregateError).errors).toEqual([fn, listener]);
    expect(a.$get()).toBe(1);
  });

  it("does nothing when nothing was written", () => {
    expect(() => batch(() => {})).not.toThrow();
  });
});

describe("a deep diamond", () => {
  it("stays linear: every store is visited once and every subscriber called once", () => {
    const levels = 20;
    const bottom = primitive(0);
    let previous: ReturnType<typeof composite> = composite({ bottom });
    const heard: Array<ReturnType<typeof vi.fn>> = [];
    const first = vi.fn();
    previous.$subscribe(first, { immediate: false });
    heard.push(first);
    for (let level = 1; level < levels; level++) {
      previous = composite({ left: previous, right: previous });
      const listener = vi.fn();
      previous.$subscribe(listener, { immediate: false });
      heard.push(listener);
    }

    const started = performance.now();
    bottom.$set(1);
    const elapsed = performance.now() - started;

    for (const listener of heard) expect(listener).toHaveBeenCalledTimes(1);
    expect(previous.$get()).toBeDefined();
    // 2^20 paths would take far longer than this if the walk were exponential.
    expect(elapsed).toBeLessThan(500);
  });
});
