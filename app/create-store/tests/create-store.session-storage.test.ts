import { createSessionStorageAdapter } from "@/create-store/functions/adapters/create-session-storage-adapter";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createStore } from "../index";

const getItem = vi.spyOn(sessionStorage, "getItem");
const setItem = vi.spyOn(sessionStorage, "setItem");
const removeItem = vi.spyOn(sessionStorage, "removeItem");

afterEach(() => {
  sessionStorage.clear();
  vi.clearAllMocks();
});

describe("createStore with SessionStorage", () => {
  const key = "test-key";

  it("should initialize state from SessionStorage", () => {
    const initialState = { key: "value" };

    const [getSessionStorageState] = createSessionStorageAdapter<
      typeof initialState
    >({ key });

    const store = createStore(getSessionStorageState);
    expect(getItem).toHaveBeenCalledWith("key");

    const stateValue = store.$get();
    expect(stateValue).toEqual(undefined);
  });

  it("should initialize state from SessionStorage with default value", () => {
    const initialState = { key: "value" };

    const [getSessionStorageState, setSessionStorageState] =
      createSessionStorageAdapter<typeof initialState>({ key });

    const store = createStore(() => getSessionStorageState(initialState));
    expect(getItem).toHaveBeenCalledWith("key");

    const stateValue = store.$get();
    expect(stateValue).toEqual(initialState);

    store.$sub(setSessionStorageState);
    expect(sessionStorage.getItem("key")).toBe(JSON.stringify(initialState));
  });

  it("should update sessionStorage when state changes", () => {
    const initialState = { key: "value" };

    const [getSessionStorageState, setSessionStorageState] =
      createSessionStorageAdapter<typeof initialState>({ key });
    const store = createStore(getSessionStorageState);

    store.$sub(setSessionStorageState);
    store.$set({ key: "new value" });

    const newStateValue = JSON.stringify({ key: "new value" });
    expect(setItem).toHaveBeenCalledWith("key", newStateValue);
    expect(sessionStorage.getItem("key")).toBe(newStateValue);
  });

  it("should remove sessionStorage when state is undefined", () => {
    type State = number | undefined;

    const [, setSessionStorageState] = createSessionStorageAdapter<State>({
      key,
    });
    const store = createStore<State>(1);

    store.$sub(setSessionStorageState);
    store.$set(undefined);

    expect(removeItem).toHaveBeenCalledWith("key");
    expect(sessionStorage.getItem("key")).toBeNull();
  });

  it("should remove sessionStorage when state is undefined with default value", () => {
    type State = number | undefined;

    const [getSessionStorageState, setSessionStorageState] =
      createSessionStorageAdapter<State>({ key });
    const store = createStore(() => getSessionStorageState(1));

    store.$sub(setSessionStorageState);
    store.$set(undefined);

    expect(removeItem).toHaveBeenCalledWith("key");
    expect(sessionStorage.getItem("key")).toBeNull();
  });
});
