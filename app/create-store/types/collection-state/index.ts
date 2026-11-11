import type { StoreState } from "@/create-store/types/store-state";

/** The state of a collection: one entry's state per key that exists. */
export type CollectionState<Entry> = Record<string, StoreState<Entry>>;
