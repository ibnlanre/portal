import type { StoreNode } from "@/create-store/types/store-node";

/**
 * Disposes a store. Stores connected to it keep its last value readable.
 *
 * @param node The store to dispose.
 */
export function disposeNode(node: StoreNode) {
  if (node.disposed) return;
  node.disposed = true;
  try {
    node.disposeChildren();
    node.listeners.clear();
    node.disposer.run();
  } finally {
    node.holders.clear();
  }
}
