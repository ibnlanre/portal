import { cookieStorage } from "@/cookie-storage";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createCookieStorageAdapter } from ".";

const getItem = vi.spyOn(cookieStorage, "getItem");
const setItem = vi.spyOn(cookieStorage, "setItem");
const removeItem = vi.spyOn(cookieStorage, "removeItem");

afterEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(document, "cookie", {
    writable: true,
    configurable: true,
    value: "",
  });
});

describe("createCookieStorageAdapter", () => {
  it("should get state from cookieStorage", () => {
    const key = "test-key";
    const initialState = { key: "value" };
    cookieStorage.setItem(key, JSON.stringify(initialState));

    const [getCookieStorageState] =
      createCookieStorageAdapter<typeof initialState>(key);
    const state = getCookieStorageState();

    expect(state).toEqual(initialState);
    expect(getItem).toHaveBeenCalledWith(key);
  });

  it("should return fallback state if cookieStorage is empty", () => {
    const key = "test-key";
    const fallbackState = { key: "fallback" };

    const [getCookieStorageState] =
      createCookieStorageAdapter<typeof fallbackState>(key);
    const state = getCookieStorageState(fallbackState);

    expect(state).toEqual(fallbackState);
    expect(getItem).toHaveBeenCalledWith(key);
  });

  it("should set state to cookieStorage", () => {
    const key = "test-key";
    const newState = { key: "new value" };

    const [, setCookieStorageState] =
      createCookieStorageAdapter<typeof newState>(key);
    setCookieStorageState(newState);

    expect(setItem).toHaveBeenCalledWith(key, JSON.stringify(newState), {});
    expect(cookieStorage.getItem(key)).toBe(JSON.stringify(newState));
  });

  it("should remove state from cookieStorage when value is undefined", () => {
    const key = "test-key";
    cookieStorage.setItem(key, JSON.stringify({ key: "value" }));

    const [, setCookieStorageState] = createCookieStorageAdapter(key);
    setCookieStorageState(undefined);

    expect(removeItem).toHaveBeenCalledWith(key);
  });

  it("should handle custom stringify and parse functions", () => {
    const key = "test-key";
    const newState = { key: "new value" };
    const customStringify = vi.fn(JSON.stringify);
    const customParse = vi.fn(JSON.parse);

    const [getCookieStorageState, setCookieStorageState] =
      createCookieStorageAdapter<typeof newState>(key, {
        stringify: customStringify,
        parse: customParse,
      });

    setCookieStorageState(newState);
    expect(customStringify).toHaveBeenCalledWith(newState);
    expect(setItem).toHaveBeenCalledWith(key, JSON.stringify(newState), {});

    const state = getCookieStorageState();
    expect(customParse).toHaveBeenCalledWith(JSON.stringify(newState));
    expect(state).toEqual(newState);
  });
});
