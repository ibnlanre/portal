import { afterEach, describe, expect, it, vi } from "vitest";

import { cookieStorage } from "@/cookie-storage";
import { watcherOf } from "@/create-store/functions/helpers/watchers";

import { cookieAdapter } from "./index";

afterEach(() => {
  cookieStorage.clear();
});

describe("cookieAdapter format options", () => {
  it("writes an envelope when versioned and reads it back", () => {
    const [get, set] = cookieAdapter<{ a: number }>("fmt", {
      version: 2,
    });
    set({ a: 1 });
    expect(JSON.parse(cookieStorage.getItem("fmt")!)).toEqual({
      $version: 2,
      state: { a: 1 },
    });
    expect(get()).toEqual({ a: 1 });
  });

  it("migrates an envelope of another version, and ignores a bare value", () => {
    cookieStorage.setItem(
      "fmt",
      JSON.stringify({ $version: 0, state: { a: 1 } })
    );
    const [get] = cookieAdapter<{ a: number; b?: number }>("fmt", {
      migrate: (stored, from) => ({ ...(stored as { a: number }), b: from }),
      version: 1,
    });
    expect(get()).toEqual({ a: 1, b: 0 });

    cookieStorage.setItem("fmt", JSON.stringify({ a: 1 }));
    expect(get({ a: 9 })).toEqual({ a: 9 });
  });

  it("versions signed cookies too", () => {
    const [get, set] = cookieAdapter<number>("fmt", {
      secret: "s",
      signed: true,
      version: 1,
    });
    set(5);
    expect(get(0)).toBe(5);
  });

  it("has no watcher: cookies cannot announce changes", () => {
    expect(watcherOf(cookieAdapter<number>("w"))).toBeUndefined();
  });
});
