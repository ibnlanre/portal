import type { Dictionary } from "@/create-store/types/dictionary";

import { describe, expect, it } from "vitest";
import { createSnapshot } from "./index";

describe("createSnapshot", () => {
  it("should create a snapshot of the given state", () => {
    const state: Dictionary = { a: 1, b: 2, c: 3 };
    const snapshot = createSnapshot(state);

    expect(snapshot).toEqual(state);
    expect(snapshot).not.toBe(state);
  });

  it("should preserve the prototype of the original state", () => {
    class State {
      a = 1;
      b = 2;
    }

    const state = new State();
    const snapshot = createSnapshot(<any>state);

    expect(Object.getPrototypeOf(snapshot)).toBe(State.prototype);
  });

  it("should include non-enumerable properties in the snapshot", () => {
    const state: Dictionary = {};
    Object.defineProperty(state, "a", {
      value: 1,
      enumerable: false,
    });

    const snapshot = createSnapshot(state);

    expect(snapshot).toHaveProperty("a", 1);
    expect(Object.getOwnPropertyDescriptor(snapshot, "a")?.enumerable).toBe(
      false
    );
  });
});
