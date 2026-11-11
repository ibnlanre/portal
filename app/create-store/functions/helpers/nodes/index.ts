import type { StoreNode } from "@/create-store/types/store-node";

const nodes = new WeakMap<object, StoreNode>();

/**
 * Finds the node behind a store.
 *
 * @param value Anything.
 * @returns The node, or `undefined` for anything that is not a store.
 */
export function nodeOf(value: unknown): StoreNode | undefined {
  if (value === null) return undefined;
  if (typeof value !== "object" && typeof value !== "function") {
    return undefined;
  }
  return nodes.get(value);
}

/**
 * Remembers the node behind a store.
 *
 * @param store The store's public object.
 * @param node The node it was made from.
 */
export function registerNode(store: object, node: StoreNode) {
  nodes.set(store, node);
}
