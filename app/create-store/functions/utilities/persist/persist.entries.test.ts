import { afterEach, describe, expect, it, vi } from "vitest";

import { asyncAdapter } from "@/create-store/functions/adapters/async-adapter";
import { collection } from "@/create-store/functions/library/collection";
import { primitive } from "@/create-store/functions/library/primitive";

import { persist } from "./index";

afterEach(() => {
  vi.restoreAllMocks();
});

/** An async store whose reads wait until released (or failed) per key. */
function gated(stored: Record<string, string> = {}) {
  const gates = new Map<
    string,
    { fail: () => void; release: () => void; settled: Promise<void> }
  >();
  const adapterFor = (id: string) =>
    asyncAdapter<string>(`k:${id}`, {
      getItem: () => {
        let release = () => {};
        let fail = () => {};
        const read = new Promise<string | undefined>((resolve, reject) => {
          release = () => resolve(stored[id]);
          fail = () => reject(new Error(`offline ${id}`));
        });
        gates.set(id, {
          fail,
          release,
          settled: read.then(
            () => {},
            () => {}
          ),
        });
        return read;
      },
      removeItem: () => {},
      setItem: () => {},
    });
  const read = async (id: string, how: "fail" | "release" = "release") => {
    const gate = gates.get(id)!;
    gate[how]();
    await gate.settled;
    await new Promise((resolve) => setTimeout(resolve, 0));
  };
  return { adapterFor, read };
}

describe("persist(collection).hydratedOf(key)", () => {
  it("is a boolean store that flips when the entry's own read settles", async () => {
    const { adapterFor, read } = gated({ a: "stored a" });
    const drafts = collection((id: string) => primitive(id));
    drafts("a");
    drafts("b");
    const persistor = persist(drafts, adapterFor);

    const a = persistor.hydratedOf("a");
    const b = persistor.hydratedOf("b");
    expect(a.$get()).toBe(false);
    expect(b.$get()).toBe(false);

    await read("a");
    expect(a.$get()).toBe(true);
    expect(b.$get()).toBe(false);
    expect(drafts("a").$get()).toBe("stored a");

    await read("b");
    expect(b.$get()).toBe(true);
  });

  it("returns the same store for a key every time, and notifies once on the flip", async () => {
    const { adapterFor, read } = gated();
    const drafts = collection((id: string) => primitive(id));
    drafts("a");
    const persistor = persist(drafts, adapterFor);
    const flag = persistor.hydratedOf("a");
    expect(persistor.hydratedOf("a")).toBe(flag);

    const heard = vi.fn();
    flag.$subscribe(heard, { immediate: false });
    await read("a");
    expect(heard).toHaveBeenCalledTimes(1);
    expect(heard).toHaveBeenCalledWith(true);
  });

  it("a failed entry is hydrated with nothing stored, and is logged", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { adapterFor, read } = gated();
    const drafts = collection((id: string) => primitive(id));
    drafts("bad");
    const persistor = persist(drafts, adapterFor);

    await read("bad", "fail");

    expect(persistor.hydratedOf("bad").$get()).toBe(true);
    expect(drafts("bad").$get()).toBe("bad");
    expect(error).toHaveBeenCalledTimes(1);
  });

  it("an entry made later gets its own flag, which flips on its own read", async () => {
    const { adapterFor, read } = gated({ late: "stored late" });
    const drafts = collection((id: string) => primitive(id));
    drafts("a");
    const persistor = persist(drafts, adapterFor);
    await read("a");

    const late = persistor.hydratedOf("late");
    expect(late.$get()).toBe(false);

    drafts("late");
    expect(late.$get()).toBe(false);
    await read("late");
    expect(late.$get()).toBe(true);
    expect(drafts("late").$get()).toBe("stored late");
  });

  it("asking for a key that never gets an entry stays false", () => {
    const { adapterFor } = gated();
    const drafts = collection((id: string) => primitive(id));
    const persistor = persist(drafts, adapterFor);
    expect(persistor.hydratedOf("nobody").$get()).toBe(false);
  });

  it("a deleted entry's flag is not reused: a fresh entry starts false again", async () => {
    const { adapterFor, read } = gated();
    const drafts = collection((id: string) => primitive(id));
    drafts("a");
    const persistor = persist(drafts, adapterFor);
    await read("a");
    expect(persistor.hydratedOf("a").$get()).toBe(true);

    drafts.$delete("a");
    drafts("a");
    expect(persistor.hydratedOf("a").$get()).toBe(false);
    await read("a");
    expect(persistor.hydratedOf("a").$get()).toBe(true);
  });
});

describe("the collection-level hydrated flag, as documented", () => {
  it("flips once the entries that existed have settled, and never moves back", async () => {
    const { adapterFor, read } = gated();
    const drafts = collection((id: string) => primitive(id));
    drafts("a");
    drafts("b");
    const persistor = persist(drafts, adapterFor);
    expect(persistor.hydrated.$get()).toBe(false);

    await read("a");
    expect(persistor.hydrated.$get()).toBe(false);
    await read("b");
    expect(persistor.hydrated.$get()).toBe(true);

    drafts("late");
    expect(persistor.hydrated.$get()).toBe(true);
    expect(persistor.hydratedOf("late").$get()).toBe(false);
  });

  it("a failed entry does not hold it back", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { adapterFor, read } = gated();
    const drafts = collection((id: string) => primitive(id));
    drafts("a");
    drafts("bad");
    const persistor = persist(drafts, adapterFor);
    await read("a");
    await read("bad", "fail");
    expect(persistor.hydrated.$get()).toBe(true);
  });
});

describe("persist(collection, adapterFor, { keys })", () => {
  it("persistor.keys() says which keys exist in storage", async () => {
    const drafts = collection((id: string) => primitive(id));
    const persistor = persist(
      drafts,
      () =>
        asyncAdapter<string>("k", {
          getItem: () => Promise.resolve(undefined),
          removeItem: () => {},
          setItem: () => {},
        }),
      {
        keys: () => Promise.resolve(["a", "b"]),
      }
    );
    expect(await persistor.keys()).toEqual(["a", "b"]);
  });

  it("accepts a synchronous keys function", async () => {
    const drafts = collection((id: string) => primitive(id));
    const persistor = persist(
      drafts,
      () =>
        asyncAdapter<string>("k", {
          getItem: () => Promise.resolve(undefined),
          removeItem: () => {},
          setItem: () => {},
        }),
      { keys: () => ["x"] }
    );
    expect(await persistor.keys()).toEqual(["x"]);
  });

  it("without keys, persistor.keys() resolves to undefined: storage cannot say", async () => {
    const drafts = collection((id: string) => primitive(id));
    const persistor = persist(drafts, () =>
      asyncAdapter<string>("k", {
        getItem: () => Promise.resolve(undefined),
        removeItem: () => {},
        setItem: () => {},
      })
    );
    expect(await persistor.keys()).toBeUndefined();
  });

  it("a failing keys function rejects persistor.keys(); it is not swallowed", async () => {
    const drafts = collection((id: string) => primitive(id));
    const persistor = persist(
      drafts,
      () =>
        asyncAdapter<string>("k", {
          getItem: () => Promise.resolve(undefined),
          removeItem: () => {},
          setItem: () => {},
        }),
      { keys: () => Promise.reject(new Error("no index")) }
    );
    await expect(persistor.keys()).rejects.toThrow("no index");
  });
});
