import { describe, expect, it } from "vitest";

import { createStorageWatcher } from "./index";

describe("createStorageWatcher without a window", () => {
  it("returns a no-op cleanup", () => {
    const stop = createStorageWatcher("k", () => {
      throw new Error("unreachable");
    })(() => {});
    expect(() => stop()).not.toThrow();
  });
});
