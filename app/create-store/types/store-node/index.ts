import type { createDisposer } from "@/create-store/functions/helpers/create-disposer";

/** The runtime half of a store: what connections between stores need. */
export interface StoreNode {
  api: object;
  /** Visits the stores this one is connected to. */
  children: () => Iterable<StoreNode>;
  /** Disposes what this store made itself. */
  disposeChildren: () => void;
  disposed: boolean;
  disposer: ReturnType<typeof createDisposer>;
  /**
   * Composites and collections connected to this store: they subscribed to it
   * and hear its changes. A store knows nothing else about who holds it.
   */
  holders: Set<StoreNode>;
  kind: "collection" | "composite" | "primitive";
  listeners: Set<(value: any) => void>;
  read: () => unknown;
  /**
   * Marks the own cached value out of date; returns whether it was fresh. A
   * store that was already stale has stale holders, so the walk stops there.
   */
  stale: () => boolean;
}
