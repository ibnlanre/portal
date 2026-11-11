import { afterEach, describe, expect, it, vi } from "vitest";

import { sessionAdapter } from "./index";

const getItem = vi.spyOn(sessionStorage, "getItem");
const setItem = vi.spyOn(sessionStorage, "setItem");
const removeItem = vi.spyOn(sessionStorage, "removeItem");

afterEach(() => {
  sessionStorage.clear();
  vi.clearAllMocks();
});

describe("sessionAdapter", () => {
  const key = "test-key";

  it("should get state from sessionStorage", () => {
    const initialState = { state: "value" };
    sessionStorage.setItem(key, JSON.stringify(initialState));

    const [getSessionStorageState] = sessionAdapter<typeof initialState>(key);
    const state = getSessionStorageState();

    expect(state).toEqual(initialState);
    expect(getItem).toHaveBeenCalledWith(key);
  });

  it("should return fallback state if sessionStorage is empty", () => {
    const fallbackState = { state: "fallback" };

    const [getSessionStorageState] = sessionAdapter<typeof fallbackState>(key);
    const state = getSessionStorageState(fallbackState);

    expect(state).toEqual(fallbackState);
    expect(getItem).toHaveBeenCalledWith(key);
  });

  it("should set state to sessionStorage", () => {
    const newState = { state: "new value" };

    const [, setSessionStorageState] = sessionAdapter<typeof newState>(key);
    setSessionStorageState(newState);

    expect(setItem).toHaveBeenCalledWith(key, JSON.stringify(newState));
    expect(sessionStorage.getItem(key)).toBe(JSON.stringify(newState));
  });

  it("should remove state from sessionStorage when value is undefined", () => {
    sessionStorage.setItem(key, JSON.stringify({ state: "value" }));

    const [, setSessionStorageState] = sessionAdapter(key);
    setSessionStorageState(undefined);

    expect(removeItem).toHaveBeenCalledWith(key);
    expect(sessionStorage.getItem(key)).toBeNull();
  });

  it("should handle custom stringify and parse functions", () => {
    const newState = { state: "new value" };
    const customStringify = vi.fn(JSON.stringify);
    const customParse = vi.fn(JSON.parse);

    const [getSessionStorageState, setSessionStorageState] = sessionAdapter<
      typeof newState
    >(key, {
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

describe("sessionAdapter where the browser refuses storage", () => {
  const key = "refused-key";

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the fallback when reading throws", () => {
    vi.spyOn(sessionStorage, "getItem").mockImplementation(() => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    });
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    const [getSessionStorageState] = sessionAdapter<number>(key);

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

    const [, setSessionStorageState] = sessionAdapter<number>(key);

    expect(() => setSessionStorageState(1)).not.toThrow();
    expect(error).toHaveBeenCalled();
  });

  it("drops a removal the browser refuses, without throwing", () => {
    vi.spyOn(sessionStorage, "removeItem").mockImplementation(() => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    });
    vi.spyOn(console, "error").mockImplementation(() => {});

    const [, setSessionStorageState] = sessionAdapter<number>(key);

    expect(() => setSessionStorageState(undefined)).not.toThrow();
  });

  it("still surfaces a custom stringify's own error", () => {
    const [, setSessionStorageState] = sessionAdapter<number>(key, {
      stringify: () => {
        throw new Error("cannot serialise");
      },
    });

    expect(() => setSessionStorageState(1)).toThrow("cannot serialise");
  });
});

describe("sessionAdapter absent parse results", () => {
  const key = "absent-key";

  afterEach(() => {
    sessionStorage.clear();
  });

  it("falls back when parse returns null or undefined", () => {
    vi.spyOn(sessionStorage, "getItem").mockReturnValueOnce("gone");
    const [get] = sessionAdapter<string>(key, {
      parse: () => undefined,
    });
    expect(get("fallback")).toBe("fallback");
    expect(get()).toBeUndefined();
  });
});
