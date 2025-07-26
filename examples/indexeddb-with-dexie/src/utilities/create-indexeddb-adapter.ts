import {
  type AsyncBrowserStorageTransforms,
  createAsyncBrowserStorageAdapter,
} from "@ibnlanre/portal";

import { StoreDatabase } from "./store-database";

export interface IndexedDBAdapterOptions<State, StoredState = State>
  extends AsyncBrowserStorageTransforms<State, StoredState> {
  databaseName?: string;
  version?: number;
}

export function createIndexedDBAdapter<State, StoredState = State>(
  key: string,
  options: IndexedDBAdapterOptions<State, StoredState> = {}
) {
  const { databaseName = "PortalStore", version = 1, ...transforms } = options;
  const db = new StoreDatabase<State, StoredState>(databaseName, version);

  db.open().catch((error) => {
    console.error("Failed to open IndexedDB:", error);
  });

  return createAsyncBrowserStorageAdapter<State, StoredState>(key, {
    ...transforms,
    getItem: async (key) => {
      try {
        const result = await db.stores.get(key);
        if (!result) return undefined;
        return result.value;
      } catch (error) {
        console.error("Failed to get state from IndexedDB:", error);
        return undefined;
      }
    },
    removeItem: async (key) => {
      try {
        await db.stores.delete(key);
      } catch (error) {
        console.error("Failed to clear state from IndexedDB:", error);
      }
    },
    setItem: async (key, value) => {
      try {
        await db.stores.put({
          id: key,
          timestamp: Date.now(),
          value,
        });
      } catch (error) {
        console.error("Failed to set state in IndexedDB:", error);
      }
    },
  });
}
