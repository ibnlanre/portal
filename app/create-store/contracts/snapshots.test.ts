import { describe, expect, it } from "vitest";
import { createStore } from "../index";

describe("snapshot ownership", () => {
  it("owns frozen and null-prototype records and makes mutable drafts from them", () => {
    const tags = ["a"];
    const initial = Object.freeze({ tags });
    const store = createStore<{ tags: string[] }>(initial);
    tags.push("outside");
    expect(store.tags.$get()).toEqual(["a"]);
    store.$set((draft) => {
      draft.tags = ["b"];
      return draft;
    });
    expect(store.tags.$get()).toEqual(["b"]);
    const record = Object.assign(Object.create(null), { nested: { value: 1 } });
    const dictionary = createStore(record);
    record.nested.value = 2;
    expect(dictionary.$get().nested.value).toBe(1);
  });

  it("owns supported mutable built-ins on ingestion and in drafts", () => {
    const date = new Date(0);
    const map = new Map([["item", { value: 1 }]]);
    const set = new Set([{ value: 1 }]);
    const bytes = new Uint8Array([1]);
    const store = createStore({ date, map, set, bytes });
    date.setTime(1);
    map.get("item")!.value = 2;
    [...set][0].value = 2;
    bytes[0] = 2;
    const before = store.$get();
    expect(before.date.getTime()).toBe(0);
    expect(before.map.get("item")!.value).toBe(1);
    expect([...before.set][0].value).toBe(1);
    expect(before.bytes[0]).toBe(1);
    store.$set((draft) => {
      draft.date.setTime(3);
      draft.map.get("item")!.value = 3;
      draft.set.add({ value: 3 });
      draft.bytes[0] = 3;
      return draft;
    });
    expect(before.date.getTime()).toBe(0);
    expect(before.map.get("item")!.value).toBe(1);
    expect(before.set.size).toBe(1);
    expect(before.bytes[0]).toBe(1);
  });

  it("returns one snapshot across reads, selectors, and subscribers", () => {
    const store = createStore({ user: { name: "A" }, tags: ["a"] });
    const snapshot = store.$get();
    expect(store.$get()).toBe(snapshot);
    expect(store.user.$get()).toBe(snapshot.user);
    expect(store.$get((state) => state.user)).toBe(snapshot.user);
    store.$subscribe((state) => expect(state).toBe(snapshot));
    const array = createStore([1, 2]);
    expect(array.$get()).toBe(array.$get());
  });

  it("owns initial values, including standalone arrays and the initial shape", () => {
    const initial = { tags: ["a"] };
    const store = createStore(initial);
    const array = createStore(initial.tags);
    initial.tags.push("b");
    Object.assign(initial, { external: true });
    expect(store.tags.$get()).toEqual(["a"]);
    expect(array.$get()).toEqual(["a"]);
    expect("external" in store).toBe(false);
  });

  it.each(["root", "branch", "array"])(
    "owns values supplied through %s writes",
    (kind) => {
      const store = createStore({ user: { tags: ["old"] } });
      const tags = ["new"];
      if (kind === "root") store.$set({ user: { tags } });
      else if (kind === "branch") store.user.$set({ tags });
      else store.user.tags.$set(tags);
      tags.push("external");
      expect(store.user.tags.$get()).toEqual(["new"]);
      const array = createStore(["old"]);
      array.$set(tags);
      tags.push("again");
      expect(array.$get()).toEqual(["new", "external"]);
    }
  );

  it("isolates updater drafts before, after, and between writes", () => {
    const store = createStore({ tags: ["a"] });
    const before = store.$get();
    let retained!: { tags: string[] };
    store.$set((draft) => {
      retained = draft;
      draft.tags.push("b");
      expect(store.$get()).toBe(before);
      expect(before.tags).toEqual(["a"]);
      return draft;
    });
    retained.tags.push("outside");
    expect(store.tags.$get()).toEqual(["a", "b"]);
    const array = createStore([1]);
    expect(() =>
      array.$set((draft) => {
        draft.push(2);
        throw new Error("abort");
      })
    ).toThrow("abort");
    array.$set((draft) => {
      expect(draft).toEqual([1]);
      draft.push(3);
      return draft;
    });
    expect(array.$get()).toEqual([1, 3]);
  });
});
