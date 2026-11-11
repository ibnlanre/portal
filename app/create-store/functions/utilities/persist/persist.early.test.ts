import { describe, expect, it, vi } from "vitest";

import { asyncAdapter } from "@/create-store/functions/adapters/async-adapter";
import { collection } from "@/create-store/functions/library/collection";
import { primitive } from "@/create-store/functions/library/primitive";

import { persist } from "./index";

type Journal = { rows: number[] };

/** An async store of one stored value, whose reads resolve on the next tick. */
function backing(initial?: Journal) {
  const data = new Map<string, Journal>();
  if (initial) data.set("journal:a", initial);
  const setItem = vi.fn((key: string, value: Journal) => {
    data.set(key, value);
    return Promise.resolve();
  });
  const adapterFor = (id: string) =>
    asyncAdapter<Journal>(`journal:${id}`, {
      getItem: (key) => Promise.resolve(data.get(key)),
      removeItem: (key) => {
        data.delete(key);
        return Promise.resolve();
      },
      setItem,
    });
  return { adapterFor, data, setItem };
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("a change made before hydration finished", () => {
  it("is saved when storage holds nothing: an entry created and set in one tick", async () => {
    const { adapterFor, data, setItem } = backing();
    const journals = collection((_id: string) =>
      primitive<Journal>({ rows: [] })
    );
    persist(journals, adapterFor);

    const imported = { rows: [1, 2, 3] };
    journals.$set({ a: imported });
    await settle();

    expect(setItem).toHaveBeenCalledTimes(1);
    expect(setItem).toHaveBeenCalledWith("journal:a", imported);
    expect(data.get("journal:a")).toEqual(imported);
    expect(journals("a").$get()).toBe(imported);
  });

  it("is saved for a plain async store set before its read resolves", async () => {
    const { adapterFor, setItem } = backing();
    const store = primitive<Journal>({ rows: [] });
    const persistor = persist(store, adapterFor("a"));

    const next = { rows: [9] };
    store.$set(next);
    await persistor.hydrate();

    expect(setItem).toHaveBeenCalledTimes(1);
    expect(setItem).toHaveBeenCalledWith("journal:a", next);
    expect(persistor.hydrated.$get()).toBe(true);
  });

  it("is saved once, and a later equal write is not repeated", async () => {
    const { adapterFor, setItem } = backing();
    const store = primitive<Journal>({ rows: [] });
    const persistor = persist(store, adapterFor("a"));
    const next = { rows: [1] };
    store.$set(next);
    await persistor.hydrate();
    store.$set(next);
    await settle();
    expect(setItem).toHaveBeenCalledTimes(1);
  });

  it("stored wins when storage holds a value: applied, nothing written", async () => {
    const stored = { rows: [7] };
    const { adapterFor, setItem } = backing(stored);
    const journals = collection((_id: string) =>
      primitive<Journal>({ rows: [] })
    );
    persist(journals, adapterFor);

    journals.$set({ a: { rows: [1, 2, 3] } });
    await settle();

    expect(journals("a").$get()).toEqual(stored);
    expect(setItem).not.toHaveBeenCalled();
  });

  it("writes nothing when the store never changed and storage is empty", async () => {
    const { adapterFor, setItem } = backing();
    const store = primitive<Journal>({ rows: [] });
    const persistor = persist(store, adapterFor("a"));
    await persistor.hydrate();
    expect(setItem).not.toHaveBeenCalled();
  });

  it("with skipHydration, a change before hydrate() is saved when storage is empty", async () => {
    const { adapterFor, setItem } = backing();
    const store = primitive<Journal>({ rows: [] });
    const persistor = persist(store, adapterFor("a"), { skipHydration: true });
    const next = { rows: [5] };
    store.$set(next);
    expect(setItem).not.toHaveBeenCalled();
    await persistor.hydrate();
    expect(setItem).toHaveBeenCalledWith("journal:a", next);
  });
});
