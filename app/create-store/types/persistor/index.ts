import type { PrimitiveStore } from "@/create-store/types/primitive-store";

export interface Persistor {
  /** Stops writing and following, and detaches from the store. Idempotent. */
  dispose: () => void;
  /**
   * Writes a pending write now (see `wait`). Resolves once the adapter has
   * stored it; with nothing pending it resolves at once.
   */
  flush: () => Promise<void>;
  /** Reads storage into the store. Resolves once applied; no-op if done. */
  hydrate: () => Promise<void>;
  /** `true` once storage has been read; read it or subscribe, `$use()` included. */
  hydrated: PrimitiveStore<boolean>;
}
