import { describe, expect, it, vi } from "vitest";

import { createStore } from "../index";

const initial = () => ({
  projects: [{ id: 1, title: "Portal" }],
  settings: { theme: "dark" },
  user: { name: "A", preferences: { email: true } },
});

describe("structural sharing", () => {
  it.each(["root", "parent", "leaf", "draft"])(
    "copies only changed branches for a %s write",
    (kind) => {
      const store = createStore(initial());
      const before = store.$get();
      if (kind === "root") store.$set({ user: { name: "B" } });
      else if (kind === "parent") store.user.$set({ name: "B" });
      else if (kind === "leaf") store.user.name.$set("B");
      else
        store.$set((draft) => {
          draft.user.name = "B";
          return draft;
        });
      const after = store.$get();
      expect(after).not.toBe(before);
      expect(after.user).not.toBe(before.user);
      expect(after.user.name).toBe("B");
      expect(after.user.preferences).toBe(before.user.preferences);
      expect(after.settings).toBe(before.settings);
      expect(after.projects).toBe(before.projects);
      expect(store.settings.$get()).toBe(before.settings);
      expect(before).toEqual(initial());
    }
  );

  it.each(["root", "parent", "leaf", "draft", "array"])(
    "retains snapshot identity for an unchanged %s write but still notifies",
    (kind) => {
      const store = createStore(initial());
      const before = store.$get();
      const listener = vi.fn();
      store.$subscribe(listener, false);
      if (kind === "root") store.$set({ user: { name: "A" } });
      else if (kind === "parent") store.user.$set({});
      else if (kind === "leaf") store.user.name.$set("A");
      else if (kind === "array")
        store.projects.$set([{ id: 1, title: "Portal" }]);
      else store.$set((draft) => draft);
      expect(store.$get()).toBe(before);
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(before);
    }
  );

  it("replaces arrays without merging their elements and shares unchanged elements", () => {
    const store = createStore<{ id: number; title?: string }[]>([
      { id: 1, title: "one" },
      { id: 2, title: "two" },
    ]);
    const before = store.$get();
    store.$set([{ id: 1 }, { id: 2, title: "two" }]);
    expect(store.$get()).toEqual([{ id: 1 }, { id: 2, title: "two" }]);
    expect(store.$get()[0]).not.toBe(before[0]);
    expect(store.$get()[1]).toBe(before[1]);
    store.$set([]);
    expect(store.$get()).toEqual([]);
    expect(before).toHaveLength(2);
  });

  it("distinguishes absent properties, undefined, and Object.is primitive values", () => {
    const store = createStore<{ number: number; optional?: string }>({
      number: NaN,
    });
    const before = store.$get();
    store.number.$set(NaN);
    expect(store.$get()).toBe(before);
    store.$set({ optional: undefined });
    expect(store.$get()).not.toBe(before);
    expect(Object.hasOwn(store.$get(), "optional")).toBe(true);
    store.number.$set(0);
    const zero = store.$get();
    store.number.$set(-0);
    expect(store.$get()).not.toBe(zero);
  });

  it("preserves cycle topology in ingested values and full updater drafts", () => {
    type Node = { name: string; self?: Node };
    const node: Node = { name: "A" };
    node.self = node;
    const store = createStore(node);
    const before = store.$get();
    expect(before.self).toBe(before);
    store.$set((draft) => draft);
    expect(store.$get()).toBe(before);
    store.$set((draft) => {
      draft.name = "B";
      return draft;
    });
    const after = store.$get();
    expect(after.name).toBe("B");
    expect(after.self).toBe(after);
    expect(before.self).toBe(before);
    expect(before.name).toBe("A");
  });
});
