import { afterEach, describe, expect, it, vi } from "vitest";

import { createLocalStorageAdapter } from "./index";

const getItem = vi.spyOn(localStorage, "getItem");
const setItem = vi.spyOn(localStorage, "setItem");
const removeItem = vi.spyOn(localStorage, "removeItem");

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("createLocalStorageAdapter", () => {
  const key = "test-key";

  it("should get state from localStorage", () => {
    const initialState = { state: "value" };
    localStorage.setItem(key, JSON.stringify(initialState));

    const [getLocalStorageState] =
      createLocalStorageAdapter<typeof initialState>(key);
    const state = getLocalStorageState();

    expect(state).toEqual(initialState);
    expect(getItem).toHaveBeenCalledWith(key);
  });

  it("should return fallback state if localStorage is empty", () => {
    const fallbackState = { state: "fallback" };

    const [getLocalStorageState] =
      createLocalStorageAdapter<typeof fallbackState>(key);
    const state = getLocalStorageState(fallbackState);

    expect(state).toEqual(fallbackState);
    expect(getItem).toHaveBeenCalledWith(key);
  });

  it("should set state to localStorage", () => {
    const newState = { state: "new value" };

    const [, setLocalStorageState] =
      createLocalStorageAdapter<typeof newState>(key);
    setLocalStorageState(newState);

    expect(setItem).toHaveBeenCalledWith(key, JSON.stringify(newState));
    expect(localStorage.getItem(key)).toBe(JSON.stringify(newState));
  });

  it("should remove state from localStorage when value is undefined", () => {
    localStorage.setItem(key, JSON.stringify({ state: "value" }));

    const [, setLocalStorageState] = createLocalStorageAdapter(key);
    setLocalStorageState(undefined);

    expect(removeItem).toHaveBeenCalledWith(key);
    expect(localStorage.getItem(key)).toBeNull();
  });

  it("should handle custom stringify and parse functions", () => {
    const newState = { state: "new value" };
    const customStringify = vi.fn(JSON.stringify);
    const customParse = vi.fn(JSON.parse);

    const [getLocalStorageState, setLocalStorageState] =
      createLocalStorageAdapter<typeof newState>(key, {
        parse: customParse,
        stringify: customStringify,
      });

    setLocalStorageState(newState);
    expect(customStringify).toHaveBeenCalledWith(newState);
    expect(setItem).toHaveBeenCalledWith(key, JSON.stringify(newState));

    const state = getLocalStorageState();
    expect(customParse).toHaveBeenCalledWith(JSON.stringify(newState));
    expect(state).toEqual(newState);
  });

  it("should call setLocalStorageState without errors when value is undefined", () => {
    const [, setLocalStorageState] = createLocalStorageAdapter(key);
    expect(() => setLocalStorageState(undefined)).not.toThrow();
  });
});

describe("createLocalStorageAdapter where the browser refuses storage", () => {
  const key = "refused-key";

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the fallback when reading throws", () => {
    vi.spyOn(localStorage, "getItem").mockImplementation(() => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    });
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    const [getLocalStorageState] = createLocalStorageAdapter<number>(key);

    expect(getLocalStorageState(7)).toBe(7);
    expect(getLocalStorageState()).toBeUndefined();
    expect(error).toHaveBeenCalled();
  });

  it("drops a write the browser refuses, without throwing", () => {
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new DOMException(
        "The quota has been exceeded.",
        "QuotaExceededError"
      );
    });
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    const [, setLocalStorageState] = createLocalStorageAdapter<number>(key);

    expect(() => setLocalStorageState(1)).not.toThrow();
    expect(error).toHaveBeenCalled();
  });

  it("drops a removal the browser refuses, without throwing", () => {
    vi.spyOn(localStorage, "removeItem").mockImplementation(() => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    });
    vi.spyOn(console, "error").mockImplementation(() => {});

    const [, setLocalStorageState] = createLocalStorageAdapter<number>(key);

    expect(() => setLocalStorageState(undefined)).not.toThrow();
  });

  it("still surfaces a custom stringify's own error", () => {
    const [, setLocalStorageState] = createLocalStorageAdapter<number>(key, {
      stringify: () => {
        throw new Error("cannot serialise");
      },
    });

    expect(() => setLocalStorageState(1)).toThrow("cannot serialise");
  });
});
