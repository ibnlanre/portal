import Dexie from "dexie";

import { createAsyncBrowserStorageAdapter } from "@/create-store/functions/adapters/create-async-browser-storage-adapter";
import { AsyncStorageAdapterOptions } from "@/create-store/types/async-browser-storage-adapter";

export interface IndexedDBAdapterOptions<State, StoredState = State>
  extends AsyncStorageAdapterOptions<State, StoredState> {
  databaseName?: string;
  version?: number;
}

export interface StoreEntry<StoredState> {
  id: string;
  timestamp: number;
  value: StoredState;
}

export class StoreDatabase<State, StoredState = State> extends Dexie {
  stores: Dexie.Table<StoreEntry<StoredState>, string>;

  constructor(databaseName = "PortalStore", version = 1) {
    super(databaseName);

    this.version(version).stores({
      stores: "id, timestamp",
    });

    this.stores = this.table<StoreEntry<StoredState>, string>("stores");
  }
}

export function createIndexedDBAdapter<State, StoredState = State>(
  key: string,
  options: IndexedDBAdapterOptions<State, StoredState> = {}
) {
  const {
    databaseName = "PortalStore",
    storageTransform,
    usageTransform,
    version = 1,
  } = options;

  const db = new StoreDatabase<State, StoredState>(databaseName, version);

  db.open().catch((error) => {
    console.error("Failed to open IndexedDB:", error);
  });

  return createAsyncBrowserStorageAdapter<State, StoredState>(key, {
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
    storageTransform,
    usageTransform,
  });
}
