import { afterEach, describe, expect, it, vi } from "vitest";

import { fakeBroadcastChannel } from "@/create-store/functions/helpers/channel/fake-broadcast-channel";
import { primitive } from "@/create-store/functions/library/primitive";
import { persist } from "@/create-store/functions/utilities/persist";

import { asyncAdapter } from "./index";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

type Draft = { note: string };

function tab(
  data: Map<string, Draft>,
  options: {
    setItem?: (key: string, value: Draft) => Promise<void>;
  } = {}
) {
  const calls = { setItem: vi.fn() };
  const adapter = asyncAdapter<Draft>("draft", {
    getItem: (key) => Promise.resolve(data.get(key)),
    removeItem: (key) => {
      data.delete(key);
      return Promise.resolve();
    },
    setItem:
      options.setItem ??
      ((key, value) => {
        calls.setItem(key, value);
        data.set(key, value);
        return Promise.resolve();
      }),
    watch: true,
  });
  return { adapter, calls };
}

describe("asyncAdapter watch", () => {
  it("a write through one adapter reaches a persisted store on the other, and nothing is written back", async () => {
    fakeBroadcastChannel();
    const data = new Map<string, Draft>();
    const a = tab(data);
    const b = tab(data);
    const store = primitive<Draft>({ note: "" });
    const persistor = persist(store, b.adapter);
    await persistor.hydrate();

    await a.adapter[1]({ note: "from a" });

    await vi.waitFor(() => expect(store.$get()).toEqual({ note: "from a" }));
    expect(b.calls.setItem).not.toHaveBeenCalled();
  });

  it("a removal resets the other store without writing back", async () => {
    fakeBroadcastChannel();
    const data = new Map<string, Draft>();
    const a = tab(data);
    const b = tab(data);
    const initial: Draft = { note: "" };
    const store = primitive<Draft>(initial);
    const persistor = persist(store, b.adapter);
    await persistor.hydrate();
    await a.adapter[1]({ note: "x" });
    await vi.waitFor(() => expect(store.$get()).toEqual({ note: "x" }));

    await a.adapter[1](undefined);

    await vi.waitFor(() => expect(store.$get()).toBe(initial));
    expect(b.calls.setItem).not.toHaveBeenCalled();
  });

  it("posts only after the write resolves, and not when it rejects", async () => {
    fakeBroadcastChannel();
    const data = new Map<string, Draft>();
    const heard = vi.fn();
    const watcherTab = tab(data);
    const store = primitive<Draft>({ note: "" });
    persist(store, watcherTab.adapter);
    store.$subscribe(heard, { immediate: false });

    let release: () => void = () => {};
    const slow = tab(data, {
      setItem: (key, value) =>
        new Promise<void>((resolve) => {
          release = () => {
            data.set(key, value);
            resolve();
          };
        }),
    });
    const pending = slow.adapter[1]({ note: "slow" });
    await Promise.resolve();
    expect(heard).not.toHaveBeenCalled();
    release();
    await pending;
    await vi.waitFor(() => expect(heard).toHaveBeenCalledTimes(1));

    heard.mockClear();
    const failing = tab(data, {
      setItem: () => Promise.reject(new Error("no")),
    });
    await expect(failing.adapter[1]({ note: "lost" })).rejects.toThrow("no");
    expect(heard).not.toHaveBeenCalled();
  });

  it("a function watch is registered as given and posts nothing", async () => {
    const fake = fakeBroadcastChannel();
    const data = new Map<string, Draft>();
    let listen: (change: { removed: boolean }) => void = () => {};
    const adapter = asyncAdapter<Draft>("draft", {
      getItem: (key) => Promise.resolve(data.get(key)),
      removeItem: (key) => {
        data.delete(key);
        return Promise.resolve();
      },
      setItem: (key, value) => {
        data.set(key, value);
        return Promise.resolve();
      },
      watch: (listener) => {
        listen = listener;
        return () => {};
      },
    });
    const store = primitive<Draft>({ note: "" });
    await persist(store, adapter).hydrate();

    data.set("draft", { note: "elsewhere" });
    listen({ removed: false });
    await vi.waitFor(() => expect(store.$get()).toEqual({ note: "elsewhere" }));

    await adapter[1]({ note: "mine" });
    expect(fake.open.size).toBe(0);
  });
});
