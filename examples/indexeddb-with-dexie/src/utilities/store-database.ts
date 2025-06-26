import Dexie from "dexie";

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
