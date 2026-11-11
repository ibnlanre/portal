import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { asyncAdapter } from "@/create-store/functions/adapters/async-adapter";
import { localAdapter } from "@/create-store/functions/adapters/local-adapter";
import { collection } from "@/create-store/functions/library/collection";
import { primitive } from "@/create-store/functions/library/primitive";

import { persist } from "./index";

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

const syncAdapter = (key: string) => localAdapter<string>(key);

/** An async adapter whose reads wait until `release(key)` is called. */
function gated() {
  const waiting = new Map<string, () => void>();
  const adapterFor = (id: string) =>
    asyncAdapter<string>(`k:${id}`, {
      getItem: () =>
        new Promise<string | undefined>((resolve) => {
          waiting.set(id, () => resolve(`stored ${id}`));
        }),
      removeItem: () => {},
      setItem: () => {},
    });
  return { adapterFor, release: (id: string) => waiting.get(id)!() };
}

describe("hydrated with synchronous adapters", () => {
  it("(a) a single store is hydrated as soon as persist returns", () => {
    const persistor = persist(primitive("a"), syncAdapter("single"));
    expect(persistor.hydrated.$get()).toBe(true);
  });

  it("(b) a collection with existing entries is hydrated as soon as persist returns", () => {
    const drafts = collection((id: string) => primitive(id));
    drafts("one");
    drafts("two");
    const persistor = persist(drafts, (id) => syncAdapter(`entry:${id}`));
    expect(persistor.hydrated.$get()).toBe(true);
  });

  it("(b) an empty collection is hydrated as soon as persist returns", () => {
    const drafts = collection((id: string) => primitive(id));
    const persistor = persist(drafts, (id) => syncAdapter(`entry:${id}`));
    expect(persistor.hydrated.$get()).toBe(true);
  });

  it("(b) hydrate() with skipHydration flips it before it returns, for sync adapters", () => {
    const drafts = collection((id: string) => primitive(id));
    drafts("one");
    const persistor = persist(drafts, (id) => syncAdapter(`entry:${id}`), {
      skipHydration: true,
    });
    expect(persistor.hydrated.$get()).toBe(false);
    void persistor.hydrate();
    expect(persistor.hydrated.$get()).toBe(true);
  });

  it("(c) a component gated on hydrated commits no not-hydrated frame, for a single store", () => {
    const persistor = persist(primitive("a"), syncAdapter("single"));
    const frames: boolean[] = [];
    function Gate() {
      const [hydrated] = persistor.hydrated.$use();
      frames.push(hydrated);
      return <span>{hydrated ? "ready" : "loading"}</span>;
    }
    const view = render(<Gate />);
    expect(frames).toEqual([true]);
    expect(view.container.textContent).toBe("ready");
  });

  it("(c) the same for a collection", () => {
    const drafts = collection((id: string) => primitive(id));
    drafts("one");
    const persistor = persist(drafts, (id) => syncAdapter(`entry:${id}`));
    const frames: boolean[] = [];
    function Gate() {
      const [hydrated] = persistor.hydrated.$use();
      frames.push(hydrated);
      return <span>{hydrated ? "ready" : "loading"}</span>;
    }
    const view = render(<Gate />);
    expect(frames).toEqual([true]);
    expect(view.container.textContent).toBe("ready");
  });
});

describe("hydrated with asynchronous adapters", () => {
  it("(d) stays false until every existing entry has resolved, then flips once", async () => {
    const { adapterFor, release } = gated();
    const drafts = collection((id: string) => primitive(id));
    drafts("one");
    drafts("two");
    const persistor = persist(drafts, adapterFor);
    const flips = vi.fn();
    persistor.hydrated.$subscribe(flips, { immediate: false });

    expect(persistor.hydrated.$get()).toBe(false);
    release("one");
    await Promise.resolve();
    await Promise.resolve();
    expect(persistor.hydrated.$get()).toBe(false);

    release("two");
    await vi.waitFor(() => expect(persistor.hydrated.$get()).toBe(true));
    expect(flips).toHaveBeenCalledTimes(1);
    expect(drafts("one").$get()).toBe("stored one");
    expect(drafts("two").$get()).toBe("stored two");
  });

  it("(d) an entry made later hydrates itself without moving the flag back", async () => {
    const { adapterFor, release } = gated();
    const drafts = collection((id: string) => primitive(id));
    const persistor = persist(drafts, adapterFor);
    await vi.waitFor(() => expect(persistor.hydrated.$get()).toBe(true));
    const flips = vi.fn();
    persistor.hydrated.$subscribe(flips, { immediate: false });

    const late = drafts("late");
    expect(persistor.hydrated.$get()).toBe(true);
    release("late");
    await vi.waitFor(() => expect(late.$get()).toBe("stored late"));
    expect(persistor.hydrated.$get()).toBe(true);
    expect(flips).not.toHaveBeenCalled();
  });

  it("(e) an entry whose read rejects still lets the flag flip, and the error is logged", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const drafts = collection((id: string) => primitive(id));
    drafts("bad");
    drafts("good");
    const persistor = persist(drafts, (id) =>
      asyncAdapter<string>(`k:${id}`, {
        getItem: () =>
          id === "bad"
            ? Promise.reject(new Error("offline"))
            : Promise.resolve("stored good"),
        removeItem: () => {},
        setItem: () => {},
      })
    );
    await vi.waitFor(() => expect(persistor.hydrated.$get()).toBe(true));
    expect(error).toHaveBeenCalledTimes(1);
    expect(drafts("good").$get()).toBe("stored good");
    expect(drafts("bad").$get()).toBe("bad");
  });

  it("(e) the same under skipHydration: hydrate() logs and the flag flips", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const drafts = collection((id: string) => primitive(id));
    drafts("bad");
    const persistor = persist(
      drafts,
      () =>
        asyncAdapter<string>("k", {
          getItem: () => Promise.reject(new Error("offline")),
          removeItem: () => {},
          setItem: () => {},
        }),
      { skipHydration: true }
    );
    await persistor.hydrate();
    expect(persistor.hydrated.$get()).toBe(true);
    expect(error).toHaveBeenCalledTimes(1);
  });
});
