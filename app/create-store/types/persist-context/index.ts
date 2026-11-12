/** Where a persistence failure happened. */
export interface PersistContext {
  /** What was being done: reading storage, writing it, or removing a key. */
  action: "read" | "remove" | "write";
  /** The entry's key, for an entry of a persisted collection. */
  key?: string;
}
