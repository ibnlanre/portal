import { describe, expect, it } from "vitest";

import { asyncAdapter } from "./index";

function memory<Value>(initial: Record<string, Value> = {}) {
  const data = new Map<string, Value>(Object.entries(initial));
  return {
    data,
    getItem: (key: string) => Promise.resolve(data.get(key)),
    removeItem: (key: string) => void data.delete(key),
    setItem: (key: string, value: Value) => void data.set(key, value),
  };
}

describe("asyncAdapter format options", () => {
  it("wraps the value given to beforeStorage when versioned", async () => {
    const storage = memory<unknown>();
    const [get, set] = asyncAdapter<{ a: number }, unknown>("fmt", {
      ...storage,
      version: 2,
    });
    await set({ a: 1 });
    expect(storage.data.get("fmt")).toEqual({ $version: 2, state: { a: 1 } });
    expect(await get()).toEqual({ a: 1 });
  });

  it("migrates an envelope of another version, and ignores a bare value", async () => {
    const storage = memory<unknown>({
      fmt: { $version: 0, state: { a: 1 } },
    });
    const [get] = asyncAdapter<{ a: number; b?: number }, unknown>("fmt", {
      ...storage,
      migrate: (stored, from) => ({ ...(stored as { a: number }), b: from }),
      version: 1,
    });
    expect(await get()).toEqual({ a: 1, b: 0 });

    storage.data.set("fmt", { a: 1 });
    expect(await get({ a: 9 })).toEqual({ a: 9 });
  });

  it("falls back when beforeUsage yields nothing", async () => {
    const storage = memory<string>({ fmt: "gone" });
    const [get] = asyncAdapter<string, string>("fmt", {
      ...storage,
      beforeUsage: () => undefined as unknown as string,
    });
    expect(await get("fallback")).toBe("fallback");
  });
});
