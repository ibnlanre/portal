import type { AnyStore } from "@/create-store/types/any-store";
import type { StoreNode } from "@/create-store/types/store-node";

/** An entry of a collection: its node and its store. */
export interface CollectionEntry {
  node: StoreNode;
  store: AnyStore;
}
