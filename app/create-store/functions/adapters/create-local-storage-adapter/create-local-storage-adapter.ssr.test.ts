import { describe, expect, it } from "vitest";

import { createLocalStorageAdapter } from "./index";

describe("createLocalStorageAdapter - Server-Side Rendering (Node Environment)", () => {
  const key = "test-key";

  it("should return fallback when localStorage is not available (SSR)", () => {
    const fallback = { state: "fallback" };
    const [getLocalStorageState] =
      createLocalStorageAdapter<typeof fallback>(key);

    const state = getLocalStorageState(fallback);
    expect(state).toEqual(fallback);
  });

  it("should return undefined fallback when no fallback is provided (SSR)", () => {
    const [getLocalStorageState] = createLocalStorageAdapter(key);

    const state = getLocalStorageState();
    expect(state).toBeUndefined();
  });

  it("should not throw when setting state (SSR)", () => {
    const [, setLocalStorageState] = createLocalStorageAdapter(key);

    expect(() => setLocalStorageState({ state: "value" })).not.toThrow();
  });
});
