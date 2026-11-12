import type { PersistOptions } from "@/create-store/types/persist-options";

/** The options of `persist` for a collection. */
export interface CollectionPersistOptions<State> extends PersistOptions<State> {
  /**
   * Lists the entry keys that exist in storage, if your storage can say (an
   * IndexedDB store, a key prefix). Surfaced as `persistor.keys()`.
   */
  keys?: () => Promise<string[]> | string[];
}
