import Dexie, { type EntityTable } from "dexie";

export interface IndexedDBAdapterOptions {
  databaseName?: string;
  deserialize?: (value: any) => any;
  serialize?: (value: any) => any;
}

export interface StoreEntry {
  id: string;
  timestamp: number;
  value: any;
}

export class StoreDatabase extends Dexie {
  stores!: EntityTable<StoreEntry, "id">;

  constructor(databaseName = "PortalStore") {
    super(databaseName);

    this.version(1).stores({
      stores: "id, timestamp",
    });
  }
}

export function createIndexedDBAdapter<State>(
  key: string,
  options: IndexedDBAdapterOptions = {}
): [
  getState: () => Promise<State | undefined>,
  setState: (value: State | undefined) => Promise<void>,
  clearState: () => Promise<void>,
] {
  const {
    databaseName = "PortalStore",
    deserialize = (value) => value,
    serialize = (value) => value,
  } = options;

  const db = new StoreDatabase(databaseName);

  const getState = async (): Promise<State | undefined> => {
    try {
      const entry = await db.stores.get(key);
      if (!entry) return undefined;

      return deserialize(entry.value);
    } catch (error) {
      console.error("Failed to get state from IndexedDB:", error);
      return undefined;
    }
  };

  const setState = async (value: State | undefined): Promise<void> => {
    try {
      if (value === undefined) {
        await db.stores.delete(key);
        return;
      }

      await db.stores.put({
        id: key,
        timestamp: Date.now(),
        value: serialize(value),
      });
    } catch (error) {
      console.error("Failed to set state in IndexedDB:", error);
    }
  };

  const clearState = async (): Promise<void> => {
    try {
      await db.stores.delete(key);
    } catch (error) {
      console.error("Failed to clear state from IndexedDB:", error);
    }
  };

  return [getState, setState, clearState];
}
