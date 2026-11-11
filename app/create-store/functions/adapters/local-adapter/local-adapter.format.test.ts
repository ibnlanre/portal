import { afterEach, describe, expect, it, vi } from "vitest";

import { watcherOf } from "@/create-store/functions/helpers/watchers";

import { localAdapter } from "./index";

afterEach(() => {
  localStorage.clear();
});

describe("localAdapter format options", () => {
  it("writes an envelope when versioned and reads it back", () => {
    const [get, set] = localAdapter<{ a: number }>("fmt", {
      version: 2,
    });
    set({ a: 1 });
    expect(JSON.parse(localStorage.getItem("fmt")!)).toEqual({
      $version: 2,
      state: { a: 1 },
    });
    expect(get()).toEqual({ a: 1 });
  });

  it("migrates an envelope of another version", () => {
    localStorage.setItem(
      "fmt",
      JSON.stringify({ $version: 0, state: { a: 1 } })
    );
    const [get] = localAdapter<{ a: number; b?: number }>("fmt", {
      migrate: (stored, from) => ({ ...(stored as { a: number }), b: from }),
      version: 1,
    });
    expect(get()).toEqual({ a: 1, b: 0 });
  });

  it("treats a bare stored value as absent when versioned", () => {
    localStorage.setItem("fmt", JSON.stringify({ a: 1 }));
    const migrate = vi.fn();
    const [get] = localAdapter<{ a: number }>("fmt", {
      migrate,
      version: 1,
    });
    expect(get({ a: 9 })).toEqual({ a: 9 });
    expect(migrate).not.toHaveBeenCalled();
  });

  it("does not unwrap an envelope when unversioned", () => {
    localStorage.setItem("fmt", JSON.stringify({ $version: 1, state: 5 }));
    const [get] = localAdapter<unknown>("fmt");
    expect(get()).toEqual({ $version: 1, state: 5 });
  });

  it("treats unparsable text and an empty string as absent", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const [get] = localAdapter<number>("fmt");
    localStorage.setItem("fmt", "not json");
    expect(get(7)).toBe(7);
    localStorage.setItem("fmt", "");
    expect(get(7)).toBe(7);
    expect(get()).toBeUndefined();
  });

  it("falls back when the stored version cannot be migrated", () => {
    localStorage.setItem("fmt", JSON.stringify({ $version: 9, state: 1 }));
    const [get] = localAdapter<number>("fmt", { version: 1 });
    expect(get(5)).toBe(5);
  });

  it("leaves unversioned adapters writing bare values", () => {
    const [, set] = localAdapter<number>("fmt");
    set(3);
    expect(localStorage.getItem("fmt")).toBe("3");
  });
});

describe("local storage watch", () => {
  it("reports changes and removals for its key only", () => {
    const watch = watcherOf(localAdapter<number>("w"))!;
    const listener = vi.fn();
    const stop = watch(listener);

    window.dispatchEvent(new StorageEvent("storage", { key: "other" }));
    window.dispatchEvent(
      new StorageEvent("storage", { key: "w", newValue: "1" })
    );
    window.dispatchEvent(
      new StorageEvent("storage", { key: "w", newValue: null })
    );
    window.dispatchEvent(new StorageEvent("storage", { key: null }));

    expect(listener.mock.calls).toEqual([
      [{ removed: false }],
      [{ removed: true }],
      [{ removed: true }],
    ]);

    stop();
    window.dispatchEvent(
      new StorageEvent("storage", { key: "w", newValue: "2" })
    );
    expect(listener).toHaveBeenCalledTimes(3);
  });
});
