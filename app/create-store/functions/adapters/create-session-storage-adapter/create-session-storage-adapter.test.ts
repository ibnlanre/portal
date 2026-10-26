import { afterEach, describe, expect, it, vi } from "vitest";

import { createSessionStorageAdapter } from "./index";

const getItem = vi.spyOn(sessionStorage, "getItem");
const setItem = vi.spyOn(sessionStorage, "setItem");
const removeItem = vi.spyOn(sessionStorage, "removeItem");

afterEach(() => {
  sessionStorage.clear();
  vi.clearAllMocks();
});

describe("createSessionStorageAdapter", () => {
  const key = "test-key";

  it("should get state from sessionStorage", () => {
    const initialState = { state: "value" };
    sessionStorage.setItem(key, JSON.stringify(initialState));

    const [getSessionStorageState] =
      createSessionStorageAdapter<typeof initialState>(key);
    const state = getSessionStorageState();

    expect(state).toEqual(initialState);
    expect(getItem).toHaveBeenCalledWith(key);
  });

  it("should return fallback state if sessionStorage is empty", () => {
    const fallbackState = { state: "fallback" };

    const [getSessionStorageState] =
      createSessionStorageAdapter<typeof fallbackState>(key);
    const state = getSessionStorageState(fallbackState);

    expect(state).toEqual(fallbackState);
    expect(getItem).toHaveBeenCalledWith(key);
  });

  it("should set state to sessionStorage", () => {
    const newState = { state: "new value" };

    const [, setSessionStorageState] =
      createSessionStorageAdapter<typeof newState>(key);
    setSessionStorageState(newState);

    expect(setItem).toHaveBeenCalledWith(key, JSON.stringify(newState));
    expect(sessionStorage.getItem(key)).toBe(JSON.stringify(newState));
  });

  it("should remove state from sessionStorage when value is undefined", () => {
    sessionStorage.setItem(key, JSON.stringify({ state: "value" }));

    const [, setSessionStorageState] = createSessionStorageAdapter(key);
    setSessionStorageState(undefined);

    expect(removeItem).toHaveBeenCalledWith(key);
    expect(sessionStorage.getItem(key)).toBeNull();
  });

  it("should handle custom stringify and parse functions", () => {
    const newState = { state: "new value" };
    const customStringify = vi.fn(JSON.stringify);
    const customParse = vi.fn(JSON.parse);

    const [getSessionStorageState, setSessionStorageState] =
      createSessionStorageAdapter<typeof newState>(key, {
        parse: customParse,
        stringify: customStringify,
      });

    setSessionStorageState(newState);
    expect(customStringify).toHaveBeenCalledWith(newState);
    expect(setItem).toHaveBeenCalledWith(key, JSON.stringify(newState));

    const state = getSessionStorageState();
    expect(customParse).toHaveBeenCalledWith(JSON.stringify(newState));
    expect(state).toEqual(newState);
  });
});

describe("createSessionStorageAdapter where the browser refuses storage", () => {
  const key = "refused-key";

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the fallback when reading throws", () => {
    vi.spyOn(sessionStorage, "getItem").mockImplementation(() => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    });
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    const [getSessionStorageState] = createSessionStorageAdapter<number>(key);

    expect(getSessionStorageState(7)).toBe(7);
    expect(getSessionStorageState()).toBeUndefined();
    expect(error).toHaveBeenCalled();
  });

  it("drops a write the browser refuses, without throwing", () => {
    vi.spyOn(sessionStorage, "setItem").mockImplementation(() => {
      throw new DOMException(
        "The quota has been exceeded.",
        "QuotaExceededError"
      );
    });
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    const [, setSessionStorageState] = createSessionStorageAdapter<number>(key);

    expect(() => setSessionStorageState(1)).not.toThrow();
    expect(error).toHaveBeenCalled();
  });

  it("drops a removal the browser refuses, without throwing", () => {
    vi.spyOn(sessionStorage, "removeItem").mockImplementation(() => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    });
    vi.spyOn(console, "error").mockImplementation(() => {});

    const [, setSessionStorageState] = createSessionStorageAdapter<number>(key);

    expect(() => setSessionStorageState(undefined)).not.toThrow();
  });

  it("still surfaces a custom stringify's own error", () => {
    const [, setSessionStorageState] = createSessionStorageAdapter<number>(
      key,
      {
        stringify: () => {
          throw new Error("cannot serialise");
        },
      }
    );

    expect(() => setSessionStorageState(1)).toThrow("cannot serialise");
  });
});
