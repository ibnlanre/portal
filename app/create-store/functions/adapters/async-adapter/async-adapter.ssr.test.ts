import { afterEach, describe, expect, it, vi } from "vitest";

import { primitive } from "@/create-store/functions/library/primitive";
import { persist } from "@/create-store/functions/utilities/persist";

import { asyncAdapter } from "./index";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("asyncAdapter watch: true without BroadcastChannel", () => {
  it("posts nothing, follows nothing, and does not throw", async () => {
    vi.stubGlobal("BroadcastChannel", undefined);
    const data = new Map<string, number>();
    const adapter = asyncAdapter<number>("n", {
      getItem: (key) => Promise.resolve(data.get(key)),
      removeItem: (key) => {
        data.delete(key);
        return Promise.resolve();
      },
      setItem: (key, value) => {
        data.set(key, value);
        return Promise.resolve();
      },
      watch: true,
    });
    const store = primitive(1);
    const persistor = persist(store, adapter);
    await persistor.hydrate();
    expect(() => store.$set(2)).not.toThrow();
    await vi.waitFor(() => expect(data.get("n")).toBe(2));
    expect(() => persistor.dispose()).not.toThrow();
  });
});
