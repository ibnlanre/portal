import { afterEach, describe, expect, it, vi } from "vitest";

import { createStorageWatcher } from "./index";

afterEach(() => {
  vi.restoreAllMocks();
});

function dispatch(init: StorageEventInit) {
  window.dispatchEvent(new StorageEvent("storage", init));
}

describe("createStorageWatcher", () => {
  it("reports changes and removals for its key, and clear()", () => {
    const listener = vi.fn();
    const stop = createStorageWatcher("k", () => localStorage)(listener);

    dispatch({ key: "other", newValue: "1" });
    dispatch({ key: "k", newValue: "1" });
    dispatch({ key: "k", newValue: null });
    dispatch({ key: null });

    expect(listener.mock.calls).toEqual([
      [{ removed: false }],
      [{ removed: true }],
      [{ removed: true }],
    ]);

    stop();
    dispatch({ key: "k", newValue: "2" });
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it("ignores events from another storage area", () => {
    const listener = vi.fn();
    createStorageWatcher("k", () => localStorage)(listener);
    dispatch({ key: "k", newValue: "1", storageArea: sessionStorage });
    expect(listener).not.toHaveBeenCalled();
  });

  it("ignores an event it cannot attribute where the area is refused", () => {
    const listener = vi.fn();
    createStorageWatcher("k", () => {
      throw new DOMException("denied", "SecurityError");
    })(listener);
    expect(() =>
      dispatch({ key: "k", newValue: "1", storageArea: localStorage })
    ).not.toThrow();
    expect(listener).not.toHaveBeenCalled();
  });
});
