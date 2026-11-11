import type { AnyStore } from "@/create-store/types/any-store";
import type { CollectionState } from "@/create-store/types/collection-state";
import type { Store } from "@/create-store/types/store";
import type { StoreInput } from "@/create-store/types/store-input";

/** Branches made by string key, on first use. */
export interface CollectionStore<Entry extends AnyStore> extends Store<
  CollectionState<Entry>,
  Record<string, StoreInput<Entry> | undefined>
> {
  (key: string): Entry;
  /** Disposes every entry. */
  readonly $clear: () => void;
  /** Disposes the entry for `key`, if there is one. */
  readonly $delete: (key: string) => void;
  readonly $has: (key: string) => boolean;
  /** The keys of the entries that exist. */
  readonly $keys: () => string[];
}
