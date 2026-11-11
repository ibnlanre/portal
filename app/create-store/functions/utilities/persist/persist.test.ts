import { afterEach, describe, expect, it, vi } from "vitest";

import { asyncAdapter } from "@/create-store/functions/adapters/async-adapter";
import { cookieAdapter } from "@/create-store/functions/adapters/cookie-adapter";
import { customAdapter } from "@/create-store/functions/adapters/custom-adapter";
import { localAdapter } from "@/create-store/functions/adapters/local-adapter";
import { sessionAdapter } from "@/create-store/functions/adapters/session-adapter";
import { collection } from "@/create-store/functions/library/collection";
import { composite } from "@/create-store/functions/library/composite";
import { primitive } from "@/create-store/functions/library/primitive";

import { persist } from "./index";

type Draft = { lines: string[]; note?: string };

const key = "draft";
const initial: Draft = { lines: [] };

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

function dispatch(init: StorageEventInit) {
  window.dispatchEvent(new StorageEvent("storage", init));
}

function read(name = key) {
  return JSON.parse(localStorage.getItem(name)!);
}

describe("persist on a primitive", () => {
  it("hydrates synchronously from storage and writes later changes", () => {
    localStorage.setItem(key, JSON.stringify({ lines: ["a"] }));
    const store = primitive<Draft>(initial);
    const persistor = persist(store, localAdapter<Draft>(key));

    expect(store.$get()).toEqual({ lines: ["a"] });
    expect(persistor.hydrated.$get()).toBe(true);

    store.$set({ lines: ["a"], note: "n" });
    expect(read()).toEqual({ lines: ["a"], note: "n" });
  });

  it("keeps the initial value when storage is empty and does not write it", () => {
    const store = primitive<Draft>(initial);
    const onHydrated = vi.fn();
    persist(store, localAdapter<Draft>(key), { onHydrated });

    expect(store.$get()).toBe(initial);
    expect(localStorage.getItem(key)).toBeNull();
    expect(onHydrated).toHaveBeenCalledWith(initial);
  });

  it("treats a stored null as absent", () => {
    localStorage.setItem(key, "null");
    const store = primitive<Draft>({ lines: ["i"] });
    persist(store, localAdapter<Draft>(key));
    expect(store.$get()).toEqual({ lines: ["i"] });
  });

  describe("skipHydration", () => {
    it("leaves the store at its initial value and does not write until hydrated", async () => {
      localStorage.setItem(key, JSON.stringify({ lines: ["stored"] }));
      const store = primitive<Draft>(initial);
      const persistor = persist(store, localAdapter<Draft>(key), {
        skipHydration: true,
      });

      expect(store.$get()).toBe(initial);
      expect(persistor.hydrated.$get()).toBe(false);

      store.$set({ lines: [], note: "early" });
      expect(read()).toEqual({ lines: ["stored"] });

      await persistor.hydrate();
      expect(persistor.hydrated.$get()).toBe(true);
      expect(store.$get().lines).toEqual(["stored"]);
      expect(read()).toEqual({ lines: ["stored"] });

      store.$set({ lines: ["stored"], note: "late" });
      expect(read().note).toBe("late");
    });

    it("notifies hydrated subscribers once and ignores a second hydrate", async () => {
      const store = primitive<Draft>(initial);
      const onHydrated = vi.fn();
      const persistor = persist(store, localAdapter<Draft>(key), {
        onHydrated,
        skipHydration: true,
      });
      const seen = vi.fn();
      persistor.hydrated.$subscribe(seen, { immediate: false });

      await persistor.hydrate();
      await persistor.hydrate();

      expect(seen).toHaveBeenCalledTimes(1);
      expect(seen.mock.calls[0][0]).toBe(true);
      expect(onHydrated).toHaveBeenCalledTimes(1);
    });
  });

  describe("with a versioned adapter", () => {
    it("writes the envelope the adapter defines", () => {
      const store = primitive<Draft>(initial);
      persist(store, localAdapter<Draft>(key, { version: 2 }));
      store.$set({ lines: [], note: "n" });
      expect(read()).toEqual({ $version: 2, state: { lines: [], note: "n" } });
    });

    it("hydrates through the adapter's migrate", () => {
      localStorage.setItem(
        key,
        JSON.stringify({ $version: 0, state: { lines: ["old"] } })
      );
      const store = primitive<Draft>(initial);
      persist(
        store,
        localAdapter<Draft>(key, {
          migrate: (stored, from) => ({
            ...(stored as Draft),
            note: `from ${from}`,
          }),
          version: 1,
        })
      );
      expect(store.$get()).toEqual({ lines: ["old"], note: "from 0" });
    });

    it("keeps the initial value for a version the adapter cannot read", () => {
      localStorage.setItem(
        key,
        JSON.stringify({ $version: 9, state: { lines: ["future"] } })
      );
      const store = primitive<Draft>(initial);
      persist(store, localAdapter<Draft>(key, { version: 1 }));
      expect(store.$get()).toBe(initial);
    });
  });

  describe("echo suppression", () => {
    it("does not write back what it hydrated", () => {
      localStorage.setItem(key, JSON.stringify({ lines: ["a"] }));
      const setItem = vi.spyOn(localStorage, "setItem");
      persist(primitive<Draft>(initial), localAdapter<Draft>(key));
      expect(setItem).not.toHaveBeenCalled();
    });

    it("writes a later user edit, and not an edit made before hydration", async () => {
      localStorage.setItem(key, JSON.stringify({ lines: ["stored"] }));
      const store = primitive<Draft>(initial);
      const persistor = persist(store, localAdapter<Draft>(key), {
        skipHydration: true,
      });
      const setItem = vi.spyOn(localStorage, "setItem");

      store.$set({ lines: [], note: "early" });
      expect(setItem).not.toHaveBeenCalled();

      await persistor.hydrate();
      expect(setItem).not.toHaveBeenCalled();

      store.$set({ lines: ["stored"], note: "late" });
      expect(setItem).toHaveBeenCalledTimes(1);
      expect(read().note).toBe("late");
    });

    it("does not write back a hydration triggered inside another subscriber", () => {
      localStorage.setItem(key, JSON.stringify({ lines: ["stored"] }));
      const store = primitive<Draft>(initial);
      const persistor = persist(store, localAdapter<Draft>(key), {
        skipHydration: true,
      });
      store.$subscribe(() => void persistor.hydrate(), { immediate: false });
      const setItem = vi.spyOn(localStorage, "setItem");

      store.$set({ lines: [], note: "trigger" });

      expect(persistor.hydrated.$get()).toBe(true);
      expect(setItem).not.toHaveBeenCalled();
      expect(read()).toEqual({ lines: ["stored"] });
    });

    it("does not write back a watched change applied inside another subscriber", () => {
      const store = primitive<Draft>(initial);
      persist(store, localAdapter<Draft>(key));
      let fired = false;
      store.$subscribe(
        () => {
          if (fired) return;
          fired = true;
          localStorage.setItem(key, JSON.stringify({ lines: ["tab2"] }));
          dispatch({ key, newValue: "x" });
        },
        { immediate: false }
      );
      const setItem = vi.spyOn(localStorage, "setItem");

      store.$set({ lines: [], note: "trigger" });

      expect(store.$get().lines).toEqual(["tab2"]);
      // The user's edit, then the test's simulated write: nothing from persist.
      expect(setItem.mock.calls.length).toBe(2);
    });
  });

  describe("following storage", () => {
    it("follows local storage by default: a change from another tab is applied and not written back", () => {
      const store = primitive<Draft>(initial);
      persist(store, localAdapter<Draft>(key));
      localStorage.setItem(key, JSON.stringify({ lines: ["tab2"] }));
      const setItem = vi.spyOn(localStorage, "setItem");

      dispatch({ key, newValue: JSON.stringify({ lines: ["tab2"] }) });

      expect(store.$get().lines).toEqual(["tab2"]);
      expect(setItem).not.toHaveBeenCalled();
    });

    it("resets on removal without writing back, and a later local edit writes", () => {
      const store = primitive<Draft>(initial);
      persist(store, localAdapter<Draft>(key));
      store.$set({ lines: ["x"], note: "n" });
      localStorage.removeItem(key);
      const setItem = vi.spyOn(localStorage, "setItem");

      dispatch({ key, newValue: null });
      dispatch({ key: null });

      expect(store.$get()).toBe(initial);
      expect(setItem).not.toHaveBeenCalled();
      expect(localStorage.getItem(key)).toBeNull();

      store.$set({ lines: [], note: "again" });
      expect(read()).toEqual({ lines: [], note: "again" });
    });

    it("resets when the changed value cannot be read", () => {
      const store = primitive<Draft>(initial);
      persist(store, localAdapter<Draft>(key));
      store.$set({ lines: ["x"] });
      localStorage.setItem(key, "null");
      dispatch({ key, newValue: "null" });
      expect(store.$get()).toBe(initial);
    });

    it("sync: false follows nothing", () => {
      const store = primitive<Draft>(initial);
      persist(store, localAdapter<Draft>(key), { sync: false });
      localStorage.setItem(key, JSON.stringify({ lines: ["tab2"] }));
      dispatch({ key, newValue: "x" });
      expect(store.$get()).toBe(initial);
    });

    it("session storage follows nothing, and does not throw", () => {
      const store = primitive<Draft>(initial);
      expect(() => persist(store, sessionAdapter<Draft>(key))).not.toThrow();
      sessionStorage.setItem(key, JSON.stringify({ lines: ["tab2"] }));
      dispatch({ key, newValue: "x", storageArea: sessionStorage });
      expect(store.$get()).toBe(initial);
      sessionStorage.clear();
    });

    it("cookie, async and plain-tuple adapters follow nothing, and do not throw", () => {
      const data = new Map<string, Draft>();
      const adapters = [
        cookieAdapter<Draft>(key),
        asyncAdapter<Draft>(key, {
          getItem: (k) => Promise.resolve(data.get(k)),
          removeItem: (k) => void data.delete(k),
          setItem: (k, v) => void data.set(k, v),
        }),
        [() => undefined, () => {}] as const,
      ];
      for (const adapter of adapters) {
        const store = primitive<Draft>(initial);
        expect(() => persist(store, adapter)).not.toThrow();
        dispatch({ key, newValue: null });
        expect(store.$get()).toBe(initial);
      }
    });

    it("ignores changes until hydrated", () => {
      const store = primitive<Draft>(initial);
      persist(store, localAdapter<Draft>(key), {
        skipHydration: true,
      });
      localStorage.setItem(key, JSON.stringify({ lines: ["early"] }));
      dispatch({ key, newValue: "x" });
      expect(store.$get()).toBe(initial);
    });

    it("follows only the adapter itself: a copy of its tuple follows nothing", () => {
      const adapter = localAdapter<Draft>(key);
      const store = primitive<Draft>(initial);
      expect(() => persist(store, [...adapter])).not.toThrow();
      const copied = primitive<Draft>(initial);
      persist(copied, [adapter[0], adapter[1]] as const);
      localStorage.setItem(key, JSON.stringify({ lines: ["tab2"] }));
      dispatch({ key, newValue: "x" });
      expect(store.$get()).toBe(initial);
      expect(copied.$get()).toBe(initial);

      const original = primitive<Draft>(initial);
      persist(original, adapter);
      dispatch({ key, newValue: "x" });
      expect(original.$get().lines).toEqual(["tab2"]);
    });

    it("follows a custom browser adapter that supplies a watcher, and not one that does not", () => {
      const data = new Map<string, string>();
      const storage = {
        getItem: (k: string) => data.get(k) ?? null,
        removeItem: (k: string) => void data.delete(k),
        setItem: (k: string, v: string) => void data.set(k, v),
      };
      let notify: (change: { removed: boolean }) => void = () => {};
      const following = primitive<Draft>(initial);
      persist(
        following,
        customAdapter<Draft>(key, {
          ...storage,
          watch: (listener) => {
            notify = listener;
            return () => {};
          },
        })
      );
      const ignoring = primitive<Draft>(initial);
      persist(ignoring, customAdapter<Draft>(key, storage));

      data.set(key, JSON.stringify({ lines: ["other"] }));
      notify({ removed: false });
      expect(following.$get().lines).toEqual(["other"]);
      expect(ignoring.$get()).toBe(initial);
    });

    it("follows a watch supplied through the adapter options", async () => {
      let notify: (change: { removed: boolean }) => void = () => {};
      const data = new Map<string, string>([
        [key, JSON.stringify({ lines: ["a"] })],
      ]);
      const store = primitive<Draft>(initial);
      const adapter = asyncAdapter<Draft, string>(key, {
        beforeStorage: JSON.stringify,
        beforeUsage: (value) => JSON.parse(value) as Draft,
        getItem: (k) => Promise.resolve(data.get(k)),
        removeItem: (k) => void data.delete(k),
        setItem: (k, v) => void data.set(k, v),
        watch: (listener) => {
          notify = listener;
          return () => {};
        },
      });
      const persistor = persist(store, adapter);

      await persistor.hydrate();
      data.set(key, JSON.stringify({ lines: ["b"] }));
      notify({ removed: false });
      await vi.waitFor(() => expect(store.$get().lines).toEqual(["b"]));

      notify({ removed: true });
      expect(store.$get()).toBe(initial);
    });

    it("stops following on dispose", () => {
      const store = primitive<Draft>(initial);
      const persistor = persist(store, localAdapter<Draft>(key));
      persistor.dispose();
      localStorage.setItem(key, JSON.stringify({ lines: ["late"] }));
      dispatch({ key, newValue: "x" });
      expect(store.$get()).toBe(initial);
    });
  });

  describe("async adapters", () => {
    it("hydrates once the read resolves and holds writes until then", async () => {
      const backing = new Map<string, Draft>([[key, { lines: ["async"] }]]);
      const adapter = asyncAdapter<Draft>(key, {
        getItem: (k) => Promise.resolve(backing.get(k)),
        removeItem: (k) => void backing.delete(k),
        setItem: (k, v) => void backing.set(k, v),
      });
      const store = primitive<Draft>(initial);
      const persistor = persist(store, adapter);

      store.$set({ lines: [], note: "early" });
      expect(backing.get(key)).toEqual({ lines: ["async"] });

      await persistor.hydrate();
      expect(persistor.hydrated.$get()).toBe(true);
      expect(store.$get().lines).toEqual(["async"]);
    });
  });

  describe("dispose", () => {
    it("stops writing and is idempotent", () => {
      const store = primitive<Draft>(initial);
      const persistor = persist(store, localAdapter<Draft>(key));
      persistor.dispose();
      persistor.dispose();
      store.$set({ lines: [], note: "after" });
      expect(localStorage.getItem(key)).toBeNull();
    });

    it("stops writing when the store is disposed", () => {
      const store = primitive<Draft>(initial);
      persist(store, localAdapter<Draft>(key));
      store.$set({ lines: [], note: "before" });
      store.$dispose();
      localStorage.removeItem(key);
      store.$set({ lines: [], note: "after" });
      expect(localStorage.getItem(key)).toBeNull();
    });

    it("does not hydrate a store that is already disposed", async () => {
      const store = primitive<Draft>(initial);
      const persistor = persist(store, localAdapter<Draft>(key), {
        skipHydration: true,
      });
      store.$dispose();
      await persistor.hydrate();
      expect(persistor.hydrated.$get()).toBe(false);
    });
  });
});

