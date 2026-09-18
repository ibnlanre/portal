import { describe, expect, it, vi } from "vitest";
import { createStore } from "../index";

describe("notification contract", () => {
  it("notifies a descendant when its ancestor is updated", () => {
    const store = createStore({ user: { name: "A", age: 20 } });
    const listener = vi.fn();
    store.user.name.$subscribe(listener, false);
    store.user.$set({ name: "B", age: 20 });
    expect(store.user.name.$get()).toBe("B");
    expect(listener).toHaveBeenCalledExactlyOnceWith("B");
  });

  // Raw subscriptions invalidate the written subtree and its ancestors.
  // Equality-based render gating is a separate React selector contract.
  it.each([
    ["root", [1, 1, 1, 1, 1]],
    ["parent", [1, 1, 1, 1, 0]],
    ["leaf", [1, 1, 1, 0, 0]],
  ] as const)(
    "%s writes invalidate only overlapping paths",
    (write, counts) => {
      const store = createStore({
        user: { name: "A", age: 20 },
        username: "other",
      });
      const listeners = Array.from({ length: 5 }, () => vi.fn());
      const branches = [
        store,
        store.user,
        store.user.name,
        store.user.age,
        store.username,
      ];
      branches.forEach((branch, i) => branch.$subscribe(listeners[i], false));
      if (write === "root") store.$set({ user: { name: "B" } });
      if (write === "parent") store.user.$set({ name: "B" });
      if (write === "leaf") store.user.name.$set("B");
      listeners.forEach((listener, i) =>
        expect(listener).toHaveBeenCalledTimes(counts[i])
      );
      expect(listeners[0]).toHaveBeenLastCalledWith(store.$get());
      expect(listeners[2]).toHaveBeenLastCalledWith("B");
    }
  );

  it.each([{}, { name: "A", age: 20 }])(
    "notifies overlapping paths for an unchanged object merge: %j",
    (patch) => {
      const store = createStore({ user: { name: "A", age: 20 }, other: 0 });
      const root = vi.fn();
      const user = vi.fn();
      const name = vi.fn();
      const other = vi.fn();
      store.$subscribe(root, false);
      store.user.$subscribe(user, false);
      store.user.name.$subscribe(name, false);
      store.other.$subscribe(other, false);
      store.user.$set(patch);
      expect(store.$get()).toEqual({ user: { name: "A", age: 20 }, other: 0 });
      expect(root).toHaveBeenCalledTimes(1);
      expect(user).toHaveBeenCalledExactlyOnceWith({ name: "A", age: 20 });
      expect(name).toHaveBeenCalledExactlyOnceWith("A");
      expect(other).not.toHaveBeenCalled();
    }
  );

  it("invalidates descendants that disappear when a nullable ancestor is cleared", () => {
    const store = createStore<{ user: { name: string } | null }>({
      user: { name: "A" },
    });
    const listener = vi.fn();
    store.$at("user.name").$subscribe(listener, false);
    store.user.$set(null);
    expect(listener).toHaveBeenCalledExactlyOnceWith(undefined);
  });

  it("delivers same-value writes to raw subscribers and supports idempotent cleanup", () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();
    const off = store.count.$subscribe(listener);
    expect(listener).toHaveBeenCalledExactlyOnceWith(0);
    store.count.$set(0);
    expect(listener).toHaveBeenCalledTimes(2);
    off();
    off();
    store.count.$set(1);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
