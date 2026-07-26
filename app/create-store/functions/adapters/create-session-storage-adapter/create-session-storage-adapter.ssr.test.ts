import { describe, expect, it } from "vitest";

import { createSessionStorageAdapter } from "./index";

describe("createSessionStorageAdapter - Server-Side Rendering (Node Environment)", () => {
  const key = "test-key";

  it("should return fallback when sessionStorage is not available (SSR)", () => {
    const fallback = { state: "fallback" };
    const [getSessionStorageState] =
      createSessionStorageAdapter<typeof fallback>(key);

    const state = getSessionStorageState(fallback);
    expect(state).toEqual(fallback);
  });

  it("should return undefined fallback when no fallback is provided (SSR)", () => {
    const [getSessionStorageState] = createSessionStorageAdapter(key);

    const state = getSessionStorageState();
    expect(state).toBeUndefined();
  });

  it("should not throw when setting state (SSR)", () => {
    const [, setSessionStorageState] = createSessionStorageAdapter(key);

    expect(() => setSessionStorageState({ state: "value" })).not.toThrow();
  });
});
