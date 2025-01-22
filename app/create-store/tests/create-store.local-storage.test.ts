import { createLocalStorageAdapter } from "@/create-store/functions/adapters/create-local-storage-adapter";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createStore } from "../index";

const getItem = vi.spyOn(localStorage, "getItem");
const setItem = vi.spyOn(localStorage, "setItem");
const removeItem = vi.spyOn(localStorage, "removeItem");

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("createStore with LocalStorage", () => {
  const key = "test-key";

  it("should initialize state from LocalStorage", () => {
    const initialState = { key: "value" };
    localStorage.setItem(key, JSON.stringify(initialState));

    const [getLocalStorageState] = createLocalStorageAdapter<
      typeof initialState
    >({ key });

    const store = createStore(getLocalStorageState);
    expect(getItem).toHaveBeenCalledWith(key);

    const stateValue = store.$get();
    expect(stateValue).toEqual(initialState);
  });

  it("should initialize state from LocalStorage with default value", () => {
    const initialState = { key: "value" };

    const [getLocalStorageState, setLocalStorageState] =
      createLocalStorageAdapter<typeof initialState>({ key });

    const store = createStore(() => getLocalStorageState(initialState));
    expect(getItem).toHaveBeenCalledWith(key);

    const stateValue = store.$get();
    expect(stateValue).toEqual(initialState);

    store.$sub(setLocalStorageState);
    expect(localStorage.getItem(key)).toBe(JSON.stringify(initialState));
  });

  it("should update localStorage when state changes", () => {
    const initialState = { key: "value" };

    const [getLocalStorageState, setLocalStorageState] =
      createLocalStorageAdapter<typeof initialState>({ key });
    const store = createStore(getLocalStorageState);

    store.$sub(setLocalStorageState);
    store.$set({ key: "new value" });

    const newStateValue = JSON.stringify({ key: "new value" });
    expect(setItem).toHaveBeenCalledWith(key, newStateValue);
    expect(localStorage.getItem(key)).toBe(newStateValue);
  });

  it("should remove localStorage when state is undefined", () => {
    type State = number | undefined;

    const [, setLocalStorageState] = createLocalStorageAdapter<State>({ key });
    const store = createStore<State>(1);

    store.$sub(setLocalStorageState);
    store.$set(undefined);

    expect(removeItem).toHaveBeenCalledWith(key);
    expect(localStorage.getItem(key)).toBeNull();
  });

  it("should remove localStorage when state is undefined with default value", () => {
    type State = number | undefined;

    const [getLocalStorageState, setLocalStorageState] =
      createLocalStorageAdapter<State>({ key });
    const store = createStore(() => getLocalStorageState(1));

    store.$sub(setLocalStorageState);
    store.$set(undefined);

    expect(removeItem).toHaveBeenCalledWith(key);
    expect(localStorage.getItem(key)).toBeNull();
  });
});
