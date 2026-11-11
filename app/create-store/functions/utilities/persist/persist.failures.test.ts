import { afterEach, describe, expect, it, vi } from "vitest";

import { asyncAdapter } from "@/create-store/functions/adapters/async-adapter";
import { localAdapter } from "@/create-store/functions/adapters/local-adapter";
import { collection } from "@/create-store/functions/library/collection";
import { composite } from "@/create-store/functions/library/composite";
import { primitive } from "@/create-store/functions/library/primitive";

import { persist } from "./index";

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

function dispatch(init: StorageEventInit) {
  window.dispatchEvent(new StorageEvent("storage", init));
}

describe("persist when the adapter fails", () => {
  it("treats a rejected read as nothing stored: logged, hydrated, and a later edit is saved", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const setItem = vi.fn();
    const adapter = asyncAdapter<number>("n", {
      getItem: () => Promise.reject(new Error("offline")),
      removeItem: () => {},
      setItem,
    });
    const store = primitive(1);
    const persistor = persist(store, adapter);
    await vi.waitFor(() => expect(persistor.hydrated.$get()).toBe(true));
    expect(error).toHaveBeenCalledTimes(1);
    expect(store.$get()).toBe(1);
    expect(setItem).not.toHaveBeenCalled();

    store.$set(2);
    expect(setItem).toHaveBeenCalledWith("n", 2);
  });

  it("saves a value set before the failed read settled, since nothing was stored", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const setItem = vi.fn();
    const adapter = asyncAdapter<number>("n", {
      getItem: () => Promise.reject(new Error("offline")),
      removeItem: () => {},
      setItem,
    });
    const store = primitive(1);
    const persistor = persist(store, adapter);
    store.$set(5);
    await persistor.hydrate();
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(setItem).toHaveBeenCalledWith("n", 5);
  });

  it("treats a read that throws synchronously the same way", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const setItem = vi.fn();
    const store = primitive(1);
    const persistor = persist(store, [
      () => {
        throw new Error("blocked");
      },
      setItem,
    ]);
    expect(persistor.hydrated.$get()).toBe(true);
    expect(error).toHaveBeenCalledTimes(1);
    store.$set(2);
    expect(setItem).toHaveBeenCalledWith(2);
  });

  it("one failed entry does not keep the collection unhydrated, and it writes afterwards", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const setItem = vi.fn();
    const drafts = collection((id: string) => primitive(id));
    drafts("bad");
    const persistor = persist(drafts, (id) =>
      asyncAdapter<string>(`k:${id}`, {
        getItem: () => Promise.reject(new Error("offline")),
        removeItem: () => {},
        setItem,
      })
    );
    await vi.waitFor(() => expect(persistor.hydrated.$get()).toBe(true));
    drafts("bad").$set("edited");
    expect(setItem).toHaveBeenCalledWith("k:bad", "edited");
  });

  it("reports a setter that throws, without failing the write", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const store = primitive(1);
    persist(store, [
      () => undefined,
      () => {
        throw new Error("full");
      },
    ]);
    expect(() => store.$set(2)).not.toThrow();
    expect(store.$get()).toBe(2);
    expect(error).toHaveBeenCalledTimes(1);
  });

  it("reports a setter that rejects, without an unhandled rejection", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const store = primitive(1);
    persist(store, [() => undefined, () => Promise.reject(new Error("full"))]);
    store.$set(2);
    await vi.waitFor(() => expect(error).toHaveBeenCalledTimes(1));
    expect(store.$get()).toBe(2);
  });
});

describe("persist on a collection", () => {
  type Entry = { lines: string[]; note: string };
  const make = () =>
    collection((id: string) =>
      composite({ lines: primitive<string[]>([]), note: id })
    );
  const adapterFor = (id: string) => localAdapter<Entry>(`draft:${id}`);

  it("makes an entry after hydration hydrate as it is made", async () => {
    const drafts = make();
    const persistor = persist(drafts, adapterFor);
    await persistor.hydrate();
    expect(persistor.hydrated.$get()).toBe(true);

    localStorage.setItem(
      "draft:late",
      JSON.stringify({ lines: ["l"], note: "n" })
    );
    expect(drafts("late").lines.$get()).toEqual(["l"]);
    drafts("late").note.$set("edited");
    expect(JSON.parse(localStorage.getItem("draft:late")!).note).toBe("edited");
  });

  it("flips hydrated after the entries that existed have hydrated", async () => {
    localStorage.setItem(
      "draft:a",
      JSON.stringify({ lines: ["a"], note: "n" })
    );
    const drafts = make();
    drafts("a");
    const persistor = persist(drafts, adapterFor, { skipHydration: true });
    expect(persistor.hydrated.$get()).toBe(false);
    expect(drafts("a").lines.$get()).toEqual([]);

    await persistor.hydrate();

    expect(persistor.hydrated.$get()).toBe(true);
    expect(drafts("a").lines.$get()).toEqual(["a"]);
  });

  it("follows each entry by default", () => {
    const drafts = make();
    persist(drafts, adapterFor);
    const entry = drafts("acme");
    entry.note.$set("edited");
    localStorage.removeItem("draft:acme");

    dispatch({ key: "draft:acme", newValue: null });

    expect(entry.$get()).toEqual({ lines: [], note: "acme" });
    expect(localStorage.getItem("draft:acme")).toBeNull();
  });

  it("stops following a disposed entry", () => {
    const drafts = make();
    persist(drafts, adapterFor);
    const entry = drafts("acme");
    entry.note.$set("edited");
    drafts.$delete("acme");
    entry.note.$set("after");
    dispatch({ key: "draft:acme", newValue: null });
    expect(entry.note.$get()).toBe("acme");
  });
});
