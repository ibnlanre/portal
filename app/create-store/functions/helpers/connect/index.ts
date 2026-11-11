import type { StoreNode } from "@/create-store/types/store-node";

/**
 * Connects a holder to a store: the holder hears the store's changes.
 *
 * @param holder The composite or collection that holds the store.
 * @param child The store it holds.
 */
export function connect(holder: StoreNode, child: StoreNode) {
  child.holders.add(holder);
}

/**
 * Ends a connection made with `connect`.
 *
 * @param holder The composite or collection that held the store.
 * @param child The store it held.
 */
export function disconnect(holder: StoreNode, child: StoreNode) {
  child.holders.delete(holder);
}
