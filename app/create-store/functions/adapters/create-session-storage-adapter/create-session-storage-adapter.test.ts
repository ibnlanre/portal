import { afterEach, describe, expect, it, vi } from "vitest";
import { createSessionStorageAdapter } from ".";

const getItem = vi.spyOn(sessionStorage, "getItem");
const setItem = vi.spyOn(sessionStorage, "setItem");
const removeItem = vi.spyOn(sessionStorage, "removeItem");

afterEach(() => {
  sessionStorage.clear();
  vi.clearAllMocks();
});

describe("createSessionStorageAdapter", () => {
  it("should get state from sessionStorage", () => {
    const key = "test-key";
    const initialState = { key: "value" };
    sessionStorage.setItem(key, JSON.stringify(initialState));

    const [getSessionStorageState] =
      createSessionStorageAdapter<typeof initialState>(key);
    const state = getSessionStorageState();

    expect(state).toEqual(initialState);
    expect(getItem).toHaveBeenCalledWith(key);
  });

  it("should return fallback state if sessionStorage is empty", () => {
    const key = "test-key";
    const fallbackState = { key: "fallback" };

    const [getSessionStorageState] =
      createSessionStorageAdapter<typeof fallbackState>(key);
    const state = getSessionStorageState(fallbackState);

    expect(state).toEqual(fallbackState);
    expect(getItem).toHaveBeenCalledWith(key);
  });

  it("should set state to sessionStorage", () => {
    const key = "test-key";
    const newState = { key: "new value" };

    const [, setSessionStorageState] =
      createSessionStorageAdapter<typeof newState>(key);
    setSessionStorageState(newState);

    expect(setItem).toHaveBeenCalledWith(key, JSON.stringify(newState));
    expect(sessionStorage.getItem(key)).toBe(JSON.stringify(newState));
  });

  it("should remove state from sessionStorage when value is undefined", () => {
    const key = "test-key";
    sessionStorage.setItem(key, JSON.stringify({ key: "value" }));

    const [, setSessionStorageState] = createSessionStorageAdapter(key);
    setSessionStorageState(undefined);

    expect(removeItem).toHaveBeenCalledWith(key);
    expect(sessionStorage.getItem(key)).toBeNull();
  });

  it("should handle custom stringify and parse functions", () => {
    const key = "test-key";
    const newState = { key: "new value" };
    const customStringify = vi.fn(JSON.stringify);
    const customParse = vi.fn(JSON.parse);

    const [getSessionStorageState, setSessionStorageState] =
      createSessionStorageAdapter<typeof newState>(key, {
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
});
