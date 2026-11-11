import type { AnyStore } from "@/create-store/types/any-store";

/** Entries that exist in a collection, and a way to hear of new ones. */
export interface CollectionHooks {
  entries: () => Array<[key: string, store: AnyStore]>;
  onEntry: (listener: (key: string, store: AnyStore) => void) => () => void;
  /**
   * Runs when `$delete`, `$clear` or `$reset` is about to remove an entry, before
   * it is reset and disposed, so its stored key can be removed with it.
   */
  onRemove: (listener: (key: string, store: AnyStore) => void) => () => void;
}
