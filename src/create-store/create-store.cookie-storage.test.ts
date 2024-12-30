import { cookieStorage } from "@/cookie-storage";
import type { CookieOptions } from "@/cookie-storage/types/cookie-options";
import { createCookieStorageAdapter } from "@/create-store/functions/adapters/create-cookie-storage-adapter";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createStore } from "./index";

const getItem = vi.spyOn(cookieStorage, "getItem");
const setItem = vi.spyOn(cookieStorage, "setItem");
const removeItem = vi.spyOn(cookieStorage, "removeItem");

afterEach(() => {
  cookieStorage.clear();
  vi.clearAllMocks();
});

const defaultCookieOptions: CookieOptions = {
  expires: 0,
  partitioned: false,
  path: "/",
  sameSite: "Lax",
  secure: false,
};

describe("createStore with CookieStorage", () => {
  it("should initialize state from CookieStorage", () => {
    const initialState = { key: "value" };
    cookieStorage.setItem("key", JSON.stringify(initialState));

    const [getCookieStorageState] =
      createCookieStorageAdapter<typeof initialState>("key");

    const store = createStore(getCookieStorageState);
    expect(getItem).toHaveBeenCalledWith("key");

    const stateValue = store.$get();
    expect(stateValue).toEqual(initialState);
  });

  it("should initialize state from CookieStorage with default value", () => {
    const initialState = { key: "value" };
    const stringifiedInitialState = JSON.stringify(initialState);

    const [getCookieStorageState, setCookieStorageState] =
      createCookieStorageAdapter<typeof initialState>("key");

    const store = createStore(() => getCookieStorageState(initialState));
    expect(getItem).toHaveBeenCalledWith("key");

    const stateValue = store.$get();
    expect(stateValue).toEqual(initialState);

    store.$sub(setCookieStorageState);
    expect(setItem).toHaveBeenCalledWith(
      "key",
      stringifiedInitialState,
      defaultCookieOptions
    );

    expect(cookieStorage.getItem("key")).toBe(stringifiedInitialState);
  });

  it("should update CookieStorage when state changes", () => {
    const initialState = { key: "value" };

    const [getCookieStorageState, setCookieStorageState] =
      createCookieStorageAdapter<typeof initialState>("key");

    const store = createStore(getCookieStorageState);
    store.$sub((value) => {
      setCookieStorageState(value, {
        expires: new Date().getTime() + 1000,
        domain: "localhost",
        secure: true,
      });
    });

    const setStateValue = store.$set();
    setStateValue({ key: "new value" });

    const newStateValue = JSON.stringify({ key: "new value" });
    expect(setItem).toHaveBeenCalledWith(
      "key",
      newStateValue,
      expect.objectContaining({
        expires: expect.any(Number),
        domain: "localhost",
        secure: true,
      })
    );

    expect(cookieStorage.getItem("key")).toBe(newStateValue);
  });

  it("should remove CookieStorage when state is undefined", () => {
    type State = number | undefined;

    const [, setCookieStorageState] = createCookieStorageAdapter<State>("key");

    const store = createStore<State>(1);
    store.$sub(setCookieStorageState);

    const setStateValue = store.$set();
    setStateValue(undefined);

    expect(removeItem).toHaveBeenCalledWith("key");
    expect(cookieStorage.getItem("key")).toBeNull();
  });

  it("should remove CookieStorage when state is undefined with default value", () => {
    type State = number | undefined;

    const [getCookieStorageState, setCookieStorageState] =
      createCookieStorageAdapter<State>("key");

    const store = createStore(() => getCookieStorageState(1));
    store.$sub(setCookieStorageState);

    const setStateValue = store.$set();
    setStateValue(undefined);

    expect(removeItem).toHaveBeenCalledWith("key");
    expect(cookieStorage.getItem("key")).toBeNull();
  });
});
