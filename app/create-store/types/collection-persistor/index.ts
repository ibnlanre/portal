import type { Persistor } from "@/create-store/types/persistor";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";

/** What `persist` returns for a collection: a persistor that knows its entries. */
export interface CollectionPersistor extends Persistor {
  /**
   * Whether the entry for `key` has been read. It flips when that entry's own
   * read settles (a failed read counts, with nothing stored), goes back to
   * `false` if the entry is removed, and starts `false` for a key with no
   * entry yet. The same store is returned for a key every time.
   */
  hydratedOf: (key: string) => PrimitiveStore<boolean>;
  /**
   * The keys that exist in storage, from the `keys` option; `undefined` when
   * none was given because storage cannot say.
   */
  keys: () => Promise<string[] | undefined>;
}