describe("persist on a composite", () => {
  it("hydrates by replacing, so a branch the stored state omits keeps its initial value", () => {
    localStorage.setItem(key, JSON.stringify({ a: 5 }));
    const store = composite({ a: 1, b: 2 });
    persist(store, localAdapter<{ a: number; b: number }>(key));
    expect(store.$get()).toEqual({ a: 5, b: 2 });
  });

  it("writes the composite's state, without methods", () => {
    const store = composite({ bump() {}, n: 1 });
    persist(store, localAdapter<{ n: number }>(key));
    store.n.$set(2);
    expect(read()).toEqual({ n: 2 });
  });

  it("resets a composite on removal, writing nothing", () => {
    const store = composite({ a: 1, inner: composite({ b: 1 }) });
    persist(store, localAdapter<{ a: number; inner: { b: number } }>(key));
    store.$set({ a: 5, inner: { b: 5 } });
    localStorage.removeItem(key);
    const setItem = vi.spyOn(localStorage, "setItem");

    dispatch({ key, newValue: null });

    expect(store.$get()).toEqual({ a: 1, inner: { b: 1 } });
    expect(setItem).not.toHaveBeenCalled();
  });

  it("persists a branch on its own", () => {
    const store = composite({
      cart: composite({ items: primitive<string[]>([]) }),
    });
    persist(store.cart, localAdapter<{ items: string[] }>("cart"));
    store.cart.items.$set(["a"]);
    expect(read("cart")).toEqual({ items: ["a"] });
  });
});

