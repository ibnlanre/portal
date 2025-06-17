import type {
  GetBrowserStorage,
  SetBrowserStorage,
  StorageInterface,
} from "@/create-store/types/browser-storage-adapter";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { createBrowserStorageAdapter } from "./index";

describe("createBrowserStorageAdapter", () => {
  const key = "test-key";

  let storage: StorageInterface;
  let getStorageState: GetBrowserStorage<unknown>;
  let setStorageState: SetBrowserStorage<unknown>;

  beforeEach(() => {
    storage = {
      getItem: vi.fn(),
      removeItem: vi.fn(),
      setItem: vi.fn(),
    };

    [getStorageState, setStorageState] = createBrowserStorageAdapter(key, {
      ...storage,
    });
  });

  it("should return undefined if no value is set and no fallback is provided", () => {
    vi.mocked(storage.getItem).mockReturnValue(null);
    const result = getStorageState();

    expect(result).toBeUndefined();
    expect(storage.getItem).toHaveBeenCalledWith(key);
  });

  it("should return the fallback value if no value is set", () => {
    const fallback = { foo: "bar" };
    vi.mocked(storage.getItem).mockReturnValue(null);
    const result = getStorageState(fallback);

    expect(result).toEqual(fallback);
    expect(storage.getItem).toHaveBeenCalledWith(key);
  });

  it("should return the parsed value if a value is set", () => {
    const storedValue = JSON.stringify({ foo: "bar" });
    vi.mocked(storage.getItem).mockReturnValue(storedValue);
    const result = getStorageState();

    expect(result).toEqual({ foo: "bar" });
    expect(storage.getItem).toHaveBeenCalledWith(key);
  });

  it("should set the value in storage", () => {
    const value = { foo: "bar" };
    setStorageState(value);
    expect(storage.setItem).toHaveBeenCalledWith(key, JSON.stringify(value));
  });

  it("should remove the value from storage if undefined is passed", () => {
    setStorageState(undefined);
    expect(storage.removeItem).toHaveBeenCalledWith(key);
  });
});
