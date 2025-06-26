import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAsyncBrowserStorageAdapter } from "./index";

interface MockAsyncStorage {
  getItem: (key: string) => Promise<any>;
  removeItem: (key: string) => Promise<void>;
  setItem: (key: string, value: any) => Promise<void>;
}

describe("createAsyncBrowserStorageAdapter", () => {
  let mockStorage: MockAsyncStorage;

  beforeEach(() => {
    mockStorage = {
      getItem: vi.fn(),
      removeItem: vi.fn(),
      setItem: vi.fn(),
    };
  });

  describe("Basic functionality", () => {
    it("should create getter and setter functions", () => {
      const [getStorageState, setStorageState] =
        createAsyncBrowserStorageAdapter("test-key", mockStorage);

      expect(typeof getStorageState).toBe("function");
      expect(typeof setStorageState).toBe("function");
    });

    it("should get stored value when it exists", async () => {
      const testValue = { count: 42 };
      mockStorage.getItem = vi.fn().mockResolvedValue(testValue);

      const [getStorageState] = createAsyncBrowserStorageAdapter(
        "test-key",
        mockStorage
      );

      const result = await getStorageState();
      expect(mockStorage.getItem).toHaveBeenCalledWith("test-key");
      expect(result).toEqual(testValue);
    });

    it("should return fallback when stored value doesn't exist", async () => {
      const fallback = { count: 0 };
      mockStorage.getItem = vi.fn().mockResolvedValue(undefined);

      const [getStorageState] = createAsyncBrowserStorageAdapter(
        "test-key",
        mockStorage
      );

      const result = await getStorageState(fallback);
      expect(mockStorage.getItem).toHaveBeenCalledWith("test-key");
      expect(result).toEqual(fallback);
    });

    it("should return undefined when no fallback provided and value doesn't exist", async () => {
      mockStorage.getItem = vi.fn().mockResolvedValue(undefined);

      const [getStorageState] = createAsyncBrowserStorageAdapter(
        "test-key",
        mockStorage
      );

      const result = await getStorageState();
      expect(result).toBeUndefined();
    });

    it("should set value to storage", async () => {
      const testValue = { count: 42 };
      mockStorage.setItem = vi.fn().mockResolvedValue(undefined);

      const [, setStorageState] = createAsyncBrowserStorageAdapter(
        "test-key",
        mockStorage
      );

      await setStorageState(testValue);
      expect(mockStorage.setItem).toHaveBeenCalledWith("test-key", testValue);
    });

    it("should remove value when setting undefined", async () => {
      mockStorage.removeItem = vi.fn().mockResolvedValue(undefined);

      const [, setStorageState] = createAsyncBrowserStorageAdapter(
        "test-key",
        mockStorage
      );

      await setStorageState(undefined);
      expect(mockStorage.removeItem).toHaveBeenCalledWith("test-key");
      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe("Transform functions", () => {
    interface User {
      createdAt: Date;
      id: number;
      name: string;
    }

    interface StoredUser {
      createdAt: string;
      id: number;
      name: string;
    }

    it("should apply storage transform when setting", async () => {
      const user: User = {
        createdAt: new Date("2023-01-01T00:00:00Z"),
        id: 1,
        name: "John",
      };

      const expectedStoredUser: StoredUser = {
        createdAt: "2023-01-01T00:00:00.000Z",
        id: 1,
        name: "John",
      };

      mockStorage.setItem = vi.fn().mockResolvedValue(undefined);

      const [, setStorageState] = createAsyncBrowserStorageAdapter<
        User,
        StoredUser
      >("test-key", {
        ...mockStorage,
        storageTransform: (user) => ({
          ...user,
          createdAt: user.createdAt.toISOString(),
        }),
        usageTransform: (stored) => ({
          ...stored,
          createdAt: new Date(stored.createdAt),
        }),
      });

      await setStorageState(user);
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        "test-key",
        expectedStoredUser
      );
    });

    it("should apply usage transform when getting", async () => {
      const storedUser: StoredUser = {
        createdAt: "2023-01-01T00:00:00.000Z",
        id: 1,
        name: "John",
      };

      const expectedUser: User = {
        createdAt: new Date("2023-01-01T00:00:00Z"),
        id: 1,
        name: "John",
      };

      mockStorage.getItem = vi.fn().mockResolvedValue(storedUser);

      const [getStorageState] = createAsyncBrowserStorageAdapter<
        User,
        StoredUser
      >("test-key", {
        ...mockStorage,
        storageTransform: (user) => ({
          ...user,
          createdAt: user.createdAt.toISOString(),
        }),
        usageTransform: (stored) => ({
          ...stored,
          createdAt: new Date(stored.createdAt),
        }),
      });

      const result = await getStorageState();
      expect(result).toEqual(expectedUser);
      expect(result?.createdAt).toBeInstanceOf(Date);
    });

    it("should handle complex nested transforms", async () => {
      interface ComplexState {
        metadata: {
          lastUpdated: Date;
          version: number;
        };
        users: User[];
      }

      interface StoredComplexState {
        metadata: {
          lastUpdated: string;
          version: number;
        };
        users: StoredUser[];
      }

      const complexState: ComplexState = {
        metadata: {
          lastUpdated: new Date("2023-01-03"),
          version: 1,
        },
        users: [
          { createdAt: new Date("2023-01-01"), id: 1, name: "John" },
          { createdAt: new Date("2023-01-02"), id: 2, name: "Jane" },
        ],
      };

      mockStorage.setItem = vi.fn().mockResolvedValue(undefined);
      mockStorage.getItem = vi.fn().mockResolvedValue({
        metadata: {
          lastUpdated: "2023-01-03T00:00:00.000Z",
          version: 1,
        },
        users: [
          { createdAt: "2023-01-01T00:00:00.000Z", id: 1, name: "John" },
          { createdAt: "2023-01-02T00:00:00.000Z", id: 2, name: "Jane" },
        ],
      });

      const [getStorageState, setStorageState] =
        createAsyncBrowserStorageAdapter<ComplexState, StoredComplexState>(
          "test-key",
          {
            ...mockStorage,
            storageTransform: (state) => ({
              metadata: {
                ...state.metadata,
                lastUpdated: state.metadata.lastUpdated.toISOString(),
              },
              users: state.users.map((user) => ({
                ...user,
                createdAt: user.createdAt.toISOString(),
              })),
            }),
            usageTransform: (stored) => ({
              metadata: {
                ...stored.metadata,
                lastUpdated: new Date(stored.metadata.lastUpdated),
              },
              users: stored.users.map((user) => ({
                ...user,
                createdAt: new Date(user.createdAt),
              })),
            }),
          }
        );

      await setStorageState(complexState);
      expect(mockStorage.setItem).toHaveBeenCalledWith("test-key", {
        metadata: {
          lastUpdated: "2023-01-03T00:00:00.000Z",
          version: 1,
        },
        users: [
          { createdAt: "2023-01-01T00:00:00.000Z", id: 1, name: "John" },
          { createdAt: "2023-01-02T00:00:00.000Z", id: 2, name: "Jane" },
        ],
      });

      const result = await getStorageState();
      expect(result?.users[0]?.createdAt).toBeInstanceOf(Date);
      expect(result?.users[1]?.createdAt).toBeInstanceOf(Date);
      expect(result?.metadata.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe("Default transform behavior", () => {
    it("should use identity transforms by default", async () => {
      const testValue = { count: 42, name: "test" };
      mockStorage.getItem = vi.fn().mockResolvedValue(testValue);
      mockStorage.setItem = vi.fn().mockResolvedValue(undefined);

      const [getStorageState, setStorageState] =
        createAsyncBrowserStorageAdapter("test-key", mockStorage);

      await setStorageState(testValue);
      expect(mockStorage.setItem).toHaveBeenCalledWith("test-key", testValue);

      const result = await getStorageState();
      expect(result).toEqual(testValue);
    });
  });

  describe("Error handling", () => {
    it("should handle getItem errors gracefully", async () => {
      const error = new Error("Storage read error");
      mockStorage.getItem = vi.fn().mockRejectedValue(error);

      const [getStorageState] = createAsyncBrowserStorageAdapter(
        "test-key",
        mockStorage
      );

      await expect(getStorageState()).rejects.toThrow("Storage read error");
    });

    it("should handle setItem errors gracefully", async () => {
      const error = new Error("Storage write error");
      mockStorage.setItem = vi.fn().mockRejectedValue(error);

      const [, setStorageState] = createAsyncBrowserStorageAdapter(
        "test-key",
        mockStorage
      );

      await expect(setStorageState({ test: "value" })).rejects.toThrow(
        "Storage write error"
      );
    });

    it("should handle removeItem errors gracefully", async () => {
      const error = new Error("Storage remove error");
      mockStorage.removeItem = vi.fn().mockRejectedValue(error);

      const [, setStorageState] = createAsyncBrowserStorageAdapter(
        "test-key",
        mockStorage
      );

      await expect(setStorageState(undefined)).rejects.toThrow(
        "Storage remove error"
      );
    });

    it("should handle transform function errors", async () => {
      mockStorage.getItem = vi.fn().mockResolvedValue({ invalid: "data" });

      const [getStorageState] = createAsyncBrowserStorageAdapter("test-key", {
        ...mockStorage,
        usageTransform: () => {
          throw new Error("Transform error");
        },
      });

      await expect(getStorageState()).rejects.toThrow("Transform error");
    });
  });

  describe("Type safety and overloads", () => {
    it("should handle fallback overload correctly", async () => {
      mockStorage.getItem = vi.fn().mockResolvedValue(undefined);

      const [getStorageState] = createAsyncBrowserStorageAdapter(
        "test-key",
        mockStorage
      );

      const withFallback = await getStorageState({ default: true });
      expect(withFallback).toEqual({ default: true });

      const withoutFallback = await getStorageState();
      expect(withoutFallback).toBeUndefined();
    });

    it("should preserve type information through transforms", async () => {
      interface TypedState {
        active: boolean;
        id: number;
        tags: string[];
      }

      const testState: TypedState = {
        active: true,
        id: 1,
        tags: ["tag1", "tag2"],
      };

      mockStorage.getItem = vi.fn().mockResolvedValue(testState);
      mockStorage.setItem = vi.fn().mockResolvedValue(undefined);

      const [getStorageState, setStorageState] =
        createAsyncBrowserStorageAdapter<TypedState>("test-key", mockStorage);

      await setStorageState(testState);
      const result = await getStorageState();

      expect(typeof result?.id).toBe("number");
      expect(typeof result?.active).toBe("boolean");
      expect(Array.isArray(result?.tags)).toBe(true);
    });
  });

  describe("Edge cases", () => {
    it("should handle null values correctly", async () => {
      mockStorage.getItem = vi.fn().mockResolvedValue(null);

      const [getStorageState] = createAsyncBrowserStorageAdapter(
        "test-key",
        mockStorage
      );

      const result = await getStorageState({ fallback: true });
      expect(result).toEqual({ fallback: true });
    });

    it("should handle null values without fallback", async () => {
      mockStorage.getItem = vi.fn().mockResolvedValue(null);

      const [getStorageState] = createAsyncBrowserStorageAdapter(
        "test-key",
        mockStorage
      );

      const result = await getStorageState();
      expect(result).toBeUndefined();
    });

    it("should handle empty objects and arrays", async () => {
      const emptyObject = {};
      const emptyArray: any[] = [];

      mockStorage.setItem = vi.fn().mockResolvedValue(undefined);
      mockStorage.getItem = vi
        .fn()
        .mockResolvedValueOnce(emptyObject)
        .mockResolvedValueOnce(emptyArray);

      const [getStorageState, setStorageState] =
        createAsyncBrowserStorageAdapter("test-key", mockStorage);

      await setStorageState(emptyObject);
      expect(mockStorage.setItem).toHaveBeenCalledWith("test-key", emptyObject);

      let result = await getStorageState();
      expect(result).toEqual(emptyObject);

      await setStorageState(emptyArray);
      result = await getStorageState();
      expect(result).toEqual(emptyArray);
    });

    it("should handle primitive values", async () => {
      const primitives = [42, "string", true, false, 0, ""];

      mockStorage.setItem = vi.fn().mockResolvedValue(undefined);

      const [, setStorageState] = createAsyncBrowserStorageAdapter(
        "test-key",
        mockStorage
      );

      for (const primitive of primitives) {
        await setStorageState(primitive);
        expect(mockStorage.setItem).toHaveBeenCalledWith("test-key", primitive);
      }
    });

    it("should handle deeply nested objects", async () => {
      const deeplyNested = {
        level1: {
          level2: {
            level3: {
              level4: {
                array: [1, 2, { nested: true }],
                value: "deep",
              },
            },
          },
        },
      };

      mockStorage.setItem = vi.fn().mockResolvedValue(undefined);
      mockStorage.getItem = vi.fn().mockResolvedValue(deeplyNested);

      const [getStorageState, setStorageState] =
        createAsyncBrowserStorageAdapter("test-key", mockStorage);

      await setStorageState(deeplyNested);
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        "test-key",
        deeplyNested
      );

      const result = await getStorageState();
      expect(result).toEqual(deeplyNested);
    });
  });

  describe("Key handling", () => {
    it("should use the provided key for all operations", async () => {
      const customKey = "custom-storage-key";
      mockStorage.getItem = vi.fn().mockResolvedValue(undefined);
      mockStorage.setItem = vi.fn().mockResolvedValue(undefined);
      mockStorage.removeItem = vi.fn().mockResolvedValue(undefined);

      const [getStorageState, setStorageState] =
        createAsyncBrowserStorageAdapter(customKey, mockStorage);

      await getStorageState();
      expect(mockStorage.getItem).toHaveBeenCalledWith(customKey);

      await setStorageState({ test: "value" });
      expect(mockStorage.setItem).toHaveBeenCalledWith(customKey, {
        test: "value",
      });

      await setStorageState(undefined);
      expect(mockStorage.removeItem).toHaveBeenCalledWith(customKey);
    });

    it("should handle special characters in keys", async () => {
      const specialKey = "my-app/user:123@domain.com";
      mockStorage.getItem = vi.fn().mockResolvedValue(undefined);

      const [getStorageState] = createAsyncBrowserStorageAdapter(
        specialKey,
        mockStorage
      );

      await getStorageState();
      expect(mockStorage.getItem).toHaveBeenCalledWith(specialKey);
    });
  });
});
