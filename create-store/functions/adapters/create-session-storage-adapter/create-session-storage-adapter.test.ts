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

    const [getSessionStorageState] = createSessionStorageAdapter<
      typeof initialState
    >({ key });
    const state = getSessionStorageState();

    expect(state).toEqual(initialState);
    expect(getItem).toHaveBeenCalledWith(key);
  });

  it("should return fallback state if sessionStorage is empty", () => {
    const fallbackState = { state: "fallback" };

    const [getSessionStorageState] = createSessionStorageAdapter<
      typeof fallbackState
    >({ key });
    const state = getSessionStorageState(fallbackState);

    expect(state).toEqual(fallbackState);
    expect(getItem).toHaveBeenCalledWith(key);
  });

  it("should set state to sessionStorage", () => {
    const newState = { state: "new value" };

    const [, setSessionStorageState] = createSessionStorageAdapter<
      typeof newState
    >({ key });
    setSessionStorageState(newState);

    expect(setItem).toHaveBeenCalledWith(key, JSON.stringify(newState));
    expect(sessionStorage.getItem(key)).toBe(JSON.stringify(newState));
  });

  it("should remove state from sessionStorage when value is undefined", () => {
    sessionStorage.setItem(key, JSON.stringify({ state: "value" }));

    const [, setSessionStorageState] = createSessionStorageAdapter({ key });
    setSessionStorageState(undefined);

    expect(removeItem).toHaveBeenCalledWith(key);
    expect(sessionStorage.getItem(key)).toBeNull();
  });

  it("should handle custom stringify and parse functions", () => {
    const newState = { state: "new value" };
    const customStringify = vi.fn(JSON.stringify);
    const customParse = vi.fn(JSON.parse);

    const [getSessionStorageState, setSessionStorageState] =
      createSessionStorageAdapter<typeof newState>({
        key,
        stringify: customStringify,
        parse: customParse,
      });

    setSessionStorageState(newState);
    expect(customStringify).toHaveBeenCalledWith(newState);
    expect(setItem).toHaveBeenCalledWith(key, JSON.stringify(newState));

    const state = getSessionStorageState();
    expect(customParse).toHaveBeenCalledWith(JSON.stringify(newState));
    expect(state).toEqual(newState);
  });

  it("should return undefined if sessionStorage is not available", () => {
    const originalSessionStorage = sessionStorage;

    Object.defineProperty(window, "sessionStorage", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const [getSessionStorageState, setSessionStorageState] =
      createSessionStorageAdapter({ key });

    const state = getSessionStorageState();
    expect(state).toBeUndefined();

    setSessionStorageState({ state: "value" });
    expect(sessionStorage).toBeUndefined();

    Object.defineProperty(window, "sessionStorage", {
      value: originalSessionStorage,
      writable: true,
      configurable: true,
    });
  });
});
