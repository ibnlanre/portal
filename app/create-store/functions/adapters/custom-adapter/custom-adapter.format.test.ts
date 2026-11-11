import { describe, expect, it, vi } from "vitest";

import { watcherOf } from "@/create-store/functions/helpers/watchers";

import { customAdapter } from "./index";

function memory() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    removeItem: (key: string) => void data.delete(key),
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

describe("customAdapter format options", () => {
  it("writes an envelope when versioned and reads it back", () => {
    const storage = memory();
    const [get, set] = customAdapter<{ a: number }>("fmt", {
      ...storage,
      version: 3,
    });
    set({ a: 1 });
    expect(JSON.parse(storage.getItem("fmt")!)).toEqual({
      $version: 3,
      state: { a: 1 },
    });
    expect(get()).toEqual({ a: 1 });
  });

  it("migrates an envelope of another version, ignores a bare value and an unmigratable version", () => {
    const storage = memory();
    storage.setItem("fmt", JSON.stringify({ $version: 0, state: { a: 1 } }));
    const [get] = customAdapter<{ a: number; b?: number }>("fmt", {
      ...storage,
      migrate: (stored, from) => ({ ...(stored as { a: number }), b: from }),
      version: 1,
    });
    expect(get()).toEqual({ a: 1, b: 0 });

    storage.setItem("fmt", JSON.stringify({ a: 1 }));
    expect(get({ a: 0, b: 0 })).toEqual({ a: 0, b: 0 });

    storage.setItem("fmt", JSON.stringify({ $version: 9, state: { a: 9 } }));
    const [strict] = customAdapter<{ a: number }>("fmt", {
      ...storage,
      version: 1,
    });
    expect(strict({ a: 0 })).toEqual({ a: 0 });
  });

  it("registers a supplied watcher, and none without one", () => {
    const watch = vi.fn(() => () => {});
    const withWatch = customAdapter<number>("w", {
      ...memory(),
      watch,
    });
    expect(watcherOf(withWatch)).toBe(watch);
    expect(watcherOf(customAdapter<number>("w", memory()))).toBeUndefined();
  });
});
