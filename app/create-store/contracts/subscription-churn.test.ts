import { describe, expect, it, vi } from "vitest";

import { composite } from "../functions/library/composite";
import { primitive } from "../functions/library/primitive";

describe("subscription churn", () => {
  it("leaves delivery correct after many subscribe and unsubscribe cycles", () => {
    const stores = [primitive(0), composite({ leaf: 0 }).leaf];
    for (const store of stores) {
      for (let cycle = 0; cycle < 1_000; cycle++) {
        store.$subscribe(() => {}, { immediate: false })();
      }
      const early = vi.fn();
      const late = vi.fn();
      store.$subscribe(early, { immediate: false });
      store.$subscribe(late, { immediate: false });

      store.$set(1);

      expect(early).toHaveBeenCalledTimes(1);
      expect(late).toHaveBeenCalledTimes(1);
      expect(early.mock.invocationCallOrder[0]).toBeLessThan(
        late.mock.invocationCallOrder[0]
      );
    }
  });

  it("keeps subscription order when one leaves and another joins", () => {
    const store = primitive(0);
    const order: string[] = [];
    const offA = store.$subscribe(() => order.push("a"), { immediate: false });
    store.$subscribe(() => order.push("b"), { immediate: false });
    offA();
    store.$subscribe(() => order.push("c"), { immediate: false });
    store.$set(1);
    expect(order).toEqual(["b", "c"]);
  });

  it("stops delivering after the last subscriber leaves, and starts again on a new one", () => {
    const tree = composite({ leaf: 0 });
    const first = vi.fn();
    const off = tree.$subscribe(first, { immediate: false });
    off();
    tree.leaf.$set(1);
    expect(first).not.toHaveBeenCalled();

    const second = vi.fn();
    tree.$subscribe(second, { immediate: false });
    tree.leaf.$set(2);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("does not grow the holders of a shared store as composites come and go", () => {
    const shared = primitive(0);
    const heard = vi.fn();
    for (let cycle = 0; cycle < 1_000; cycle++) {
      const holder = composite({ shared });
      holder.$dispose();
    }
    const kept = composite({ shared });
    kept.$subscribe(heard, { immediate: false });
    shared.$set(1);
    expect(heard).toHaveBeenCalledTimes(1);
  });
});
