import type { PersistContext } from "@/create-store/types/persist-context";

export interface PersistOptions<State> {
  /**
   * Called when reading, writing or removing fails, with the error and where it
   * happened (and the key, for a collection's entry). Without it the error is
   * logged through `console.error`. A throwing handler is logged and ignored: a
   * failing adapter never breaks the store.
   */
  onError?: (error: unknown, context: PersistContext) => void;
  /** Runs after a stored state has been applied, or found to be absent. */
  onHydrated?: (state: State) => void;
  /**
   * Leave the store at its initial value until `hydrate()` is called, so a
   * server render and the first client render agree.
   */
  skipHydration?: boolean;
  /**
   * A persisted store follows its storage: a change made elsewhere (another tab
   * or window, for local storage) is written to the store, and nothing is
   * written back. A removed value resets the store to its initial value. Pass
   * `false` to opt out. An adapter that cannot announce changes is never
   * followed.
   */
  sync?: false;

  /**
   * Debounces writes: a change is written `wait` milliseconds after the last
   * one, and only the last value is written. `persistor.flush()` writes the
   * pending value at once, and disposing flushes it. Reading, hydration and
   * followed changes are never delayed; a change followed from storage while a
   * write is pending wins, and the pending value is dropped. Default: write at
   * once.
   */
  wait?: number;
}
