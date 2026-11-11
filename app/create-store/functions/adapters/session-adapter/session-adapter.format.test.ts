import { afterEach, describe, expect, it, vi } from "vitest";

import { watcherOf } from "@/create-store/functions/helpers/watchers";

import { sessionAdapter } from "./index";

afterEach(() => {
  sessionStorage.clear();
});

describe("sessionAdapter format options", () => {
  it("writes an envelope when versioned and migrates other versions", () => {
    const [get, set] = sessionAdapter<{ a: number; b?: number }>("fmt", {
      migrate: (stored, from) => ({ ...(stored as { a: number }), b: from }),
      version: 1,
    });
    sessionStorage.setItem(
      "fmt",
      JSON.stringify({ $version: 0, state: { a: 1 } })
    );
    expect(get()).toEqual({ a: 1, b: 0 });

    set({ a: 2 });
    expect(JSON.parse(sessionStorage.getItem("fmt")!)).toEqual({
      $version: 1,
      state: { a: 2 },
    });
    expect(get()).toEqual({ a: 2 });
  });

  it("treats a bare stored value as absent when versioned", () => {
    sessionStorage.setItem("fmt", JSON.stringify({ a: 1 }));
    const [get] = sessionAdapter<{ a: number }>("fmt", {
      version: 1,
    });
    expect(get({ a: 9 })).toEqual({ a: 9 });
  });
});

describe("session storage watch", () => {
  it("is per tab by design: it has no watcher", () => {
    expect(watcherOf(sessionAdapter<number>("w"))).toBeUndefined();
  });

  it("still destructures as a [get, set] pair", () => {
    const [get, set] = sessionAdapter<number>("pair");
    set(2);
    expect(get()).toBe(2);
  });
});
