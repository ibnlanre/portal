import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { asyncAdapter } from "@/create-store/functions/adapters/async-adapter";
import { localAdapter } from "@/create-store/functions/adapters/local-adapter";
import { collection } from "@/create-store/functions/library/collection";
import { primitive } from "@/create-store/functions/library/primitive";

import { persist } from "./index";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  localStorage.clear();
});

function dispatch(init: StorageEventInit) {
  window.dispatchEvent(new StorageEvent("storage", init));
}

describe("persist { wait }", () => {
  it("without wait, writes happen at once (unchanged)", () => {
    const setItem = vi.spyOn(localStorage, "setItem");
    const store = primitive(0);
    persist(store, localAdapter<number>("n"));
    store.$set(1);
    store.$set(2);
    expect(setItem).toHaveBeenCalledTimes(2);
  });

  it("writes only the last value once the window has passed", () => {
    const setItem = vi.spyOn(localStorage, "setItem");
    const store = primitive(0);
    persist(store, localAdapter<number>("n"), { wait: 100 });

    store.$set(1);
    store.$set(2);
    store.$set(3);
    expect(setItem).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("n")).toBe("3");
  });

  it("is a trailing debounce: every change restarts the window", () => {
    const setItem = vi.spyOn(localStorage, "setItem");
    const store = primitive(0);
    persist(store, localAdapter<number>("n"), { wait: 100 });

    store.$set(1);
    vi.advanceTimersByTime(60);
    store.$set(2);
    vi.advanceTimersByTime(99);
    expect(setItem).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("n")).toBe("2");
  });

  it("flush() writes the pending value at once and nothing is written again later", async () => {
    const setItem = vi.spyOn(localStorage, "setItem");
    const store = primitive(0);
    const persistor = persist(store, localAdapter<number>("n"), { wait: 100 });

    store.$set(4);
    await persistor.flush();
    expect(localStorage.getItem("n")).toBe("4");

    vi.advanceTimersByTime(1000);
    expect(setItem).toHaveBeenCalledTimes(1);
  });

  it("flush() with nothing pending writes nothing", async () => {
    const setItem = vi.spyOn(localStorage, "setItem");
    const persistor = persist(primitive(0), localAdapter<number>("n"), {
      wait: 100,
    });
    await persistor.flush();
    expect(setItem).not.toHaveBeenCalled();
  });

  it("flush() resolves once an async adapter has stored the value", async () => {
    let stored: number | undefined;
    const adapter = asyncAdapter<number>("n", {
      getItem: () => Promise.resolve(stored),
      removeItem: () => {},
      setItem: async (_key, value) => {
        await Promise.resolve();
        stored = value;
      },
    });
    const store = primitive(0);
    const persistor = persist(store, adapter, { wait: 100 });
    await persistor.hydrate();

    store.$set(8);
    await persistor.flush();
    expect(stored).toBe(8);
  });

  it("persistor.dispose() flushes: no pending write is lost", () => {
    const store = primitive(0);
    const persistor = persist(store, localAdapter<number>("n"), { wait: 100 });
    store.$set(5);
    expect(localStorage.getItem("n")).toBeNull();
    persistor.dispose();
    expect(localStorage.getItem("n")).toBe("5");
    vi.advanceTimersByTime(1000);
    expect(localStorage.getItem("n")).toBe("5");
  });

  it("store.$dispose() flushes too", () => {
    const store = primitive(0);
    persist(store, localAdapter<number>("n"), { wait: 100 });
    store.$set(6);
    expect(localStorage.getItem("n")).toBeNull();
    store.$dispose();
    expect(localStorage.getItem("n")).toBe("6");
  });

  it("hydration and followed changes are not delayed, and are not written back", () => {
    localStorage.setItem("n", "1");
    const setItem = vi.spyOn(localStorage, "setItem");
    const store = primitive(0);
    persist(store, localAdapter<number>("n"), { wait: 100 });
    expect(store.$get()).toBe(1);

    localStorage.setItem("n", "9");
    setItem.mockClear();
    dispatch({ key: "n", newValue: "9", storageArea: localStorage });
    expect(store.$get()).toBe(9);

    vi.advanceTimersByTime(1000);
    expect(setItem).not.toHaveBeenCalled();
  });

  it("another tab's change during a pending window wins: the pending value is dropped", () => {
    const store = primitive(0);
    persist(store, localAdapter<number>("n"), { wait: 100 });

    store.$set(1);
    expect(localStorage.getItem("n")).toBeNull();
    localStorage.setItem("n", "7");
    dispatch({ key: "n", newValue: "7", storageArea: localStorage });
    expect(store.$get()).toBe(7);

    vi.advanceTimersByTime(1000);
    expect(localStorage.getItem("n")).toBe("7");
    expect(store.$get()).toBe(7);
  });

  it("a local edit after a followed change is still written", () => {
    const store = primitive(0);
    persist(store, localAdapter<number>("n"), { wait: 100 });
    localStorage.setItem("n", "7");
    dispatch({ key: "n", newValue: "7", storageArea: localStorage });
    store.$set(8);
    vi.advanceTimersByTime(100);
    expect(localStorage.getItem("n")).toBe("8");
  });

  it("debounces each entry of a collection on its own, and flush() writes all of them", async () => {
    const drafts = collection((id: string) => primitive(id));
    const persistor = persist(drafts, (id) => localAdapter<string>(`d:${id}`), {
      wait: 100,
    });
    drafts("a").$set("one");
    drafts("b").$set("two");
    expect(localStorage.getItem("d:a")).toBeNull();

    await persistor.flush();
    expect(localStorage.getItem("d:a")).toBe('"one"');
    expect(localStorage.getItem("d:b")).toBe('"two"');
  });
});
