import { afterEach, describe, expect, it, vi } from "vitest";
import { createLocalStorageAdapter } from ".";

const getItem = vi.spyOn(localStorage, "getItem");
const setItem = vi.spyOn(localStorage, "setItem");
const removeItem = vi.spyOn(localStorage, "removeItem");

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("createLocalStorageAdapter", () => {
  it("should get state from localStorage", () => {
    const key = "test-key";
    const initialState = { key: "value" };
    localStorage.setItem(key, JSON.stringify(initialState));

    const [getLocalStorageState] =
      createLocalStorageAdapter<typeof initialState>(key);
    const state = getLocalStorageState();

    expect(state).toEqual(initialState);
    expect(getItem).toHaveBeenCalledWith(key);
  });

  it("should return fallback state if localStorage is empty", () => {
    const key = "test-key";
    const fallbackState = { key: "fallback" };

    const [getLocalStorageState] =
      createLocalStorageAdapter<typeof fallbackState>(key);
    const state = getLocalStorageState(fallbackState);

    expect(state).toEqual(fallbackState);
    expect(getItem).toHaveBeenCalledWith(key);
  });

  it("should set state to localStorage", () => {
    const key = "test-key";
    const newState = { key: "new value" };

    const [, setLocalStorageState] =
      createLocalStorageAdapter<typeof newState>(key);
    setLocalStorageState(newState);

    expect(setItem).toHaveBeenCalledWith(key, JSON.stringify(newState));
    expect(localStorage.getItem(key)).toBe(JSON.stringify(newState));
  });

  it("should remove state from localStorage when value is undefined", () => {
    const key = "test-key";
    localStorage.setItem(key, JSON.stringify({ key: "value" }));

    const [, setLocalStorageState] = createLocalStorageAdapter(key);
    setLocalStorageState(undefined);

    expect(removeItem).toHaveBeenCalledWith(key);
    expect(localStorage.getItem(key)).toBeNull();
  });

  it("should handle custom stringify and parse functions", () => {
    const key = "test-key";
    const newState = { key: "new value" };
    const customStringify = vi.fn(JSON.stringify);
    const customParse = vi.fn(JSON.parse);

    const [getLocalStorageState, setLocalStorageState] =
      createLocalStorageAdapter<typeof newState>(key, {
        stringify: customStringify,
        parse: customParse,
      });

    setLocalStorageState(newState);
    expect(customStringify).toHaveBeenCalledWith(newState);
    expect(setItem).toHaveBeenCalledWith(key, JSON.stringify(newState));

    const state = getLocalStorageState();
    expect(customParse).toHaveBeenCalledWith(JSON.stringify(newState));
    expect(state).toEqual(newState);
  });
});
