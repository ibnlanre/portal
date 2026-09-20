import { describe, expect, it, vi } from "vitest";

import { createStore } from "../index";

describe("subscription churn", () => {
  it("delivers to active paths only after many subscribe/unsubscribe cycles", () => {
    const store = createStore<{
      entries: Record<string, number>;
      leaf: { value: number };
    }>({ entries: {}, leaf: { value: 0 } });
    const history = vi.fn();
    for (let index = 0; index < 1_000; index++) {
      const unsubscribe = store
        .$at(`entries.key${index}`)
        .$subscribe(history, false);
      unsubscribe();
    }

    const active = vi.fn();
    store.leaf.value.$subscribe(active, false);
    store.leaf.value.$set(1);

    expect(active).toHaveBeenCalledExactlyOnceWith(1);
    expect(history).not.toHaveBeenCalled();
  });

  it("keeps re-subscribed paths live and ordered after churn", () => {
    const store = createStore({ entries: {} as Record<string, number> });
    const branch = store.$at("entries");

    for (let index = 0; index < 100; index++) {
      const unsubscribe = branch.$at(`key${index}`).$subscribe(() => {}, false);
      unsubscribe();
    }

    const observed: Array<number | undefined> = [];
    const unsubscribe = branch.$at("key0").$subscribe((value) => {
      observed.push(value);
    }, false);
    branch.$at("key0").$set(1);
    branch.$at("key0").$set(2);
    unsubscribe();
    branch.$at("key0").$set(3);

    expect(observed).toEqual([1, 2]);
  });

  it("stops delivering to paths after the last subscriber leaves", () => {
    const store = createStore({ count: { value: 0 } });
    const first = vi.fn();
    const second = vi.fn();
    const releaseFirst = store.count.value.$subscribe(first, false);
    const releaseSecond = store.count.value.$subscribe(second, false);

    releaseFirst();
    store.count.value.$set(1);
    releaseSecond();
    store.count.value.$set(2);

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledExactlyOnceWith(1);
  });
});
