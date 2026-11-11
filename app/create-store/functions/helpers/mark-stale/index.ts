import type { StoreNode } from "@/create-store/types/store-node";

/**
 * Marks every store connected to a store, and theirs, out of date. A holder
 * that was already stale has stale holders, so the walk stops there.
 *
 * @param node The store that changed.
 */
export function markStale(node: StoreNode) {
  const seen = new Set<StoreNode>();
  const stack = [...node.holders];
  while (stack.length > 0) {
    const holder = stack.pop()!;
    if (seen.has(holder)) continue;
    seen.add(holder);
    if (!holder.stale()) continue;
    for (const next of holder.holders) stack.push(next);
  }
}