describe("persist on a collection", () => {
  function make() {
    return collection((id: string) =>
      composite({ lines: primitive<string[]>([]), note: "" })
    );
  }
  type Entry = { lines: string[]; note: string };

  it("persists every entry under its own key, hydrating it as it is made", () => {
    localStorage.setItem(
      "draft:acme",
      JSON.stringify({ lines: ["a"], note: "n" })
    );
    const drafts = make();
    persist(drafts, (id) => localAdapter<Entry>(`draft:${id}`));

    expect(drafts("acme").lines.$get()).toEqual(["a"]);
    drafts("zed").note.$set("hi");
    expect(read("draft:zed")).toEqual({ lines: [], note: "hi" });
    expect(localStorage.getItem("draft:acme")).toBe(
      JSON.stringify({ lines: ["a"], note: "n" })
    );
  });

  it("hydrates an entry silently: reading it notifies nobody", () => {
    localStorage.setItem(
      "draft:acme",
      JSON.stringify({ lines: ["a"], note: "n" })
    );
    const drafts = make();
    persist(drafts, (id) => localAdapter<Entry>(`draft:${id}`));
    const listener = vi.fn();
    drafts.$subscribe(listener, { immediate: false });
    drafts("acme");
    expect(listener).not.toHaveBeenCalled();
  });

  it("tracks entries that already exist", () => {
    const drafts = make();
    drafts("old");
    persist(drafts, (id) => localAdapter<Entry>(`draft:${id}`));
    drafts("old").note.$set("x");
    expect(read("draft:old").note).toBe("x");
  });

  it("stops an entry's writes when it is disposed", () => {
    const drafts = make();
    persist(drafts, (id) => localAdapter<Entry>(`draft:${id}`));
    const entry = drafts("acme");
    entry.note.$set("one");
    drafts.$delete("acme");
    localStorage.removeItem("draft:acme");
    entry.note.$set("two");
    expect(localStorage.getItem("draft:acme")).toBeNull();
  });

  it("waits for hydrate() with skipHydration, entries included", async () => {
    localStorage.setItem(
      "draft:acme",
      JSON.stringify({ lines: ["a"], note: "n" })
    );
    const drafts = make();
    const persistor = persist(
      drafts,
      (id) => localAdapter<Entry>(`draft:${id}`),
      { skipHydration: true }
    );
    expect(drafts("acme").lines.$get()).toEqual([]);
    expect(persistor.hydrated.$get()).toBe(false);

    await persistor.hydrate();
    expect(drafts("acme").lines.$get()).toEqual(["a"]);
    expect(persistor.hydrated.$get()).toBe(true);
  });

  it("stops everything on dispose", () => {
    const drafts = make();
    const persistor = persist(drafts, (id) =>
      localAdapter<Entry>(`draft:${id}`)
    );
    persistor.dispose();
    drafts("acme").note.$set("x");
    expect(localStorage.getItem("draft:acme")).toBeNull();
  });
});
